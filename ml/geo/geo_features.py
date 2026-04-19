"""
Geo Features Module
───────────────────
Fetches location-based signals for a store given GPS coordinates.

Real mode  : uses the free Overpass API (OpenStreetMap) for POI data.
Mock mode  : returns plausible mock values when no internet / API fails.

Signals returned:
  • poi_count           – total nearby points of interest
  • restaurant_count    – food outlets nearby (footfall proxy)
  • school_count        – schools nearby (daily footfall proxy)
  • competition_count   – competing kirana/grocery stores
  • road_type_score     – 0=lane, 0.5=secondary road, 1=main road
  • market_area_flag    – 1 if in a dense commercial zone
"""

import logging
import random
import math
from typing import Dict, Any

import requests

logger = logging.getLogger(__name__)

# Overpass QL template — fetches shops, schools, restaurants within radius
_OVERPASS_QUERY = """
[out:json][timeout:15];
(
  node["shop"](around:{radius},{lat},{lon});
  node["amenity"="restaurant"](around:{radius},{lat},{lon});
  node["amenity"="school"](around:{radius},{lat},{lon});
  node["amenity"="fast_food"](around:{radius},{lat},{lon});
  way["highway"](around:50,{lat},{lon});
);
out body;
"""


def fetch_geo_features(
    lat: float,
    lon: float,
    radius: int = 500,
    overpass_url: str = "https://overpass-api.de/api/interpreter",
) -> Dict[str, Any]:
    """
    Fetch geo features for a (lat, lon) location.

    Returns a dict of normalized signals ready for feature engineering.
    Falls back to mock data on any error.
    """
    try:
        features = _fetch_from_overpass(lat, lon, radius, overpass_url)
        logger.info(f"Geo features fetched for ({lat}, {lon}): {features}")
        return features
    except Exception as exc:
        logger.warning(f"Overpass API failed ({exc}). Using mock geo features.")
        return _mock_geo_features(lat, lon)


# ── Overpass (Real) ──────────────────────────────────────────────────

def _fetch_from_overpass(lat, lon, radius, url) -> Dict[str, Any]:
    query = _OVERPASS_QUERY.format(lat=lat, lon=lon, radius=radius)
    resp = requests.post(url, data={"data": query}, timeout=20)
    resp.raise_for_status()
    elements = resp.json().get("elements", [])

    poi_count       = 0
    restaurant_count = 0
    school_count    = 0
    competition_count = 0
    road_type_score = 0.3   # default: secondary road

    for el in elements:
        tags = el.get("tags", {})
        shop = tags.get("shop", "")
        amenity = tags.get("amenity", "")
        highway = tags.get("highway", "")

        if shop or amenity:
            poi_count += 1
        if amenity in ("restaurant", "fast_food", "cafe", "food_court"):
            restaurant_count += 1
        if amenity == "school":
            school_count += 1
        if shop in ("convenience", "supermarket", "grocery", "general"):
            competition_count += 1
        if highway in ("primary", "trunk", "motorway"):
            road_type_score = 1.0
        elif highway in ("secondary", "tertiary"):
            road_type_score = max(road_type_score, 0.6)

    market_area_flag = 1 if poi_count > 20 else 0

    return {
        "poi_count":          min(poi_count, 100),
        "restaurant_count":   min(restaurant_count, 30),
        "school_count":       min(school_count, 10),
        "competition_count":  min(competition_count, 20),
        "road_type_score":    road_type_score,
        "market_area_flag":   market_area_flag,
        "source":             "overpass_api",
    }


# ── Mock (Fallback) ──────────────────────────────────────────────────

def _mock_geo_features(lat: float, lon: float) -> Dict[str, Any]:
    """
    Returns deterministic mock geo features seeded on the GPS coordinates.
    Values are realistic for an Indian kirana store context.

    TODO: Replace with real API calls using GOOGLE_MAPS_API_KEY or
          Overpass API once network access is available.
    """
    seed = int((abs(lat) + abs(lon)) * 1000) % (2**31)
    rng  = random.Random(seed)

    poi_count         = rng.randint(5, 60)
    restaurant_count  = rng.randint(1, 15)
    school_count      = rng.randint(0, 5)
    competition_count = rng.randint(0, 8)
    road_type_score   = rng.choice([0.2, 0.5, 0.8, 1.0])
    market_area_flag  = 1 if poi_count > 25 else 0

    return {
        "poi_count":          poi_count,
        "restaurant_count":   restaurant_count,
        "school_count":       school_count,
        "competition_count":  competition_count,
        "road_type_score":    road_type_score,
        "market_area_flag":   market_area_flag,
        "source":             "mock",  # clearly flagged
    }
