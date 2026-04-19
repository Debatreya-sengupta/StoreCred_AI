"""
Feature Engineering
────────────────────
Combines vision signals + geo signals into a compact feature vector
with economic meaning suitable for the LightGBM fusion model.

Final Features
──────────────
  demand_score          – weighted composite of footfall & geo proxies
  inventory_proxy       – scaled inventory / shelf density composite
  footfall_index        – number of people likely to pass the store daily
  competition_pressure  – how saturated the local market is
  location_quality      – road type + POI richness score
  sku_richness          – sku_diversity adjusted for store size proxy
"""

import logging
import math
from typing import Dict, Any

import numpy as np

logger = logging.getLogger(__name__)

# ── Weights (tuned for kirana context) ──────────────────────────────
_DEMAND_WEIGHTS = {
    "poi_count":         0.25,
    "restaurant_count":  0.20,
    "school_count":      0.15,
    "road_type_score":   0.20,
    "market_area_flag":  0.20,
}


def build_features(
    vision_signals: Dict[str, float],
    geo_signals: Dict[str, Any],
) -> Dict[str, float]:
    """
    Combine vision + geo into model-ready features.

    Parameters
    ----------
    vision_signals : output from shelf_analyzer.analyze_shelf()
    geo_signals    : output from geo_features.fetch_geo_features()

    Returns
    -------
    dict of float features + raw passthrough signals
    """
    # ── Normalise geo counts ─────────────────────────────────────────
    poi_norm         = _sigmoid_norm(geo_signals.get("poi_count", 10),        scale=50)
    restaurant_norm  = _sigmoid_norm(geo_signals.get("restaurant_count", 3),  scale=15)
    school_norm      = _sigmoid_norm(geo_signals.get("school_count", 1),      scale=5)
    road_score       = float(geo_signals.get("road_type_score", 0.4))
    market_flag      = float(geo_signals.get("market_area_flag", 0))
    competition_norm = _sigmoid_norm(geo_signals.get("competition_count", 2), scale=10)

    # ── Demand Score ────────────────────────────────────────────────
    demand_score = (
        _DEMAND_WEIGHTS["poi_count"]         * poi_norm +
        _DEMAND_WEIGHTS["restaurant_count"]  * restaurant_norm +
        _DEMAND_WEIGHTS["school_count"]      * school_norm +
        _DEMAND_WEIGHTS["road_type_score"]   * road_score +
        _DEMAND_WEIGHTS["market_area_flag"]  * market_flag
    )

    # ── Footfall Index ───────────────────────────────────────────────
    # Proxy: POIs + roads drive foot traffic; schools add predictable peaks
    footfall_index = (
        0.40 * poi_norm +
        0.30 * road_score +
        0.20 * restaurant_norm +
        0.10 * school_norm
    )

    # ── Inventory Proxy ──────────────────────────────────────────────
    shelf_density = vision_signals.get("shelf_density_index", 0.3)
    inventory_sc  = vision_signals.get("inventory_score", 0.3)
    sku_div       = vision_signals.get("sku_diversity", 0.3)
    inventory_proxy = (shelf_density * 0.4) + (inventory_sc * 0.4) + (sku_div * 0.2)

    # ── Competition Pressure ─────────────────────────────────────────
    competition_pressure = competition_norm  # high = saturated market

    # ── Location Quality ─────────────────────────────────────────────
    location_quality = (road_score * 0.6) + (poi_norm * 0.4)

    # ── SKU Richness ─────────────────────────────────────────────────
    sku_richness = sku_div * (1 + 0.3 * market_flag)

    features = {
        # Engineered features
        "demand_score":          round(demand_score,          4),
        "footfall_index":        round(footfall_index,        4),
        "inventory_proxy":       round(inventory_proxy,       4),
        "competition_pressure":  round(competition_pressure,  4),
        "location_quality":      round(location_quality,      4),
        "sku_richness":          round(min(sku_richness, 1.0),4),
        # Raw passthrough (useful for model + interpretability)
        "shelf_density_index":   round(shelf_density, 4),
        "inventory_score":       round(inventory_sc,  4),
        "sku_diversity":         round(sku_div,        4),
        "road_type_score":       road_score,
        "market_area_flag":      int(market_flag),
        "poi_count_norm":        round(poi_norm, 4),
        "competition_norm":      round(competition_norm, 4),
    }

    logger.info(f"Feature vector: {features}")
    return features


# ── Helpers ──────────────────────────────────────────────────────────

def _sigmoid_norm(value: float, scale: float = 10.0) -> float:
    """Map [0, ∞) to (0, 1) via sigmoid-like function: x/(x+scale)."""
    return float(value) / (float(value) + scale)
