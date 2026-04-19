# ═══════════════════════════════════════════════════════════════════
#  Remote Cash Flow Underwriting for Kirana Stores
#  Central Configuration
# ═══════════════════════════════════════════════════════════════════

import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
MODEL_DIR = ROOT_DIR / "ml" / "fusion_model" / "artifacts"
YOLO_WEIGHTS = ROOT_DIR / "ml" / "vision" / "weights" / "yolov8n.pt"

# Ensure critical dirs exist
MODEL_DIR.mkdir(parents=True, exist_ok=True)
(ROOT_DIR / "ml" / "vision" / "weights").mkdir(parents=True, exist_ok=True)

# ── API Keys (loaded from .env) ────────────────────────────────────
# TODO: Replace with real keys for production
OVERPASS_API_URL = os.getenv("OVERPASS_API_URL", "https://overpass-api.de/api/interpreter")
GOOGLE_MAPS_KEY  = os.getenv("GOOGLE_MAPS_API_KEY", "")  # optional

# ── Vision Thresholds ──────────────────────────────────────────────
LOW_LIGHT_THRESHOLD     = 60      # mean pixel brightness below this → low-light flag
MIN_DETECTION_CONF      = 0.30    # minimum YOLO confidence to count a detection
MAX_IMAGES_PER_REQUEST  = 5

# ── Geo Settings ───────────────────────────────────────────────────
GEO_RADIUS_METERS     = 500       # search radius around store location
COMPETITION_RADIUS    = 300       # radius to check competing stores

# ── Model Settings ─────────────────────────────────────────────────
LGBM_MODEL_FILE   = MODEL_DIR / "lgbm_fusion.pkl"
LGBM_QUANTILE_LO  = 0.10         # lower bound of revenue estimate
LGBM_QUANTILE_HI  = 0.90         # upper bound of revenue estimate

# ── Fraud Thresholds ───────────────────────────────────────────────
FRAUD_INVENTORY_FOOTFALL_RATIO_MAX = 5.0   # high inventory / low footfall → suspicious
FRAUD_SKU_VARIANCE_MAX             = 0.40  # max allowed variance across images
