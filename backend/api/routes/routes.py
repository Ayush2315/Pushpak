from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException, Path
from backend.core.database import get_connection
from backend.api.schemas import RouteNetworkSummary, RouteDetailResponse
from backend.analytics.network_analytics import (
    get_airline_market_presence,
    get_departure_time_distribution,
    get_stops_breakdown,
)

router = APIRouter(prefix="/routes", tags=["Route Network"])

@router.get(
    "",
    response_model=List[RouteNetworkSummary],
    summary="List Domestic Route Network Summaries",
    description=(
        "Returns summary statistics for all domestic routes from v_route_network. "
        "Metric Notice: observed_flight_records represents cumulative observations in the dataset, not daily flight frequencies."
    )
)
def list_routes(
    origin: Optional[str] = Query(None, min_length=3, max_length=3, description="Filter by origin IATA code (e.g. DEL)"),
    destination: Optional[str] = Query(None, min_length=3, max_length=3, description="Filter by destination IATA code (e.g. BOM)")
) -> List[RouteNetworkSummary]:
    conditions: List[str] = []
    params: List[object] = []

    if origin:
        conditions.append("origin_code = ?")
        params.append(origin.upper())
    if destination:
        conditions.append("destination_code = ?")
        params.append(destination.upper())

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    conn = get_connection()
    cursor = conn.cursor()
    sql = f"""
        SELECT 
            route_code, origin_code, destination_code, source_city, destination_city,
            observed_flight_records, active_airlines_count, avg_duration_hours,
            min_duration_hours, non_stop_records
        FROM v_route_network
        {where_clause}
        ORDER BY observed_flight_records DESC;
    """
    rows = cursor.execute(sql, params).fetchall()
    conn.close()

    return [RouteNetworkSummary(**dict(r)) for r in rows]

@router.get(
    "/{route_code}",
    response_model=RouteDetailResponse,
    summary="Get Detailed Domestic Route Intelligence",
    description=(
        "Returns comprehensive route profile including operating carriers, duration spread, "
        "time-of-day departure distribution, and non-stop vs 1-stop connectivity breakdown."
    )
)
def get_route_details(
    route_code: str = Path(..., description="Route code in 'ORIGIN-DEST' format (e.g. DEL-BOM)")
) -> RouteDetailResponse:
    normalized_route = route_code.upper().strip()

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            route_code, origin_code, destination_code, source_city, destination_city,
            observed_flight_records, active_airlines_count, avg_duration_hours,
            min_duration_hours, non_stop_records
        FROM v_route_network
        WHERE route_code = ?;
    """, (normalized_route,))
    summary_row = cursor.fetchone()
    conn.close()

    if not summary_row:
        raise HTTPException(
            status_code=404,
            detail=f"Route '{normalized_route}' was not found in the domestic route registry."
        )

    summary = RouteNetworkSummary(**dict(summary_row))
    operating_airlines = get_airline_market_presence(normalized_route)
    departure_slots = get_departure_time_distribution(normalized_route)
    stops_breakdown = get_stops_breakdown(normalized_route)

    return RouteDetailResponse(
        route_summary=summary,
        operating_airlines=operating_airlines,
        departure_slots=departure_slots,
        stops_breakdown=stops_breakdown,
        data_clarification="Observed counts represent cumulative dataset entries across time, not confirmed daily flight frequencies."
    )
