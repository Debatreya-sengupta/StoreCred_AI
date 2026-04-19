"""
POST /analyze-store route
──────────────────────────
Accepts:
  • images   : 1–5 multipart image files
  • gps      : JSON field {"lat": float, "lon": float}
  • store_id : optional string

Returns:
  AnalyzeStoreResponse with financial estimates + fraud flags
"""

import json
import logging
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from backend.models.schemas import (
    AnalyzeStoreResponse, AnalyzeStoreRequest,
    VisionSignals, GeoSignals, SalesRange, RevenueRange, ErrorResponse,
)
from backend.services.vision_service      import run_vision_pipeline
from backend.services.geo_service         import run_geo_pipeline
from backend.services.feature_service     import run_feature_pipeline
from backend.services.underwriting_service import run_underwriting_pipeline
from backend.services.fraud_service       import run_fraud_pipeline
from configs.config                       import MAX_IMAGES_PER_REQUEST

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/analyze-store",
    response_model=AnalyzeStoreResponse,
    summary="Analyze a kirana store",
    description=(
        "Upload 1–5 store images and provide GPS coordinates. "
        "Returns daily sales range, monthly revenue, income range, "
        "confidence score, and risk flags."
    ),
    tags=["Underwriting"],
)
async def analyze_store(
    images:   List[UploadFile] = File(...,  description="Store images (JPEG/PNG)"),
    gps:      str              = Form(...,  description='JSON string: {"lat": 12.9, "lon": 77.5}'),
    store_id: Optional[str]   = Form(None, description="Optional merchant ID"),
):
    # ── Validate GPS ──────────────────────────────────────────────────
    try:
        gps_data = json.loads(gps)
        lat = float(gps_data["lat"])
        lon = float(gps_data["lon"])
    except (json.JSONDecodeError, KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid GPS format. Expected JSON with 'lat' and 'lon'. Error: {exc}",
        )

    # ── Validate image count ──────────────────────────────────────────
    if len(images) > MAX_IMAGES_PER_REQUEST:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Too many images. Maximum allowed: {MAX_IMAGES_PER_REQUEST}",
        )
    if len(images) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one image is required.",
        )

    logger.info(f"[{store_id or 'anon'}] Analyzing store at ({lat}, {lon}) with {len(images)} images")

    # ── Read image bytes ──────────────────────────────────────────────
    image_bytes_list = []
    for img_file in images:
        content_type = img_file.content_type or ""
        if not content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{img_file.filename}' is not an image (content_type={content_type})",
            )
        raw = await img_file.read()
        image_bytes_list.append(raw)

    # ══ Pipeline Execution ════════════════════════════════════════════

    # 1. Vision
    vision_signals = run_vision_pipeline(image_bytes_list)

    # 2. Geo
    geo_signals = run_geo_pipeline(lat, lon)

    # 3. Feature Engineering
    features = run_feature_pipeline(vision_signals, geo_signals)

    # 4. Underwriting / Fusion Model
    prediction = run_underwriting_pipeline(features)

    # 5. Fraud Detection
    risk_flags = run_fraud_pipeline(features, vision_signals, prediction)

    # ── Build Response ────────────────────────────────────────────────
    response = AnalyzeStoreResponse(
        store_id=store_id,
        sales_range=SalesRange(**prediction["sales_range"]),
        revenue_range=RevenueRange(**prediction["revenue_range"]),
        income_range=RevenueRange(**{**prediction["income_range"], "unit": "INR/month"}),
        confidence_score=prediction["confidence_score"],
        risk_flags=risk_flags,
        vision_signals=VisionSignals(
            shelf_density_index=vision_signals.get("shelf_density_index", 0),
            sku_diversity=vision_signals.get("sku_diversity", 0),
            inventory_score=vision_signals.get("inventory_score", 0),
            total_items_detected=vision_signals.get("total_items_detected", 0),
            unique_classes=vision_signals.get("unique_classes", 0),
            low_light_images=vision_signals.get("low_light_images", 0),
            images_processed=vision_signals.get("images_processed", 0),
        ),
        geo_signals=GeoSignals(
            poi_count=geo_signals.get("poi_count", 0),
            restaurant_count=geo_signals.get("restaurant_count", 0),
            school_count=geo_signals.get("school_count", 0),
            competition_count=geo_signals.get("competition_count", 0),
            road_type_score=geo_signals.get("road_type_score", 0),
            market_area_flag=geo_signals.get("market_area_flag", 0),
            source=geo_signals.get("source", "unknown"),
        ),
        geo_data_source=geo_signals.get("source", "unknown"),
        images_processed=vision_signals.get("images_processed", 0),
        low_light_images=vision_signals.get("low_light_images", 0),
    )

    logger.info(f"[{store_id or 'anon'}] Analysis complete. confidence={prediction['confidence_score']:.2f}, flags={len(risk_flags)}")
    return response
