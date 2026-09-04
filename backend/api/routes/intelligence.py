from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.api.schemas import (
    RouteIntelligenceResponse,
    BookingWindowsResponse,
    AirlinesComparisonResponse,
    NetworkFareSummaryResponse,
    ErrorResponse,
)
from backend.analytics.intelligence import get_route_intelligence
from backend.analytics.fare_analytics import (
    get_booking_window_analysis,
    get_airline_fare_comparison,
    get_all_routes_fare_summary,
)

router = APIRouter(prefix="/intelligence", tags=["Intelligence & Fare Analytics"])

@router.get(
    "/routes/{route_code}",
    response_model=RouteIntelligenceResponse,
    responses={
        404: {"model": ErrorResponse, "description": "No fare observations for this route"}
    },
    summary="Comprehensive Route Fare Intelligence",
    description=(
        "Returns statistical distribution, booking window curves, airline price comparison, "
        "volatility classification, and explainable deterministic insights for a specific route. "
        "Strict Provenance Rule: Transparently tags simulation vs real data."
    )
)
def get_route_intelligence_endpoint(route_code: str) -> RouteIntelligenceResponse:
    norm_route = route_code.upper().strip()
    result = get_route_intelligence(norm_route)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No airfare observations found for route '{norm_route}'. "
                   f"Available routes with fare data currently include: DEL-BOM, DEL-BLR, BOM-BLR."
        )
    return RouteIntelligenceResponse(**result)

@router.get(
    "/booking-windows",
    response_model=BookingWindowsResponse,
    summary="Advance Booking Window Yield Analysis",
    description=(
        "Analyzes fare trends across advance booking windows (T+1, T+7, T+15, T+30, T+45). "
        "Can be filtered by a specific route or aggregated across the entire network."
    )
)
def get_booking_windows_endpoint(
    route_code: Optional[str] = Query(None, description="Optional route filter (e.g. DEL-BOM)")
) -> BookingWindowsResponse:
    norm_route = route_code.upper().strip() if route_code else None
    items = get_booking_window_analysis(norm_route)
    return BookingWindowsResponse(
        route_code=norm_route,
        booking_windows=items
    )

@router.get(
    "/compare-airlines",
    response_model=AirlinesComparisonResponse,
    summary="Inter-Airline Fare Comparison",
    description=(
        "Compares pricing metrics, averages, ranges, and market benchmark differentials "
        "between operating carriers on a route or across the observed network."
    )
)
def compare_airlines_endpoint(
    route_code: Optional[str] = Query(None, description="Optional route filter (e.g. DEL-BOM)")
) -> AirlinesComparisonResponse:
    norm_route = route_code.upper().strip() if route_code else None
    items = get_airline_fare_comparison(norm_route)
    return AirlinesComparisonResponse(
        route_code=norm_route,
        airline_comparison=items
    )

@router.get(
    "/fare-index",
    response_model=NetworkFareSummaryResponse,
    summary="Network-Wide Fare Intelligence Summary",
    description=(
        "High-level fare index summary across all routes with recorded airfare observations, "
        "providing mean fares, ranges, and volatility coefficients."
    )
)
def get_network_fare_index_endpoint() -> NetworkFareSummaryResponse:
    routes = get_all_routes_fare_summary()
    return NetworkFareSummaryResponse(
        total_routes_with_fare_observations=len(routes),
        routes=routes
    )
