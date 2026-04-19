"""
Integration Tests — Kirana Store Underwriting API
──────────────────────────────────────────────────
Run with:  pytest tests/ -v
"""

import io
import json
import sys
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient
from PIL import Image

# ── Path setup ────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.main import app

client = TestClient(app)


# ── Helpers ────────────────────────────────────────────────────────────

def _make_image_bytes(width: int = 400, height: int = 300, brightness: int = 120) -> bytes:
    """Create a synthetic RGB image encoded as JPEG bytes."""
    arr = np.full((height, width, 3), brightness, dtype=np.uint8)
    # Add random noise to make it non-trivial
    arr += np.random.randint(0, 30, arr.shape, dtype=np.uint8)
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    buf.seek(0)
    return buf.read()


def _make_dark_image_bytes() -> bytes:
    """Dark image to trigger low-light flag."""
    return _make_image_bytes(brightness=20)


# ── Health Checks ──────────────────────────────────────────────────────

def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "running"


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


# ── Analyze Store — Happy Path ─────────────────────────────────────────

def test_analyze_store_single_image():
    img_bytes = _make_image_bytes()
    gps = json.dumps({"lat": 12.9716, "lon": 77.5946})  # Bangalore

    resp = client.post(
        "/analyze-store",
        data={"gps": gps, "store_id": "test_store_001"},
        files=[("images", ("store.jpg", img_bytes, "image/jpeg"))],
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    # ── Check all required fields ────────────────────────────────────
    assert "sales_range"      in data
    assert "revenue_range"    in data
    assert "income_range"     in data
    assert "confidence_score" in data
    assert "risk_flags"       in data

    # ── Range sanity checks ──────────────────────────────────────────
    sr = data["sales_range"]
    assert sr["low"] >= 0
    assert sr["high"] >= sr["low"]
    assert sr["median"] >= sr["low"]
    assert sr["median"] <= sr["high"]

    assert 0 <= data["confidence_score"] <= 1
    assert isinstance(data["risk_flags"], list)


def test_analyze_store_multiple_images():
    images = [_make_image_bytes(brightness=b) for b in [80, 100, 130, 150]]
    gps    = json.dumps({"lat": 19.0760, "lon": 72.8777})  # Mumbai

    files = [
        ("images", (f"img_{i}.jpg", img, "image/jpeg"))
        for i, img in enumerate(images)
    ]
    resp = client.post(
        "/analyze-store",
        data={"gps": gps},
        files=files,
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["images_processed"] == 4


def test_analyze_store_with_dark_image():
    """Dark image should trigger low_light_images count."""
    img = _make_dark_image_bytes()
    gps = json.dumps({"lat": 28.6139, "lon": 77.2090})  # Delhi

    resp = client.post(
        "/analyze-store",
        data={"gps": gps},
        files=[("images", ("dark.jpg", img, "image/jpeg"))],
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["low_light_images"] >= 1


# ── Validation Errors ──────────────────────────────────────────────────

def test_missing_images_returns_400():
    gps = json.dumps({"lat": 12.9716, "lon": 77.5946})
    # Send no images at all — FastAPI should reject missing required field
    resp = client.post("/analyze-store", data={"gps": gps})
    assert resp.status_code == 422  # FastAPI returns 422 for missing required files


def test_invalid_gps_format():
    img = _make_image_bytes()
    resp = client.post(
        "/analyze-store",
        data={"gps": "not_json"},
        files=[("images", ("store.jpg", img, "image/jpeg"))],
    )
    assert resp.status_code == 422


def test_non_image_file_rejected():
    gps = json.dumps({"lat": 12.9716, "lon": 77.5946})
    resp = client.post(
        "/analyze-store",
        data={"gps": gps},
        files=[("images", ("data.csv", b"col1,col2\n1,2", "text/csv"))],
    )
    assert resp.status_code == 400


def test_too_many_images_rejected():
    gps    = json.dumps({"lat": 12.9716, "lon": 77.5946})
    images = [_make_image_bytes() for _ in range(6)]  # exceeds MAX=5
    files  = [("images", (f"img_{i}.jpg", img, "image/jpeg")) for i, img in enumerate(images)]
    resp   = client.post("/analyze-store", data={"gps": gps}, files=files)
    assert resp.status_code == 400


# ── Unit Tests — Feature Engineering ──────────────────────────────────

def test_feature_builder_output_shape():
    from ml.feature_engineering.feature_builder import build_features

    vision = {"shelf_density_index": 0.5, "sku_diversity": 0.4, "inventory_score": 0.6}
    geo    = {"poi_count": 25, "restaurant_count": 5, "school_count": 2,
               "competition_count": 3, "road_type_score": 0.8, "market_area_flag": 1}
    feats  = build_features(vision, geo)

    required = ["demand_score", "footfall_index", "inventory_proxy",
                "competition_pressure", "location_quality", "sku_richness"]
    for key in required:
        assert key in feats, f"Missing feature: {key}"
        assert 0.0 <= feats[key] <= 1.5, f"{key} out of expected range: {feats[key]}"


# ── Unit Tests — Fraud Detection ───────────────────────────────────────

def test_fraud_inventory_footfall_mismatch():
    from ml.fraud_detection.fraud_checker import detect_fraud_flags

    features = {"inventory_proxy": 0.95, "footfall_index": 0.05, "demand_score": 0.3,
                "location_quality": 0.5}
    vision   = {"total_items_detected": 30, "sku_diversity_variance": 0.01,
                "shelf_density_index_variance": 0.01}
    pred     = {"sales_range": {"high": 5000}, "confidence_score": 0.7}

    flags = detect_fraud_flags(features, vision, pred)
    assert any("FOOTFALL" in f or "INVENTORY" in f for f in flags), \
        f"Expected mismatch flag, got: {flags}"


def test_no_fraud_clean_store():
    from ml.fraud_detection.fraud_checker import detect_fraud_flags

    features = {"inventory_proxy": 0.5, "footfall_index": 0.4, "demand_score": 0.5,
                "location_quality": 0.5}
    vision   = {"total_items_detected": 15, "sku_diversity_variance": 0.01,
                "shelf_density_index_variance": 0.01}
    pred     = {"sales_range": {"high": 10000}, "confidence_score": 0.7}

    flags = detect_fraud_flags(features, vision, pred)
    assert flags == [], f"Expected no flags for clean store, got: {flags}"


# ── Synthetic Data ─────────────────────────────────────────────────────

def test_synthetic_data_generation():
    from data.synthetic.generate_data import generate
    df = generate(n=100)
    assert len(df) == 100
    assert "daily_sales"     in df.columns
    assert "monthly_revenue" in df.columns
    assert "monthly_income"  in df.columns
    assert (df["daily_sales"] > 0).all()
    assert (df["monthly_revenue"] >= df["daily_sales"]).all()
