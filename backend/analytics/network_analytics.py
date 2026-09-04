from typing import List, Dict, Any, Optional
from backend.core.database import get_connection

def get_route_network_summary(route_code: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns summary statistics for domestic routes from v_route_network.
    Faithfully reports observed_flight_records (not daily flight frequency).
    """
    conn = get_connection()
    cursor = conn.cursor()

    if route_code:
        cursor.execute(
            "SELECT * FROM v_route_network WHERE route_code = ?;",
            (route_code.upper(),)
        )
    else:
        cursor.execute("SELECT * FROM v_route_network ORDER BY observed_flight_records DESC;")

    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_airline_market_presence(route_code: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Computes carrier presence and observed flight record share.
    """
    conn = get_connection()
    cursor = conn.cursor()

    if route_code:
        cursor.execute("""
            SELECT 
                airline,
                COUNT(*) AS observed_records,
                COUNT(DISTINCT route_code) AS routes_served,
                ROUND(AVG(duration_hours), 2) AS avg_duration_hours
            FROM flight_registry
            WHERE route_code = ?
            GROUP BY airline
            ORDER BY observed_records DESC;
        """, (route_code.upper(),))
    else:
        cursor.execute("""
            SELECT 
                airline,
                COUNT(*) AS observed_records,
                COUNT(DISTINCT route_code) AS routes_served,
                ROUND(AVG(duration_hours), 2) AS avg_duration_hours
            FROM flight_registry
            GROUP BY airline
            ORDER BY observed_records DESC;
        """)

    rows = cursor.fetchall()
    total_records = sum(r["observed_records"] for r in rows) if rows else 0

    results = []
    for r in rows:
        d = dict(r)
        d["share_percentage"] = round((d["observed_records"] / total_records) * 100, 2) if total_records > 0 else 0.0
        results.append(d)

    conn.close()
    return results

def get_departure_time_distribution(route_code: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Computes distribution of flights across categorical departure slots
    (Early_Morning, Morning, Afternoon, Evening, Night, Late_Night).
    """
    conn = get_connection()
    cursor = conn.cursor()

    if route_code:
        cursor.execute("""
            SELECT departure_time AS time_slot, COUNT(*) AS observed_records
            FROM flight_registry
            WHERE route_code = ?
            GROUP BY departure_time
            ORDER BY observed_records DESC;
        """, (route_code.upper(),))
    else:
        cursor.execute("""
            SELECT departure_time AS time_slot, COUNT(*) AS observed_records
            FROM flight_registry
            GROUP BY departure_time
            ORDER BY observed_records DESC;
        """)

    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_stops_breakdown(route_code: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns non-stop vs 1-stop connectivity breakdown.
    """
    conn = get_connection()
    cursor = conn.cursor()

    if route_code:
        cursor.execute("""
            SELECT stops, COUNT(*) AS observed_records
            FROM flight_registry
            WHERE route_code = ?
            GROUP BY stops
            ORDER BY observed_records DESC;
        """, (route_code.upper(),))
    else:
        cursor.execute("""
            SELECT stops, COUNT(*) AS observed_records
            FROM flight_registry
            GROUP BY stops
            ORDER BY observed_records DESC;
        """)

    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
