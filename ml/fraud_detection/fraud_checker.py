"""
Fraud Detection Module
───────────────────────
Rule-based checks for signal inconsistencies in kirana store analysis.

Checks:
  1. Inventory–Footfall Mismatch  — huge inventory but near-zero footfall
  2. Low Confidence + High Claims — model very uncertain but unusually high revenue
  3. Multi-Image Inconsistency    — large variance across supplied images
  4. Suspiciously Empty Shelves   — nearly no detections despite multiple images
  5. Location–Inventory Conflict  — prime location but bare shelves (possible staging)
"""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# ── Thresholds ────────────────────────────────────────────────────────
_INVENTORY_FOOTFALL_MAX    = 4.0    # inventory_proxy / footfall_index ratio
_SKU_VARIANCE_FLAG         = 0.08   # variance across images
_MIN_DETECTIONS_PER_IMAGE  = 3      # expected minimum items per image
_HIGH_REVENUE_THRESHOLD    = 60_000 # daily sales ₹ considered very high


def detect_fraud_flags(
    features: Dict[str, float],
    vision_signals: Dict[str, float],
    prediction: Dict[str, Any],
) -> List[str]:
    """
    Run all fraud checks and return a list of flag strings.

    Parameters
    ----------
    features       : engineered feature vector
    vision_signals : raw vision output (includes _variance keys)
    prediction     : output from predict.predict()

    Returns
    -------
    list of human-readable risk flag strings (empty = clean)
    """
    flags = []

    inventory = features.get("inventory_proxy", 0)
    footfall  = features.get("footfall_index", 0)
    demand    = features.get("demand_score", 0)

    # ── Check 1: Inventory–Footfall Mismatch ─────────────────────────
    if footfall > 0.01 and (inventory / footfall) > _INVENTORY_FOOTFALL_MAX:
        flags.append(
            f"INVENTORY_FOOTFALL_MISMATCH: inventory_proxy={inventory:.2f} "
            f"is very high relative to footfall_index={footfall:.2f}"
        )
    elif footfall < 0.05 and inventory > 0.60:
        flags.append(
            "LOW_FOOTFALL_HIGH_INVENTORY: Near-zero foot traffic but densely stocked shelves"
        )

    # ── Check 2: Multi-Image SKU Variance ────────────────────────────
    sku_var = vision_signals.get("sku_diversity_variance", 0)
    if sku_var > _SKU_VARIANCE_FLAG:
        flags.append(
            f"IMAGE_INCONSISTENCY: SKU diversity varies significantly across images "
            f"(variance={sku_var:.4f}). Possible staging or mixed-store images."
        )

    shelf_var = vision_signals.get("shelf_density_index_variance", 0)
    if shelf_var > _SKU_VARIANCE_FLAG:
        flags.append(
            f"SHELF_DENSITY_INCONSISTENCY: Shelf density varies across images "
            f"(variance={shelf_var:.4f})."
        )

    # ── Check 3: Bare Shelves Warning ────────────────────────────────
    if vision_signals.get("total_items_detected", 0) < _MIN_DETECTIONS_PER_IMAGE:
        flags.append(
            "SPARSE_DETECTIONS: Very few products detected. "
            "Low quality images, empty store, or lighting issues."
        )

    # ── Check 4: Prime Location + Bare Shelves ───────────────────────
    location_quality = features.get("location_quality", 0)
    if location_quality > 0.7 and inventory < 0.25:
        flags.append(
            "LOCATION_INVENTORY_CONFLICT: High-value location with low inventory — "
            "possible store photos taken at non-operational time."
        )

    # ── Check 5: Unusually High Revenue Claim ────────────────────────
    predicted_daily_hi = prediction.get("sales_range", {}).get("high", 0)
    conf = prediction.get("confidence_score", 1.0)
    if predicted_daily_hi > _HIGH_REVENUE_THRESHOLD and conf < 0.40:
        flags.append(
            f"HIGH_REVENUE_LOW_CONFIDENCE: Predicted daily sales up to "
            f"₹{predicted_daily_hi:,.0f} but model confidence is only {conf:.0%}."
        )

    if flags:
        logger.warning(f"Fraud flags detected: {flags}")
    else:
        logger.info("No fraud flags detected.")

    return flags
