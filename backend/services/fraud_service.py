"""
Fraud Service
──────────────
Wraps the fraud detection module for the API layer.
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any, List

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from ml.fraud_detection.fraud_checker import detect_fraud_flags

logger = logging.getLogger(__name__)


def run_fraud_pipeline(
    features: Dict[str, float],
    vision_signals: Dict[str, Any],
    prediction: Dict[str, Any],
) -> List[str]:
    logger.info("Running fraud detection …")
    flags = detect_fraud_flags(features, vision_signals, prediction)
    return flags
