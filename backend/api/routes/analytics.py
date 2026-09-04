from typing import Optional
from fastapi import APIRouter, Query
from backend.core.database import get_connection
from backend.api.schemas import AirlineAnalyticsResponse, NetworkAnalyticsResponse
from backend.analytics.network_analytics import get_airline_market_presence

router = APIRouter(prefix="/analytics", tags=["Network & Airline Analytics"])

@router.get(
    "/airlines",
    response_model=AirlineAnalyticsResponse,
    summary="Airline Presence & Relative Dataset Share",
    description=(
        "Returns operating airline presence, observed records, routes served, and dataset share. "
        "Limitation Notice: This represents observed historical dataset presence and should not be confused with official real-time DGCA market share."
    )
)
def get_airline_analytics(
    route_code: Optional[str] = Query(None, description="Optional route filter (e.g. DEL-BOM)")
) -> AirlineAnalyticsResponse:
    carriers = get_airline_market_presence(route_code)
    return AirlineAnalyticsResponse(
        total_operating_airlines=len(carriers),
        carriers=carriers,
        data_clarification="Carrier presence is calculated from historical flight records and represents dataset presence, not live official market share."
    )

@router.get(
    "/network",
    response_model=NetworkAnalyticsResponse,
    summary="Domestic Route Network Macro Analytics",
    description=(
        "Returns high-level domestic route network indicators: total routes, total observed flight records, "
        "total airlines, and top routes by volume."
    )
)
def get_network_analytics() -> NetworkAnalyticsResponse:
    conn = get_connection()
    cursor = conn.cursor()

    total_routes = cursor.execute("SELECT COUNT(*) FROM v_route_network;").fetchone()[0]
    total_records = cursor.execute("SELECT COUNT(*) FROM flight_registry;").fetchone()[0]
    total_airlines = cursor.execute("SELECT COUNT(DISTINCT airline) FROM flight_registry;").fetchone()[0]

    top_routes_rows = cursor.execute("""
        SELECT 
            route_code, source_city, destination_city, observed_flight_records,
            active_airlines_count, avg_duration_hours, min_duration_hours, non_stop_records
        FROM v_route_network
        ORDER BY observed_flight_records DESC
        LIMIT 10;
    """).fetchall()
    conn.close()

    top_routes = [dict(r) for r in top_routes_rows]

    return NetworkAnalyticsResponse(
        total_routes_indexed=total_routes,
        total_observed_flight_records=total_records,
        total_operating_airlines=total_airlines,
        top_routes_by_records=top_routes,
        data_clarification="Network metrics reflect indexed historical dataset observations, not active daily air traffic control schedules."
    )
