"""
LightGBM Fusion Model — Prediction
────────────────────────────────────
Loads the saved artifact and returns:
  • sales_range        : (low, high) daily sales in ₹
  • revenue_range      : (low, high) monthly revenue in ₹
  • income_range       : (low, high) monthly income in ₹
  • point_estimates    : median predictions for all three targets
  • confidence_score   : 0–1 score derived from interval tightness

If the model file is missing the module trains it on first call.
"""

import logging
import math
from pathlib import Path
from typing import Dict, Any, Tuple

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

_artifact = None   # module-level cache


def _get_artifact():
    global _artifact
    if _artifact is not None:
        return _artifact

    from configs.config import LGBM_MODEL_FILE
    if LGBM_MODEL_FILE.exists():
        logger.info(f"Loading model from {LGBM_MODEL_FILE}")
        _artifact = joblib.load(LGBM_MODEL_FILE)
    else:
        logger.warning("No trained model found. Training now on synthetic data …")
        import sys
        sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
        from ml.fusion_model.train import train
        _artifact = train()
    return _artifact


def predict(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Parameters
    ----------
    features : dict from feature_builder.build_features()

    Returns
    -------
    dict with sales_range, revenue_range, income_range,
              point_estimates, confidence_score
    """
    artifact = _get_artifact()
    models       = artifact["models"]
    feature_cols = artifact["feature_cols"]

    # Build input DataFrame (handles missing cols gracefully)
    row = {col: [features.get(col, 0.0)] for col in feature_cols}
    X   = pd.DataFrame(row)

    results = {}
    interval_ratios = []

    for target in artifact["target_cols"]:
        lo  = float(models[target]["lo"].predict(X)[0])
        mid = float(models[target]["mid"].predict(X)[0])
        hi  = float(models[target]["hi"].predict(X)[0])

        # Ensure ordering (quantile crossing can sometimes happen)
        lo, mid, hi = sorted([lo, mid, hi])
        lo  = max(lo, 0)

        results[target] = {"lo": round(lo, 0), "mid": round(mid, 0), "hi": round(hi, 0)}

        # Relative interval width (tighter = more confident)
        if mid > 0:
            interval_ratios.append((hi - lo) / mid)

    # ── Confidence Score ──────────────────────────────────────────────
    # Map mean relative interval width to [0, 1]
    # Width of 0.5 (50% spread) → confidence ≈ 0.5
    mean_ratio = sum(interval_ratios) / len(interval_ratios) if interval_ratios else 1.0
    confidence_score = round(1.0 / (1.0 + mean_ratio), 4)

    return {
        "sales_range": {
            "low":    results["daily_sales"]["lo"],
            "high":   results["daily_sales"]["hi"],
            "median": results["daily_sales"]["mid"],
            "unit":   "INR/day",
        },
        "revenue_range": {
            "low":    results["monthly_revenue"]["lo"],
            "high":   results["monthly_revenue"]["hi"],
            "median": results["monthly_revenue"]["mid"],
            "unit":   "INR/month",
        },
        "income_range": {
            "low":    results["monthly_income"]["lo"],
            "high":   results["monthly_income"]["hi"],
            "median": results["monthly_income"]["mid"],
            "unit":   "INR/month",
        },
        "confidence_score": confidence_score,
    }
