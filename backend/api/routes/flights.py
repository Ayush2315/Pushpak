from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException, Path
from backend.core.database import get_connection
from backend.api.schemas import PaginatedResponse, FlightRecordResponse

router = APIRouter(prefix="/flights", tags=["Flight Registry"])

@router.get(
    "",
    response_model=PaginatedResponse[FlightRecordResponse],
    summary="Query Domestic Flight Registry Records",
    description=(
        "Returns paginated historical domestic flight records from the flight registry. "
        "Supports filtering by origin, destination, airline, and stops. "
        "Notice: Data represents historical dataset observations, not active daily air traffic control schedules."
    )
)
def list_flights(
    origin: Optional[str] = Query(None, min_length=3, max_length=3, description="Origin IATA code (e.g. DEL)"),
    destination: Optional[str] = Query(None, min_length=3, max_length=3, description="Destination IATA code (e.g. BOM)"),
    airline: Optional[str] = Query(None, description="Airline name (e.g. IndiGo, Vistara, Air_India)"),
    stops: Optional[str] = Query(None, description="Stops filter: zero, one, two_or_more"),
    limit: int = Query(50, ge=1, le=200, description="Items per page (max 200)"),
    offset: int = Query(0, ge=0, description="Pagination offset index")
) -> PaginatedResponse[FlightRecordResponse]:
    conditions: List[str] = []
    params: List[object] = []

    if origin:
        conditions.append("origin_code = ?")
        params.append(origin.upper())
    if destination:
        conditions.append("destination_code = ?")
        params.append(destination.upper())
    if airline:
        conditions.append("LOWER(airline) LIKE ?")
        params.append(f"%{airline.lower()}%")
    if stops:
        conditions.append("LOWER(stops) = ?")
        params.append(stops.lower())

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    conn = get_connection()
    cursor = conn.cursor()

    # Total count query
    count_sql = f"SELECT COUNT(*) FROM flight_registry {where_clause};"
    total = cursor.execute(count_sql, params).fetchone()[0]

    # Data query
    data_sql = f"""
        SELECT 
            flight_id, row_index, airline, flight_number, source_city, origin_code,
            destination_city, destination_code, route_code, departure_time,
            stops, arrival_time, class_type, duration_hours,
            data_mode, environment, source_type
        FROM flight_registry
        {where_clause}
        ORDER BY row_index ASC, flight_id ASC
        LIMIT ? OFFSET ?;
    """
    rows = cursor.execute(data_sql, params + [limit, offset]).fetchall()
    conn.close()

    items = [FlightRecordResponse(**dict(r)) for r in rows]
    return PaginatedResponse(total=total, limit=limit, offset=offset, items=items)

@router.get(
    "/{flight_id}",
    response_model=FlightRecordResponse,
    summary="Get Flight Record by Unique ID",
    description="Returns detailed historical flight record by deterministic identifier (e.g. REC-000000-D07E64FD1B)."
)
def get_flight_by_id(
    flight_id: str = Path(..., description="Unique deterministic flight record identifier")
) -> FlightRecordResponse:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            flight_id, row_index, airline, flight_number, source_city, origin_code,
            destination_city, destination_code, route_code, departure_time,
            stops, arrival_time, class_type, duration_hours,
            data_mode, environment, source_type
        FROM flight_registry
        WHERE flight_id = ?;
    """, (flight_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise HTTPException(
            status_code=404,
            detail=f"Flight record '{flight_id}' was not found in the domestic registry."
        )

    return FlightRecordResponse(**dict(row))
