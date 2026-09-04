from typing import Dict, Any, List, Optional
from backend.analytics.fare_analytics import (
    get_route_fare_stats,
    get_booking_window_analysis,
    get_airline_fare_comparison,
)

# Thresholds for Route Volatility Classification (Configurable)
CV_STABLE_MAX = 15.0
CV_MODERATE_MAX = 30.0

def classify_route_volatility(cv_percent: float) -> Dict[str, Any]:
    """
    Classifies a route into an explainable volatility band based on its
    Coefficient of Variation (CV).
    """
    if cv_percent < CV_STABLE_MAX:
        band = "Stable"
        description = "Minimal fare volatility; predictable pricing across booking windows."
        policy_risk = "Low consumer fare shock risk."
    elif cv_percent <= CV_MODERATE_MAX:
        band = "Moderate Variation"
        description = "Standard market yield dynamic pricing driven primarily by advance lead times."
        policy_risk = "Moderate variation typical of normal airline revenue management."
    else:
        band = "High Variation"
        description = "Significant price dispersion with aggressive last-minute surge pricing."
        policy_risk = "High risk of walk-up fare spikes; prime candidate for consumer price monitoring."

    return {
        "band": band,
        "cv_percent": cv_percent,
        "description": description,
        "policy_risk": policy_risk,
        "classification_note": (
            "PUSHPAK Analytical Classification: Volatility Band (Heuristic metric, "
            "NOT an official DGCA/MoCA government designation)."
        )
    }

def generate_deterministic_insights(
    stats: Dict[str, Any],
    windows: List[Dict[str, Any]],
    airlines: List[Dict[str, Any]]
) -> List[str]:
    """
    Produces deterministic, human-readable insights directly from numerical data.
    Strictly rule-based: zero nondeterministic AI or external API calls.
    """
    insights: List[str] = []

    # Provenance Header
    if stats.get("data_mode") == "demo_simulation":
        insights.append(
            "[Simulation-Based Analytical Insight] Metrics derived from deterministic "
            "prototype observations. Not live real-time market quotes."
        )

    # 1. Booking Window Advance Spread (T+1 vs T+45)
    t1_bucket = next((w for w in windows if w["lead_time_bucket"] == "T+1"), None)
    t45_bucket = next((w for w in windows if w["lead_time_bucket"] == "T+45"), None)

    if t1_bucket and t45_bucket and t45_bucket["avg_fare"] > 0:
        spread_pct = round(
            ((t1_bucket["avg_fare"] - t45_bucket["avg_fare"]) / t45_bucket["avg_fare"]) * 100, 1
        )
        if spread_pct > 50.0:
            insights.append(
                f"Severe walk-up premium: T+1 bookings command an average +{spread_pct}% premium "
                f"over 45-day advance bookings (₹{t1_bucket['avg_fare']:,.2f} vs ₹{t45_bucket['avg_fare']:,.2f})."
            )
        elif spread_pct > 20.0:
            savings_pct = round(
                ((t1_bucket["avg_fare"] - t45_bucket["avg_fare"]) / t1_bucket["avg_fare"]) * 100, 1
            )
            insights.append(
                f"Significant advance discount: Booking 45 days in advance yields an average "
                f"{savings_pct}% saving compared to last-minute T+1 fares."
            )
        else:
            insights.append(
                f"Flat lead-time pricing: Minimal variation (+{spread_pct}%) between walk-up "
                f"and 45-day advance booking windows."
            )


    # 2. Airline Price Leadership
    if airlines:
        cheapest = airlines[0]
        most_expensive = airlines[-1]
        mean_fare = stats.get("mean_fare", 0.0)

        if len(airlines) > 1 and mean_fare > 0:
            diff_pct = abs(cheapest.get("pct_diff_from_market_avg", 0.0))
            insights.append(
                f"{cheapest['airline_name']} observed as lowest average fare carrier at "
                f"₹{cheapest['avg_fare']:,.2f} ({diff_pct:.1f}% below route average)."
            )
            spread_carriers = round(most_expensive["avg_fare"] - cheapest["avg_fare"], 2)
            insights.append(
                f"Inter-carrier price spread on this route is ₹{spread_carriers:,.2f} "
                f"between {cheapest['airline_name']} and {most_expensive['airline_name']}."
            )

    # 3. Volatility Assessment
    cv = stats.get("coefficient_of_variation", 0.0)
    if cv > CV_MODERATE_MAX:
        insights.append(
            f"High fare volatility (CV: {cv:.1f}%): travelers face substantial price swings "
            f"depending on booking lead time."
        )
    elif cv >= CV_STABLE_MAX:
        insights.append(
            f"Moderate dynamic pricing (CV: {cv:.1f}%): pricing follows standard airline "
            f"revenue management yield curves."
        )
    else:
        insights.append(
            f"High price predictability (CV: {cv:.1f}%): fares remain tightly clustered "
            f"around the mean."
        )

    # 4. Extreme Bounds
    min_f = stats.get("min_fare", 0.0)
    max_f = stats.get("max_fare", 0.0)
    insights.append(
        f"Observed fares range from a low of ₹{min_f:,.2f} to a peak of ₹{max_f:,.2f} "
        f"(spread: ₹{stats.get('fare_range', 0.0):,.2f})."
    )

    return insights

def get_route_intelligence(route_code: str) -> Optional[Dict[str, Any]]:
    """
    Assembles a complete intelligence dossier for a given route.
    Returns None if no fare observations exist for the route.
    """
    norm_route = route_code.upper().strip()
    stats = get_route_fare_stats(norm_route)
    if not stats:
        return None

    parts = norm_route.split("-")
    origin = parts[0] if len(parts) == 2 else "UNKNOWN"
    destination = parts[1] if len(parts) == 2 else "UNKNOWN"

    windows = get_booking_window_analysis(norm_route)
    airlines = get_airline_fare_comparison(norm_route)
    classification = classify_route_volatility(stats["coefficient_of_variation"])
    insights = generate_deterministic_insights(stats, windows, airlines)

    return {
        "route_code": norm_route,
        "origin": origin,
        "destination": destination,
        "fare_summary": stats,
        "booking_windows": windows,
        "airline_comparison": airlines,
        "classification": classification,
        "insights": insights,
        "provenance": {
            "data_mode": stats["data_mode"],
            "environment": stats["environment"],
            "observation_count": stats["observation_count"],
            "integrity_rule": "Simulated data is explicitly tagged; not live real-time quotes."
        }
    }
