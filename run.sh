#!/usr/bin/env bash
set -e
echo "================================================================"
echo " Kirana Store Cash Flow Underwriter — Setup and Run"
echo "================================================================"

echo "[1/3] Installing Python dependencies..."
pip install -r requirements.txt

echo "[2/3] Training LightGBM fusion model (first-time only)..."
python -m ml.fusion_model.train

echo "[3/3] Starting FastAPI server..."
echo ""
echo "  API Docs: http://localhost:8000/docs"
echo "  Health:   http://localhost:8000/health"
echo ""
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
