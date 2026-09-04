"""
PUSHPAK National Corridor Explorer API Router
Provides endpoints to explore India's Top 10 domestic air corridors,
clearly separating the representative index basket from the broader explorer network.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Path

from backend.analytics.national_corridors import (
    get_top_10_corridors,
    get_corridor_by_code,
)

router = APIRouter(prefix="/corridors", tags=["National Corridors"])

@router.get("/top10", summary="Get Top 10 Indian Domestic Air Corridors")
def list_top_10_corridors() -> Dict[str, Any]:
    """
    Returns the ranked Top 10 Indian domestic aviation corridors.
    Separates the PUSHPAK Representative Index Basket (3 routes) from the broader National Explorer (7 routes).
    """
    corridors = get_top_10_corridors()
    return {
        "status": "success",
        "ranking_basis": "DGCA Domestic Air Transport Passenger Traffic & Flight Registry Observations",
        "total_corridors": len(corridors),
        "representative_basket_count": sum(1 for c in corridors if c["is_in_representative_basket"]),
        "explorer_only_count": sum(1 for c in corridors if not c["is_in_representative_basket"]),
        "methodology_note": (
            "The National Corridor Explorer presents major observed domestic aviation corridors. "
            "The current PUSHPAK prototype index uses a smaller representative basket for transparent methodological demonstration."
        ),
        "corridors": corridors
    }

@router.get("/{route_code}", summary="Get Specific Corridor Details")
def get_corridor_details(
    route_code: str = Path(..., description="Route code in ORIGIN-DEST format (e.g. DEL-BOM)")
) -> Dict[str, Any]:
    """Returns detailed metadata and basket status for a specific domestic corridor."""
    corridor = get_corridor_by_code(route_code)
    if not corridor:
        raise HTTPException(
            status_code=404,
            detail=f"Corridor '{route_code.upper()}' not found in the National Corridor Explorer."
        )
    return {
        "status": "success",
        "corridor": corridor
    }
