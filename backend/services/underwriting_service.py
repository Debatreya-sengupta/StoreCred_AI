"""
Underwriting Service
─────────────────────
Calls the LightGBM fusion model to produce financial estimates.
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from ml.fusion_model.predict import predict

logger = logging.getLogger(__name__)


def run_underwriting_pipeline(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Run the fusion model and return structured financial predictions.
    """
    logger.info("Running underwriting model …")
    result = predict(features)
    logger.info(
        f"Underwriting result: daily_sales={result['sales_range']['median']:.0f}, "
        f"monthly_revenue={result['revenue_range']['median']:.0f}, "
        f"confidence={result['confidence_score']:.2f}"
    )
    return result
