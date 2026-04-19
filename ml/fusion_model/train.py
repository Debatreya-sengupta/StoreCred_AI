"""
LightGBM Fusion Model — Training
──────────────────────────────────
Trains three quantile-regression LightGBM models for:
  • daily_sales
  • monthly_revenue
  • monthly_income

Each target gets three models:
  Q10 (lower bound), Q50 (median/point estimate), Q90 (upper bound)

This enables uncertainty-aware range predictions without a separate
uncertainty module.

Usage:
  python ml/fusion_model/train.py
"""

import logging
import sys
from pathlib import Path

# ── Path fix so configs + data imports work ──────────────────────────
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

from data.synthetic.generate_data import generate as generate_data
from configs.config import LGBM_MODEL_FILE, LGBM_QUANTILE_LO, LGBM_QUANTILE_HI

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ── Feature columns fed to LightGBM ────────────────────────────────
FEATURE_COLS = [
    "demand_score", "footfall_index", "inventory_proxy",
    "competition_pressure", "location_quality", "sku_richness",
    "shelf_density_index", "inventory_score", "sku_diversity",
    "road_type_score", "market_area_flag", "poi_count_norm",
    "competition_norm",
]
TARGET_COLS = ["daily_sales", "monthly_revenue", "monthly_income"]
QUANTILES = {
    "lo":  LGBM_QUANTILE_LO,
    "mid": 0.50,
    "hi":  LGBM_QUANTILE_HI,
}

# ── LightGBM params ──────────────────────────────────────────────────
_BASE_PARAMS = {
    "objective":        "quantile",
    "metric":           "quantile",
    "n_estimators":     500,
    "learning_rate":    0.05,
    "num_leaves":       63,
    "min_child_samples": 20,
    "subsample":        0.8,
    "colsample_bytree": 0.8,
    "reg_alpha":        0.1,
    "reg_lambda":       0.1,
    "verbose":          -1,
    "n_jobs":           -1,
}


def train():
    # ── Data ─────────────────────────────────────────────────────────
    logger.info("Generating synthetic training data …")
    df = generate_data(n=5000)
    X = df[FEATURE_COLS]
    y = {col: df[col] for col in TARGET_COLS}

    # ── Train/Val split ──────────────────────────────────────────────
    X_train, X_val = train_test_split(X, test_size=0.15, random_state=42)
    y_train = {col: y[col].iloc[X_train.index] for col in TARGET_COLS}
    y_val   = {col: y[col].iloc[X_val.index]   for col in TARGET_COLS}

    models = {}

    for target in TARGET_COLS:
        models[target] = {}
        for q_label, q_val in QUANTILES.items():
            params = {**_BASE_PARAMS, "alpha": q_val}
            model = lgb.LGBMRegressor(**params)
            model.fit(
                X_train, y_train[target],
                eval_set=[(X_val, y_val[target])],
                callbacks=[lgb.early_stopping(50, verbose=False),
                           lgb.log_evaluation(100)],
            )
            models[target][q_label] = model

            preds = model.predict(X_val)
            mae = mean_absolute_error(y_val[target], preds)
            logger.info(f"  {target} Q{int(q_val*100):02d} MAE = ₹{mae:,.0f}")

    # ── Save all models in one file ───────────────────────────────────
    artifact = {
        "models":       models,
        "feature_cols": FEATURE_COLS,
        "target_cols":  TARGET_COLS,
        "quantiles":    QUANTILES,
    }
    LGBM_MODEL_FILE.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, LGBM_MODEL_FILE)
    logger.info(f"Model saved → {LGBM_MODEL_FILE}")
    return artifact


if __name__ == "__main__":
    train()
