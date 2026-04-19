"""
YOLOv8 Inference Wrapper
────────────────────────
• Tries to load real YOLOv8 weights.
• If weights are missing or ultralytics is unavailable → falls back to
  deterministic mock detections so the rest of the pipeline still runs.
"""

import logging
import random
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# ── Constants ──────────────────────────────────────────────────────
_MOCK_CLASSES = [
    "biscuit_pack", "chips_bag", "soft_drink_bottle", "cooking_oil",
    "rice_bag", "soap_bar", "shampoo_bottle", "dal_packet", "tea_packet",
    "sugar_bag", "bread_loaf", "milk_pouch", "instant_noodles",
    "detergent_pack", "spice_bottle",
]


def _load_model(weights_path: Path):
    """Attempt to load YOLOv8 model; return None on failure."""
    try:
        from ultralytics import YOLO  # type: ignore
        if weights_path.exists():
            logger.info(f"Loading YOLOv8 from {weights_path}")
            return YOLO(str(weights_path))
        else:
            # ultralytics will auto-download yolov8n.pt on first call
            logger.info("Weights not found locally – attempting auto-download of yolov8n")
            model = YOLO("yolov8n.pt")
            return model
    except Exception as exc:
        logger.warning(f"YOLOv8 load failed ({exc}). Using mock inference.")
        return None


class YoloInference:
    """
    Thin wrapper around YOLOv8 that provides a consistent interface
    regardless of whether real weights are available.
    """

    def __init__(self, weights_path: Path | None = None):
        from configs.config import YOLO_WEIGHTS
        path = weights_path or YOLO_WEIGHTS
        self._model = _load_model(path)
        self._is_mock = self._model is None

    # ── Public API ─────────────────────────────────────────────────

    def predict(self, image_array) -> List[Dict[str, Any]]:
        """
        Run inference on a single BGR numpy image.

        Returns
        -------
        list of dicts:
            {class_name, confidence, bbox: [x1,y1,x2,y2]}
        """
        if self._is_mock:
            return self._mock_detections(image_array)
        return self._real_predict(image_array)

    # ── Private ────────────────────────────────────────────────────

    def _real_predict(self, image_array) -> List[Dict[str, Any]]:
        """Run actual YOLOv8 inference."""
        try:
            results = self._model(image_array, verbose=False)
            detections = []
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    cls_name = r.names.get(cls_id, f"class_{cls_id}")
                    conf = float(box.conf[0])
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    detections.append({
                        "class_name": cls_name,
                        "confidence": round(conf, 4),
                        "bbox": [x1, y1, x2, y2],
                    })
            return detections
        except Exception as exc:
            logger.error(f"Real YOLO inference failed: {exc}. Falling back to mock.")
            return self._mock_detections(image_array)

    def _mock_detections(self, image_array) -> List[Dict[str, Any]]:
        """
        Generate plausible mock detections seeded on image content
        (mean pixel value) so the same image always produces the same output.
        """
        import numpy as np
        seed = int(image_array.mean()) if image_array is not None else 42
        rng = random.Random(seed)

        h, w = (image_array.shape[:2] if image_array is not None else (640, 480))
        n_detections = rng.randint(6, 20)
        detections = []
        for _ in range(n_detections):
            cls = rng.choice(_MOCK_CLASSES)
            x1 = rng.uniform(0, w * 0.8)
            y1 = rng.uniform(0, h * 0.8)
            x2 = x1 + rng.uniform(20, w * 0.2)
            y2 = y1 + rng.uniform(20, h * 0.2)
            conf = rng.uniform(0.35, 0.95)
            detections.append({
                "class_name": cls,
                "confidence": round(conf, 4),
                "bbox": [x1, y1, x2, y2],
            })
        logger.debug(f"[MOCK] Generated {n_detections} detections")
        return detections
