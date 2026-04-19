"""
Image Utilities
───────────────
Handles image loading, validation, and preprocessing for the vision pipeline.
"""

import io
import logging
from typing import Optional, Tuple

import cv2
import numpy as np
from PIL import Image, ExifTags

logger = logging.getLogger(__name__)


def load_image_from_bytes(raw: bytes) -> Optional[np.ndarray]:
    """
    Decode raw bytes → BGR numpy array (OpenCV format).
    Returns None if decoding fails.
    """
    try:
        pil_img = Image.open(io.BytesIO(raw))
        pil_img = _fix_exif_rotation(pil_img)
        pil_img = pil_img.convert("RGB")
        arr = np.array(pil_img)
        bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
        return bgr
    except Exception as exc:
        logger.error(f"Failed to decode image: {exc}")
        return None


def preprocess_image(
    img: np.ndarray,
    target_size: Tuple[int, int] = (640, 640),
) -> np.ndarray:
    """
    Resize + normalise an image for YOLOv8 input.
    Preserves aspect ratio with letterboxing.
    """
    h, w = img.shape[:2]
    th, tw = target_size

    scale = min(tw / w, th / h)
    new_w, new_h = int(w * scale), int(h * scale)
    resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_LINEAR)

    # Letterbox padding
    canvas = np.full((th, tw, 3), 114, dtype=np.uint8)
    pad_y = (th - new_h) // 2
    pad_x = (tw - new_w) // 2
    canvas[pad_y:pad_y + new_h, pad_x:pad_x + new_w] = resized
    return canvas


def is_low_light(img: np.ndarray, threshold: int = 60) -> bool:
    """
    Returns True if the image is too dark for reliable analysis.
    Uses mean brightness on the V channel of HSV.
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    mean_brightness = float(hsv[:, :, 2].mean())
    if mean_brightness < threshold:
        logger.warning(f"Low light detected: mean brightness = {mean_brightness:.1f}")
        return True
    return False


def get_image_shape(img: np.ndarray) -> Tuple[int, int]:
    """Returns (height, width)."""
    return img.shape[:2]


# ── Helpers ──────────────────────────────────────────────────────────

def _fix_exif_rotation(img: Image.Image) -> Image.Image:
    """Auto-rotate image based on EXIF orientation tag."""
    try:
        exif = img._getexif()
        if exif is None:
            return img
        for tag, val in exif.items():
            if ExifTags.TAGS.get(tag) == "Orientation":
                rotations = {3: 180, 6: 270, 8: 90}
                angle = rotations.get(val)
                if angle:
                    img = img.rotate(angle, expand=True)
                break
    except Exception:
        pass  # EXIF not available — ignore
    return img
