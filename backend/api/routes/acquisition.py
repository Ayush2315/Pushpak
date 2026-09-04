"""
PUSHPAK Airfare Acquisition API Router
======================================
Exposes endpoints for the 9-stage ethical airfare acquisition pipeline,
connector registry, run history, clean deduplicated observation repository,
and the Previous vs Current Fetch Audit.
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.ingestion.airfare_connector import (
    get_available_connectors,
    run_airfare_pipeline,
    get_acquisition_history,
    get_clean_observations,
    get_previous_vs_current_audit,
    DEMO_SCENARIOS,
)

router = APIRouter(prefix="/acquisition", tags=["Airfare Acquisition Pipeline"])


class AcquisitionRunRequest(BaseModel):
    source_id: str = Field(
        default="demo_airfare_connector",
        description="Identifier of the source connector (e.g. 'demo_airfare_connector')"
    )
    route_code: str = Field(
        default="DEL-BOM",
        description="Target domestic corridor route code (e.g. 'DEL-BOM', 'DEL-BLR')"
    )
    advance_purchase_window: int = Field(
        default=15,
        description="Advance booking horizon in days: 1, 7, 15, 30, 45"
    )
    departure_date: Optional[str] = Field(
        default=None,
        description="Optional departure date in YYYY-MM-DD format"
    )


@router.get("/sources", summary="Available and Planned Airfare Connectors")
def get_sources() -> Dict[str, Any]:
    """
    Returns registered airfare acquisition connectors, including the active
    demonstration connector and architecture-ready / planned institutional stubs.
    """
    sources = get_available_connectors()
    return {
        "status": "success",
        "count": len(sources),
        "sources": sources,
        "active_source_id": "demo_airfare_connector",
        "ethical_disclosure": (
            "PUSHPAK utilizes structured demonstration connectors to showcase the end-to-end "
            "acquisition, validation, deduplication, and index aggregation pipeline without "
            "violating commercial airline terms of service or robots.txt policies."
        )
    }


@router.post("/run", summary="Execute 9-Stage Airfare Acquisition Pipeline")
def run_pipeline_endpoint(request: AcquisitionRunRequest) -> Dict[str, Any]:
    """
    Executes the transparent 9-stage airfare acquisition pipeline.
    The DemoAirlineConnector rotates through 5 deterministic scenarios,
    producing genuinely different retrieved/invalid/duplicate/accepted counts
    and fare levels on consecutive runs.
    """
    try:
        result = run_airfare_pipeline(
            source_id=request.source_id,
            route_code=request.route_code,
            advance_purchase_window=request.advance_purchase_window,
            departure_date=request.departure_date
        )
        return {
            "status": "success",
            "data": result
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline execution error: {str(e)}")


@router.get("/history", summary="Recent Airfare Acquisition Runs")
def get_history(
    limit: int = Query(20, ge=1, le=100, description="Maximum number of historical runs to return")
) -> Dict[str, Any]:
    """Returns the immutable audit log of recent acquisition runs with SHA-256 integrity hashes."""
    runs = get_acquisition_history(limit=limit)
    return {
        "status": "success",
        "count": len(runs),
        "runs": runs
    }


@router.get("/observations", summary="Clean Deduplicated Airfare Observations")
def get_observations(
    route_code: Optional[str] = Query(None, description="Filter by corridor route code (e.g. 'DEL-BOM')"),
    run_id: Optional[str] = Query(None, description="Filter by specific acquisition run ID"),
    carrier: Optional[str] = Query(None, description="Filter by operating carrier name"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of observations to return")
) -> Dict[str, Any]:
    """
    Returns clean, validated, deduplicated observations ready for price index calculations.
    """
    observations = get_clean_observations(
        route_code=route_code,
        run_id=run_id,
        carrier=carrier,
        limit=limit
    )
    return {
        "status": "success",
        "count": len(observations),
        "observations": observations
    }


@router.get("/compare/{run_id}", summary="Previous vs Current Fetch Audit")
def compare_runs(run_id: str) -> Dict[str, Any]:
    """
    Compares the specified acquisition run against the immediately preceding run.

    Returns:
      - Pipeline metric deltas (retrieved, validated, duplicates, accepted, rejected)
      - Fare statistic deltas (mean, median, min, max, % movement)
      - High-level status label: FARE LEVEL INCREASED / DECREASED / PIPELINE QUALITY CHANGED / NO MATERIAL CHANGE
      - Previous and current run provenance hashes for audit continuity
    """
    try:
        audit = get_previous_vs_current_audit(run_id)
        return {
            "status": "success",
            "audit": audit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit comparison error: {str(e)}")


@router.get("/scenarios", summary="Demo Acquisition Scenario Definitions")
def get_scenarios() -> Dict[str, Any]:
    """
    Returns the 5 deterministic demonstration acquisition scenarios that
    DemoAirlineConnector rotates through. Each scenario is internally
    consistent: accepted = retrieved - invalid - duplicates.
    """
    return {
        "status": "success",
        "scenario_count": len(DEMO_SCENARIOS),
        "scenarios": DEMO_SCENARIOS,
        "rotation_note": (
            "The demo connector cycles through these scenarios in order. "
            "Consecutive runs produce genuinely different pipeline metrics and fare levels."
        )
    }
