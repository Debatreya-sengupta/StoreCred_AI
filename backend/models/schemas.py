"""
Pydantic Schemas — Request & Response
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


# ── Request ───────────────────────────────────────────────────────────

class GPSCoordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90,   description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")


class AnalyzeStoreRequest(BaseModel):
    gps: GPSCoordinates
    store_id: Optional[str] = Field(None, description="Optional merchant/store identifier")

    @field_validator("gps", mode="before")
    @classmethod
    def parse_gps(cls, v):
        if isinstance(v, dict):
            return GPSCoordinates(**v)
        return v


# ── Internal intermediate structs ─────────────────────────────────────

class VisionSignals(BaseModel):
    shelf_density_index: float
    sku_diversity: float
    inventory_score: float
    total_items_detected: int
    unique_classes: int
    low_light_images: int = 0
    images_processed: int = 0


class GeoSignals(BaseModel):
    poi_count: int
    restaurant_count: int
    school_count: int
    competition_count: int
    road_type_score: float
    market_area_flag: int
    source: str = "unknown"


# ── Revenue Range ─────────────────────────────────────────────────────

class RevenueRange(BaseModel):
    low: float    = Field(..., description="Lower bound (P10)")
    high: float   = Field(..., description="Upper bound (P90)")
    median: float = Field(..., description="Point estimate (P50)")
    unit: str     = "INR/month"


class SalesRange(BaseModel):
    low: float
    high: float
    median: float
    unit: str = "INR/day"


# ── Final API Response ────────────────────────────────────────────────

class AnalyzeStoreResponse(BaseModel):
    store_id: Optional[str]         = None

    # Core financial estimates
    sales_range:   SalesRange       = Field(..., description="Daily sales estimate")
    revenue_range: RevenueRange     = Field(..., description="Monthly revenue estimate")
    income_range:  RevenueRange     = Field(..., description="Monthly net income estimate")

    # Model meta
    confidence_score: float         = Field(..., ge=0, le=1)

    # Risk
    risk_flags: List[str]           = Field(default_factory=list)

    # Supporting signals (for transparency)
    vision_signals: Optional[VisionSignals]  = None
    geo_signals:    Optional[GeoSignals]     = None
    geo_data_source: str                     = "unknown"
    images_processed: int                    = 0
    low_light_images: int                    = 0


# ── Error Response ────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
