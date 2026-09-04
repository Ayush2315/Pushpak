import math
from typing import List, Dict, Any, Optional
from backend.core.database import get_connection

def _compute_std_dev(values: List[float], mean: float) -> float:
    """Computes sample standard deviation for a list of values."""
    if len(values) <= 1:
        return 0.0
    variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
    return round(math.sqrt(variance), 2)

def get_route_fare_stats(route_code: str) -> Optional[Dict[str, Any]]:
    """
    Computes statistical distribution metrics for airfare observations on a specific route.
    Returns None if no fare observations exist for the given route.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT total_fare, data_mode, environment, source_connector
        FROM fare_observations
        WHERE route_code = ?
        ORDER BY total_fare ASC;
    """, (route_code.upper().strip(),))

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return None

    fares = [float(r["total_fare"]) for r in rows]
    count = len(fares)
    min_fare = round(min(fares), 2)
    max_fare = round(max(fares), 2)
    mean_fare = round(sum(fares) / count, 2)
    fare_range = round(max_fare - min_fare, 2)
    std_dev = _compute_std_dev(fares, mean_fare)
    cv = round((std_dev / mean_fare) * 100, 2) if mean_fare > 0 else 0.0

    # Median calculation
    if count % 2 == 1:
        median_fare = round(fares[count // 2], 2)
    else:
        median_fare = round((fares[count // 2 - 1] + fares[count // 2]) / 2.0, 2)

    # Distinct data modes & environments observed
    data_modes = list(set(r["data_mode"] for r in rows))
    environments = list(set(r["environment"] for r in rows))

    return {
        "route_code": route_code.upper().strip(),
        "observation_count": count,
        "mean_fare": mean_fare,
        "median_fare": median_fare,
        "min_fare": min_fare,
        "max_fare": max_fare,
        "fare_range": fare_range,
        "std_dev": std_dev,
        "coefficient_of_variation": cv,
        "currency": "INR",
        "data_mode": data_modes[0] if len(data_modes) == 1 else "mixed",
        "environment": environments[0] if len(environments) == 1 else "mixed",
        "provenance_note": (
            "Statistics calculated directly from recorded fare observations. "
            "Simulated data is labeled demo_simulation."
        )
    }

def get_booking_window_analysis(route_code: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Analyzes fare movements across advance booking windows (T+1, T+7, T+15, T+30, T+45).
    """
    conn = get_connection()
    cursor = conn.cursor()

    if route_code:
        cursor.execute("""
            SELECT lead_time_bucket, lead_time_days, total_fare
            FROM fare_observations
            WHERE route_code = ?
            ORDER BY lead_time_days ASC;
        """, (route_code.upper().strip(),))
    else:
        cursor.execute("""
            SELECT lead_time_bucket, lead_time_days, total_fare
            FROM fare_observations
            ORDER BY lead_time_days ASC;
        """)

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return []

    # Group by bucket
    grouped: Dict[str, Dict[str, Any]] = {}
    for r in rows:
        bucket = r["lead_time_bucket"]
        days = r["lead_time_days"]
        fare = float(r["total_fare"])
        if bucket not in grouped:
            grouped[bucket] = {
                "lead_time_bucket": bucket,
                "lead_time_days": days,
                "fares": []
            }
        grouped[bucket]["fares"].append(fare)

    sorted_buckets = sorted(grouped.values(), key=lambda x: x["lead_time_days"])

    results: List[Dict[str, Any]] = []
    prev_avg: Optional[float] = None

    for item in sorted_buckets:
        fares = item["fares"]
        count = len(fares)
        avg_fare = round(sum(fares) / count, 2)
        min_fare = round(min(fares), 2)
        max_fare = round(max(fares), 2)
        std_dev = _compute_std_dev(fares, avg_fare)

        delta_from_previous = round(avg_fare - prev_avg, 2) if prev_avg is not None else None
        pct_change_from_previous = (
            round(((avg_fare - prev_avg) / prev_avg) * 100, 2)
            if (prev_avg is not None and prev_avg > 0)
            else None
        )


        results.append({
            "lead_time_bucket": item["lead_time_bucket"],
            "lead_time_days": item["lead_time_days"],
            "observation_count": count,
            "avg_fare": avg_fare,
            "min_fare": min_fare,
            "max_fare": max_fare,
            "std_dev": std_dev,
            "delta_from_previous": delta_from_previous,
            "pct_change_from_previous": pct_change_from_previous,
        })
        prev_avg = avg_fare

    return results

def get_airline_fare_comparison(route_code: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Compares fare statistics between airlines operating on a route (or across all observed routes).
    """
    conn = get_connection()
    cursor = conn.cursor()

    if route_code:
        cursor.execute("""
            SELECT airline_code, airline_name, total_fare, lead_time_bucket
            FROM fare_observations
            WHERE route_code = ?
            ORDER BY airline_name ASC;
        """, (route_code.upper().strip(),))
    else:
        cursor.execute("""
            SELECT airline_code, airline_name, total_fare, lead_time_bucket
            FROM fare_observations
            ORDER BY airline_name ASC;
        """)

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return []

    # Overall average for benchmarking
    all_fares = [float(r["total_fare"]) for r in rows]
    overall_avg = sum(all_fares) / len(all_fares) if all_fares else 0.0

    grouped: Dict[str, Dict[str, Any]] = {}
    for r in rows:
        name = r["airline_name"]
        code = r["airline_code"]
        fare = float(r["total_fare"])
        bucket = r["lead_time_bucket"]

        if name not in grouped:
            grouped[name] = {
                "airline_code": code,
                "airline_name": name,
                "fares": [],
                "buckets": set()
            }
        grouped[name]["fares"].append(fare)
        grouped[name]["buckets"].add(bucket)

    results: List[Dict[str, Any]] = []
    for name, item in grouped.items():
        fares = item["fares"]
        count = len(fares)
        avg_fare = round(sum(fares) / count, 2)
        fares_sorted = sorted(fares)
        if count % 2 == 1:
            median_fare = round(fares_sorted[count // 2], 2)
        else:
            median_fare = round((fares_sorted[count // 2 - 1] + fares_sorted[count // 2]) / 2.0, 2)
        min_fare = round(min(fares), 2)
        max_fare = round(max(fares), 2)
        std_dev = _compute_std_dev(fares, avg_fare)
        diff_from_avg = round(avg_fare - overall_avg, 2)
        pct_diff_from_avg = round(((avg_fare - overall_avg) / overall_avg) * 100, 2) if overall_avg > 0 else 0.0

        results.append({
            "airline_code": item["airline_code"],
            "airline_name": name,
            "observation_count": count,
            "avg_fare": avg_fare,
            "median_fare": median_fare,
            "min_fare": min_fare,
            "max_fare": max_fare,
            "std_dev": std_dev,
            "booking_windows_covered": len(item["buckets"]),
            "diff_from_market_avg": diff_from_avg,
            "pct_diff_from_market_avg": pct_diff_from_avg,
        })

    # Sort from lowest average fare to highest
    results.sort(key=lambda x: x["avg_fare"])
    return results

def get_all_routes_fare_summary() -> List[Dict[str, Any]]:
    """
    Returns high-level fare summaries across all routes that have fare observations.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT DISTINCT route_code
        FROM fare_observations
        ORDER BY route_code ASC;
    """)
    routes = [r["route_code"] for r in cursor.fetchall()]
    conn.close()

    summaries = []
    for rc in routes:
        stats = get_route_fare_stats(rc)
        if stats:
            summaries.append(stats)

    return summaries
