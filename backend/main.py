import sys
import logging
from contextlib import asynccontextmanager
from pathlib import Path

# ── Ensure project root is on sys.path ───────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.utils.logger import setup_logger
from backend.routes.analyze import router as analyze_router

# ── Logging ───────────────────────────────────────────────────────────
setup_logger("kirana_uw")
logger = logging.getLogger("kirana_uw")


# ── Lifespan (replaces deprecated on_event) ───────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info("  Kirana Store Underwriting API — Starting Up")
    logger.info("=" * 60)
    logger.info("  Docs available at http://localhost:8000/docs")
    try:
        from ml.fusion_model.predict import _get_artifact
        _get_artifact()
        logger.info("  Fusion model loaded successfully [OK]")
    except Exception as exc:
        logger.warning(f"  Model pre-warm failed: {exc}")
    yield
    logger.info("  Kirana Underwriting API — Shutting down")


# ── App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Kirana Store Cash Flow Underwriter",
    description=(
        "Production-grade API that estimates daily sales, monthly revenue, "
        "and net income for kirana (small grocery) stores using computer vision "
        "and geo-spatial intelligence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS (allow all origins in dev) ──────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────────
app.include_router(analyze_router, prefix="")


@app.get("/", tags=["Health"])
async def root():
    return {
        "service":  "Kirana Cash Flow Underwriter",
        "status":   "running",
        "docs":     "/docs",
        "version":  "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
