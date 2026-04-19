"""
Shelf Analyzer
──────────────
Converts raw YOLO detections into higher-level inventory signals:
  • shelf_density_index   – how packed the shelves are (0–1)
  • sku_diversity         – number of distinct product types (normalized)
  • inventory_score       – proxy for total stock volume (0–1)
"""

import logging
import math
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)


def analyze_shelf(
    detections: List[Dict[str, Any]],
    image_shape: Tuple[int, int] = (640, 480),
    min_confidence: float = 0.30,
) -> Dict[str, float]:
    """
    Parameters
    ----------
    detections  : list of YOLO detection dicts
    image_shape : (height, width) of source image
    min_confidence : filter detections below this threshold

    Returns
    -------
    dict with keys:
        shelf_density_index, sku_diversity, inventory_score,
        total_items_detected, unique_classes
    """
    # ── Filter by confidence ────────────────────────────────────────
    dets = [d for d in detections if d.get("confidence", 0) >= min_confidence]

    if not dets:
        logger.warning("No valid detections – returning zero shelf signals")
        return _zero_signals()

    h, w = image_shape
    image_area = h * w

    # ── Shelf Density Index ─────────────────────────────────────────
    # Total bounding-box area / image area (capped at 1)
    total_bbox_area = sum(_bbox_area(d["bbox"]) for d in dets)
    shelf_density = min(total_bbox_area / max(image_area, 1), 1.0)

    # ── SKU Diversity ───────────────────────────────────────────────
    unique_classes = set(d["class_name"] for d in dets)
    # Normalize: assume a well-stocked store carries 30+ distinct SKUs
    MAX_EXPECTED_SKUS = 30
    sku_diversity = min(len(unique_classes) / MAX_EXPECTED_SKUS, 1.0)

    # ── Inventory Score ─────────────────────────────────────────────
    # Composite: detection count (normalized) × average confidence
    MAX_EXPECTED_ITEMS = 50
    count_score = min(len(dets) / MAX_EXPECTED_ITEMS, 1.0)
    avg_conf = sum(d["confidence"] for d in dets) / len(dets)
    inventory_score = (count_score * 0.7) + (avg_conf * 0.3)

    result = {
        "shelf_density_index": round(shelf_density, 4),
        "sku_diversity": round(sku_diversity, 4),
        "inventory_score": round(inventory_score, 4),
        "total_items_detected": len(dets),
        "unique_classes": len(unique_classes),
    }
    logger.info(f"Shelf analysis: {result}")
    return result


def aggregate_multi_image(signals_list: List[Dict[str, float]]) -> Dict[str, float]:
    """
    Average shelf signals across multiple store images.
    Also computes variance — used later by fraud detection.
    """
    if not signals_list:
        return _zero_signals()

    keys = ["shelf_density_index", "sku_diversity", "inventory_score"]
    aggregated = {}
    for k in keys:
        values = [s.get(k, 0.0) for s in signals_list]
        aggregated[k] = round(sum(values) / len(values), 4)
        aggregated[f"{k}_variance"] = round(_variance(values), 6)

    aggregated["total_items_detected"] = int(
        sum(s.get("total_items_detected", 0) for s in signals_list) / len(signals_list)
    )
    aggregated["unique_classes"] = int(
        sum(s.get("unique_classes", 0) for s in signals_list) / len(signals_list)
    )
    return aggregated


# ── Helpers ─────────────────────────────────────────────────────────

def _bbox_area(bbox: List[float]) -> float:
    x1, y1, x2, y2 = bbox
    return max(0, x2 - x1) * max(0, y2 - y1)


def _variance(values: List[float]) -> float:
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    return sum((v - mean) ** 2 for v in values) / len(values)


def _zero_signals() -> Dict[str, float]:
    return {
        "shelf_density_index": 0.0,
        "sku_diversity": 0.0,
        "inventory_score": 0.0,
        "total_items_detected": 0,
        "unique_classes": 0,
        "shelf_density_index_variance": 0.0,
        "sku_diversity_variance": 0.0,
        "inventory_score_variance": 0.0,
    }
