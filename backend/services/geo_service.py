"""
Geo Service
────────────
Thin wrapper around ml/geo/geo_features.py for use by the API layer.
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from ml.geo.geo_features import fetch_geo_features
from configs.config import GEO_RADIUS_METERS, OVERPASS_API_URL

logger = logging.getLogger(__name__)


def run_geo_pipeline(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetch geo signals for the given GPS coordinates.
    The underlying module handles mock fallback automatically.
    """
    logger.info(f"Running geo pipeline for ({lat}, {lon})")
    return fetch_geo_features(
        lat=lat,
        lon=lon,
        radius=GEO_RADIUS_METERS,
        overpass_url=OVERPASS_API_URL,
    )
