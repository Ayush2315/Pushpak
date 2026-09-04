from typing import Optional, List
from fastapi import APIRouter, Query
from backend.core.database import get_connection
from backend.api.schemas import PaginatedResponse, FareObservationResponse

router = APIRouter(prefix="/fares", tags=["Airfare Observations"])

@router.get(
    "",
    response_model=PaginatedResponse[FareObservationResponse],
    summary="List Airfare Price Observations with Provenance",
    description=(
        "Returns micro-level airfare price observations captured across Indian domestic routes "
        "and advance booking windows (T+1 to T+45). "
        "Critical Provenance Rule: Every observation visibly exposes its data_mode (e.g. demo_simulation) "
        "and environment to guarantee total government transparency."
    )
)
def list_fares(
    route_code: Optional[str] = Query(None, description="Route filter in ORIGIN-DEST format (e.g. DEL-BOM)"),
    airline: Optional[str] = Query(None, description="Airline filter (e.g. 6E, IndiGo, Air India)"),
    lead_time_bucket: Optional[str] = Query(None, description="Advance booking window: T+1, T+7, T+15, T+30, T+45"),
    data_mode: Optional[str] = Query(None, description="Filter by data mode: demo_simulation, external_connector, official, historical"),
    limit: int = Query(50, ge=1, le=200, description="Items per page (max 200)"),
    offset: int = Query(0, ge=0, description="Pagination offset index")
) -> PaginatedResponse[FareObservationResponse]:
    conditions: List[str] = []
    params: List[object] = []

    if route_code:
        conditions.append("route_code = ?")
        params.append(route_code.upper().strip())
    if airline:
        conditions.append("(airline_code = ? OR LOWER(airline_name) LIKE ?)")
        params.append(airline.upper().strip())
        params.append(f"%{airline.lower().strip()}%")
    if lead_time_bucket:
        conditions.append("lead_time_bucket = ?")
        params.append(lead_time_bucket.upper().strip())
    if data_mode:
        conditions.append("data_mode = ?")
        params.append(data_mode.lower().strip())

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    conn = get_connection()
    cursor = conn.cursor()

    count_sql = f"SELECT COUNT(*) FROM fare_observations {where_clause};"
    total = cursor.execute(count_sql, params).fetchone()[0]

    data_sql = f"""
        SELECT 
            observation_id, source_connector, data_mode, environment,
            origin, destination, route_code, airline_code, airline_name, flight_number,
            query_timestamp, departure_date, lead_time_days, lead_time_bucket,
            cabin_class, base_fare, taxes_fees, total_fare,
            source_hash, confidence_score
        FROM fare_observations
        {where_clause}
        ORDER BY departure_date ASC, lead_time_days ASC, total_fare ASC
        LIMIT ? OFFSET ?;
    """
    rows = cursor.execute(data_sql, params + [limit, offset]).fetchall()
    conn.close()

    items = [FareObservationResponse(**dict(r)) for r in rows]
    return PaginatedResponse(total=total, limit=limit, offset=offset, items=items)
