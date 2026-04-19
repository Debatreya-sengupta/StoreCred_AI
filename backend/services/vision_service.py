"""
Vision Service
──────────────
Orchestrates image loading → YOLO inference → shelf analysis
across multiple uploaded images.
"""

import sys
import logging
from pathlib import Path
from typing import List, Dict, Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from backend.utils.image_utils import (
    load_image_from_bytes, preprocess_image, is_low_light, get_image_shape
)
from ml.vision.yolo_inference import YoloInference
from ml.vision.shelf_analyzer import analyze_shelf, aggregate_multi_image
from configs.config import MIN_DETECTION_CONF, LOW_LIGHT_THRESHOLD

logger = logging.getLogger(__name__)

# Singleton YOLO instance (lazy-loaded)
_yolo: YoloInference | None = None


def _get_yolo() -> YoloInference:
    global _yolo
    if _yolo is None:
        _yolo = YoloInference()
    return _yolo


def run_vision_pipeline(image_bytes_list: List[bytes]) -> Dict[str, Any]:
    """
    Process a list of raw image bytes through the full vision pipeline.

    Returns aggregated signals dict.
    """
    if not image_bytes_list:
        logger.warning("No images provided to vision pipeline")
        return _empty_vision_output()

    yolo = _get_yolo()
    all_signals = []
    low_light_count = 0

    for i, raw in enumerate(image_bytes_list):
        img = load_image_from_bytes(raw)
        if img is None:
            logger.warning(f"Skipping image {i}: decode failure")
            continue

        # ── Low-light check ──────────────────────────────────────────
        if is_low_light(img, threshold=LOW_LIGHT_THRESHOLD):
            low_light_count += 1
            logger.info(f"Image {i}: low-light detected, still processing")

        # ── Preprocess + Inference ───────────────────────────────────
        preprocessed = preprocess_image(img)
        detections   = yolo.predict(preprocessed)

        # ── Shelf analysis ───────────────────────────────────────────
        shape   = get_image_shape(img)
        signals = analyze_shelf(detections, image_shape=shape,
                                min_confidence=MIN_DETECTION_CONF)
        all_signals.append(signals)
        logger.info(f"Image {i}: {len(detections)} detections, signals={signals}")

    if not all_signals:
        logger.error("All images failed to process")
        return _empty_vision_output()

    # ── Aggregate across images ──────────────────────────────────────
    aggregated = aggregate_multi_image(all_signals)
    aggregated["images_processed"] = len(all_signals)
    aggregated["low_light_images"] = low_light_count
    return aggregated


def _empty_vision_output() -> Dict[str, Any]:
    return {
        "shelf_density_index": 0.0,
        "sku_diversity":       0.0,
        "inventory_score":     0.0,
        "total_items_detected": 0,
        "unique_classes":      0,
        "images_processed":    0,
        "low_light_images":    0,
        "shelf_density_index_variance": 0.0,
        "sku_diversity_variance":       0.0,
        "inventory_score_variance":     0.0,
    }
