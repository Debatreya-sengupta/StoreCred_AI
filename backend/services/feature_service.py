"""
Feature Service
────────────────
Calls feature_builder.build_features() and returns the feature dict.
Thin wrapper kept for consistency and future extensibility.
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from ml.feature_engineering.feature_builder import build_features

logger = logging.getLogger(__name__)


def run_feature_pipeline(
    vision_signals: Dict[str, Any],
    geo_signals: Dict[str, Any],
) -> Dict[str, float]:
    logger.info("Building feature vector …")
    return build_features(vision_signals, geo_signals)
