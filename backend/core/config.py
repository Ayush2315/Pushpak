import os
from pathlib import Path
from typing import List, Dict

# Base directories
CORE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CORE_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "pushpak.db"
LOG_PATH = DATA_DIR / "ingestion.log"

# Target domestic routes for Milestone 0A
TARGET_ROUTES: List[str] = [
    "DEL-BOM",
    "DEL-BLR",
    "BOM-BLR",
]

# Advance booking lead times (Days from capture date)
LEAD_TIME_WINDOWS: Dict[str, int] = {
    "T+1": 1,
    "T+7": 7,
    "T+15": 15,
    "T+30": 30,
    "T+45": 45,
}

# Major Indian domestic carriers for baseline modeling
OPERATING_AIRLINES = [
    {"code": "6E", "name": "IndiGo"},
    {"code": "AI", "name": "Air India"},
    {"code": "SG", "name": "SpiceJet"},
]

# External Sandbox Configuration (Optional bonus)
SANDBOX_API_BASE_URL = os.getenv("SANDBOX_API_BASE_URL", "")
SANDBOX_API_KEY = os.getenv("SANDBOX_API_KEY", "")
SANDBOX_API_SECRET = os.getenv("SANDBOX_API_SECRET", "")
