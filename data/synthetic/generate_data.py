"""
Synthetic Data Generator
─────────────────────────
Generates realistic synthetic training data for the LightGBM fusion model.

Each row represents one kirana store with:
  • Engineered features (demand_score, inventory_proxy, …)
  • Target variables: daily_sales, monthly_revenue, monthly_income

Indian kirana store revenue statistics (NSSO / industry reports):
  • Micro store  : ₹1,000–3,000/day
  • Small store  : ₹3,000–10,000/day
  • Medium store : ₹10,000–50,000/day
  • Urban prime  : ₹50,000+/day
"""

import math
import random
import pandas as pd
import numpy as np
from pathlib import Path

SEED = 42
N_SAMPLES = 5_000


def generate(n: int = N_SAMPLES, seed: int = SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    # ── Feature sampling ─────────────────────────────────────────────
    demand_score         = rng.beta(2, 2, n)          # 0–1
    footfall_index       = rng.beta(2, 3, n)          # 0–1
    inventory_proxy      = rng.beta(3, 2, n)          # 0–1
    competition_pressure = rng.beta(2, 4, n)          # 0–1, lower = better
    location_quality     = rng.beta(2, 2, n)          # 0–1
    sku_richness         = np.clip(inventory_proxy + rng.normal(0, 0.1, n), 0, 1)
    shelf_density_index  = np.clip(inventory_proxy + rng.normal(0, 0.05, n), 0, 1)
    inventory_score      = inventory_proxy
    sku_diversity        = np.clip(sku_richness + rng.normal(0, 0.05, n), 0, 1)
    road_type_score      = rng.choice([0.2, 0.5, 0.8, 1.0], n)
    market_area_flag     = (road_type_score > 0.5).astype(int)
    poi_count_norm       = np.clip(footfall_index + rng.normal(0, 0.1, n), 0, 1)
    competition_norm     = competition_pressure

    # ── Revenue model (domain-informed) ─────────────────────────────
    # Base daily sales: ₹2,000 (micro) to ₹60,000 (urban prime)
    base_daily = (
        2000
        + 20000 * demand_score
        + 15000 * inventory_proxy
        + 10000 * location_quality
        - 5000  * competition_pressure
        + 8000  * market_area_flag
        + rng.normal(0, 1500, n)   # noise
    )
    base_daily = np.clip(base_daily, 800, 80000)

    # Monthly revenue = daily × ~28 operational days
    monthly_revenue = base_daily * 28

    # Monthly income (profit) ≈ 8–15% net margin for kirana
    margin = rng.uniform(0.08, 0.18, n)
    monthly_income = monthly_revenue * margin

    df = pd.DataFrame({
        "demand_score":          demand_score,
        "footfall_index":        footfall_index,
        "inventory_proxy":       inventory_proxy,
        "competition_pressure":  competition_pressure,
        "location_quality":      location_quality,
        "sku_richness":          sku_richness,
        "shelf_density_index":   shelf_density_index,
        "inventory_score":       inventory_score,
        "sku_diversity":         sku_diversity,
        "road_type_score":       road_type_score,
        "market_area_flag":      market_area_flag,
        "poi_count_norm":        poi_count_norm,
        "competition_norm":      competition_norm,
        # Targets
        "daily_sales":       base_daily.round(0),
        "monthly_revenue":   monthly_revenue.round(0),
        "monthly_income":    monthly_income.round(0),
    })
    return df


if __name__ == "__main__":
    out_dir = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic"
    out_dir.mkdir(parents=True, exist_ok=True)
    df = generate()
    out_path = out_dir / "kirana_training_data.csv"
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} rows → {out_path}")
    print(df.describe())
