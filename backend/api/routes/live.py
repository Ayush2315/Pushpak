from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException, Body, Response
from pydantic import BaseModel, Field

from backend.ingestion.live_connector import live_connector
from backend.core.database import get_connection

router = APIRouter(prefix="/live", tags=["Live Data Acquisition"])

class LiveFetchRequest(BaseModel):
    route_code: str = Field("DEL-BOM", description="Corridor code in ORIGIN-DEST format (e.g. DEL-BOM)")
    advance_purchase_window: int = Field(7, ge=1, le=45, description="Advance purchase lead-time days (e.g. 1, 7, 15, 30, 45)")

@router.get("/status", summary="Live Data Source Operational Status")
def get_live_status() -> Dict[str, Any]:
    """Returns connectivity and operational status of the live data acquisition connector."""
    is_healthy = live_connector.health_check()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT run_id, timestamp, route_code, status, records_retrieved, accepted_records, integrity_hash FROM live_acquisition_runs ORDER BY timestamp DESC LIMIT 1;")
    last_run = cursor.fetchone()
    conn.close()

    return {
        "connector_name": live_connector.connector_name,
        "operational_status": "operational" if is_healthy else "degraded",
        "health_check_passed": is_healthy,
        "source_apis": [
            {
                "name": "OpenSky Network ADS-B Telemetry",
                "endpoint": "https://opensky-network.org/api/states/all",
                "type": "open_aviation_telemetry",
                "data_provided": "Active airborne aircraft states, callsigns, barometric altitude, ground speed",
                "status": "active"
            },
            {
                "name": "NOAA AviationWeather.gov METAR Service",
                "endpoint": "https://aviationweather.gov/api/data/metar",
                "type": "official_aviation_weather",
                "data_provided": "Real-time airport METAR observations, surface wind, visibility, flight category",
                "status": "active"
            }
        ],
        "last_acquisition_run": dict(last_run) if last_run else None,
        "data_honesty_statement": (
            "PUSHPAK Live Acquisition Connector strictly accesses open public civil aviation APIs. "
            "It does not violate terms of service, bypass authentication, or scrape protected airline portals."
        )
    }

@router.post("/fetch", summary="Trigger Live Acquisition Pipeline")
def fetch_live_data(request: LiveFetchRequest = Body(...), response: Response = None) -> Dict[str, Any]:
    """
    Executes the 7-stage PUSHPAK Live Data Acquisition Pipeline:
    1. Source Connection
    2. Data Extraction
    3. Strict Field Validation
    4. Cleaning & Normalization
    5. Deduplication
    6. Database Storage in SQLite
    7. SHA-256 Provenance Hashing
    """
    if response:
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    try:
        result = live_connector.execute_live_pipeline(
            route_code=request.route_code,
            advance_purchase_window=request.advance_purchase_window
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Live acquisition pipeline failed: {str(e)}"
        )

@router.get("/history", summary="Audit History of Live Acquisition Runs")
def get_live_history(limit: int = Query(20, ge=1, le=100)) -> List[Dict[str, Any]]:
    """Returns the historical audit trail of live acquisition runs with SHA-256 integrity hashes."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT run_id, timestamp, route_code, advance_purchase_window,
               source_name, source_type, status, records_retrieved,
               invalid_records, duplicates_removed, accepted_records,
               integrity_hash, notes
        FROM live_acquisition_runs
        ORDER BY timestamp DESC
        LIMIT ?;
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/sources", summary="Documented Acquisition Architecture & Sources")
def get_live_sources() -> Dict[str, Any]:
    """Provides complete architectural documentation of supported and future acquisition connectors."""
    return {
        "implemented_connector": {
            "name": "LiveAirfareConnector",
            "source_type": "open_public_aviation_api",
            "active_endpoints": [
                "OpenSky Network ADS-B Telemetry (Public Research Network)",
                "NOAA AviationWeather.gov METAR Observations (Official Meteorology)"
            ],
            "capabilities": [
                "Live corridor airspace flight tracking",
                "Live origin/destination airport weather & visibility",
                "Automated 7-stage validation, cleaning, and deduplication",
                "Cryptographic SHA-256 integrity hashing and provenance recording"
            ]
        },
        "future_connectors_architecture": [
            {
                "name": "MoCA_DGCA_OfficialFeedConnector",
                "description": "Direct integration with Ministry of Civil Aviation domestic passenger statistical returns (Form 1)",
                "status": "architecture_ready"
            },
            {
                "name": "Airline_GDS_SandboxConnector",
                "description": "Amadeus/Sabre/Travelport NDC API sandbox for domestic fare inventory feeds",
                "status": "architecture_ready"
            }
        ],
        "ethical_compliance": [
            "Zero CAPTCHA circumvention",
            "Zero bypass of login or authentication mechanisms",
            "Strict adherence to public API rate limits (6-second timeouts)",
            "Honest provenance labeling (live acquired vs deterministic demo data)"
        ]
    }
