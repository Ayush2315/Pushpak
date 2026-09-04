from typing import Dict, Any, List, Optional
from backend.analytics.fare_analytics import (
    get_route_fare_stats,
    get_booking_window_analysis,
    get_airline_fare_comparison,
    get_all_routes_fare_summary,
)
from backend.analytics.network_analytics import get_route_network_summary

# ====================================================================
# TRANSPARENT POLICY INTELLIGENCE THRESHOLDS (CONFIGURABLE & AUDITABLE)
# ====================================================================

THRESHOLD_VOLATILITY_HIGH_CV = 30.0       # CV > 30% indicates dynamic price dispersion
THRESHOLD_VOLATILITY_MODERATE_CV = 15.0   # CV 15-30% indicates standard yield variation

THRESHOLD_WALKUP_PREMIUM_HIGH = 60.0     # >60% markup from advance to walk-up is high surge
THRESHOLD_WALKUP_PREMIUM_MODERATE = 25.0 # >25% markup indicates standard advance curve

THRESHOLD_CARRIER_SPREAD_PCT_HIGH = 35.0 # >35% difference between lowest & highest carrier
THRESHOLD_CARRIER_SPREAD_PCT_MOD = 15.0  # >15% difference between carriers

MIN_COMPETITIVE_CARRIER_COUNT = 3        # <=2 observed carriers indicates concentrated corridor

POLICY_DISCLAIMER = (
    "PUSHPAK Analytical Priority Classification: Evaluative decision-support heuristic for "
    "prototype assessment. NOT an official statutory classification or DGCA/MoCA regulatory mandate."
)

DATA_HONESTY_NOTE = (
    "Metrics reflect observed historical dataset records and prototype simulation observations, "
    "not active daily air traffic control schedules or live market quotes."
)


def compute_walkup_premium(windows: List[Dict[str, Any]]) -> Optional[float]:
    """
    Computes walk-up premium percentage: ((T+1 avg - Advance avg) / Advance avg) * 100.
    Uses T+45 as default baseline advance bucket.
    """
    if not windows:
        return None

    t1_bucket = next((w for w in windows if w.get("lead_time_bucket") == "T+1"), None)
    # Prefer T+45, fallback to latest available bucket
    t_adv_bucket = next((w for w in windows if w.get("lead_time_bucket") == "T+45"), None)
    if not t_adv_bucket and len(windows) > 1:
        t_adv_bucket = windows[-1]

    if t1_bucket and t_adv_bucket and t_adv_bucket.get("avg_fare", 0) > 0:
        premium = ((t1_bucket["avg_fare"] - t_adv_bucket["avg_fare"]) / t_adv_bucket["avg_fare"]) * 100.0
        return round(premium, 2)

    return None


def compute_carrier_spread(
    airlines: List[Dict[str, Any]],
    market_avg: float
) -> Optional[Dict[str, float]]:
    """
    Calculates rupee spread and percentage spread between lowest and highest carrier averages.
    """
    if not airlines or len(airlines) < 2 or market_avg <= 0:
        return None

    fares = [a["avg_fare"] for a in airlines]
    min_fare = min(fares)
    max_fare = max(fares)
    spread_rupees = round(max_fare - min_fare, 2)
    spread_pct = round((spread_rupees / market_avg) * 100.0, 2)

    return {
        "spread_rupees": spread_rupees,
        "spread_pct": spread_pct,
        "min_carrier_avg": min_fare,
        "max_carrier_avg": max_fare,
    }


def classify_route_policy_priority(
    cv_percent: float,
    walkup_premium_pct: Optional[float],
    carrier_spread_pct: Optional[float],
    observed_carriers_count: int
) -> Dict[str, Any]:
    """
    Deterministic rule-based policy priority classifier.
    Assigns HIGH_ATTENTION, MONITOR, or LOW_ATTENTION with full traceability.
    """
    triggers: List[str] = []
    score = 1
    category = "LOW_ATTENTION"

    # Evaluate High Attention triggers
    if cv_percent > THRESHOLD_VOLATILITY_HIGH_CV:
        triggers.append(f"High fare volatility (CV {cv_percent:.1f}% > {THRESHOLD_VOLATILITY_HIGH_CV}%)")
    if walkup_premium_pct is not None and walkup_premium_pct > THRESHOLD_WALKUP_PREMIUM_HIGH:
        triggers.append(f"Severe walk-up markup (+{walkup_premium_pct:.1f}% > {THRESHOLD_WALKUP_PREMIUM_HIGH}%)")
    if (
        carrier_spread_pct is not None
        and carrier_spread_pct > THRESHOLD_CARRIER_SPREAD_PCT_HIGH
        and observed_carriers_count < MIN_COMPETITIVE_CARRIER_COUNT
    ):
        triggers.append(
            f"High carrier price dispersion ({carrier_spread_pct:.1f}%) with limited competition ({observed_carriers_count} carriers)"
        )

    if triggers:
        category = "HIGH_ATTENTION"
        score = 3
    else:
        # Evaluate Monitor triggers
        monitor_triggers: List[str] = []
        if cv_percent >= THRESHOLD_VOLATILITY_MODERATE_CV:
            monitor_triggers.append(f"Moderate fare volatility (CV {cv_percent:.1f}%)")
        if walkup_premium_pct is not None and walkup_premium_pct >= THRESHOLD_WALKUP_PREMIUM_MODERATE:
            monitor_triggers.append(f"Moderate walk-up premium (+{walkup_premium_pct:.1f}%)")
        if carrier_spread_pct is not None and carrier_spread_pct >= THRESHOLD_CARRIER_SPREAD_PCT_MOD:
            monitor_triggers.append(f"Moderate carrier fare spread ({carrier_spread_pct:.1f}%)")

        if monitor_triggers:
            category = "MONITOR"
            score = 2
            triggers = monitor_triggers
        else:
            category = "LOW_ATTENTION"
            score = 1
            triggers = ["Stable pricing dynamics with predictable advance and carrier benchmarks"]

    return {
        "priority_category": category,
        "priority_score": score,
        "primary_trigger": "; ".join(triggers),
        "thresholds_applied": {
            "volatility_high_cv": THRESHOLD_VOLATILITY_HIGH_CV,
            "volatility_moderate_cv": THRESHOLD_VOLATILITY_MODERATE_CV,
            "walkup_premium_high_pct": THRESHOLD_WALKUP_PREMIUM_HIGH,
            "walkup_premium_moderate_pct": THRESHOLD_WALKUP_PREMIUM_MODERATE,
            "carrier_spread_high_pct": THRESHOLD_CARRIER_SPREAD_PCT_HIGH,
            "min_competitive_carriers": MIN_COMPETITIVE_CARRIER_COUNT,
        },
        "classification_notice": POLICY_DISCLAIMER
    }


def generate_route_policy_flags(
    route_code: str,
    stats: Dict[str, Any],
    windows: List[Dict[str, Any]],
    airlines: List[Dict[str, Any]],
    observed_carriers_count: int
) -> List[Dict[str, Any]]:
    """
    Generates quantitative, numbers-traceable policy flags for a corridor.
    Zero vague AI text; every explanation links directly to arithmetic metrics.
    """
    flags: List[Dict[str, Any]] = []
    norm_route = route_code.upper().strip()
    cv = stats.get("coefficient_of_variation", 0.0)
    std_dev = stats.get("std_dev", 0.0)
    mean_fare = stats.get("mean_fare", 0.0)

    # 1. Volatility Flag
    if cv > THRESHOLD_VOLATILITY_HIGH_CV:
        flags.append({
            "flag_code": "HIGH_VOLATILITY",
            "severity": "HIGH",
            "route_code": norm_route,
            "title": "High Fare Volatility Detected",
            "explanation": (
                f"Observed Coefficient of Variation on {norm_route} is {cv:.2f}%, exceeding the "
                f"{THRESHOLD_VOLATILITY_HIGH_CV}% threshold (standard deviation: ₹{std_dev:,.2f} around mean ₹{mean_fare:,.2f})."
            ),
            "underlying_metrics": {
                "cv_percent": cv,
                "sample_std_dev": std_dev,
                "mean_fare": mean_fare
            },
            "data_disclaimer": DATA_HONESTY_NOTE
        })
    elif cv >= THRESHOLD_VOLATILITY_MODERATE_CV:
        flags.append({
            "flag_code": "HIGH_VOLATILITY",
            "severity": "MEDIUM",
            "route_code": norm_route,
            "title": "Moderate Fare Volatility",
            "explanation": (
                f"Observed Coefficient of Variation is {cv:.2f}%, within the standard revenue management band "
                f"({THRESHOLD_VOLATILITY_MODERATE_CV}% to {THRESHOLD_VOLATILITY_HIGH_CV}%)."
            ),
            "underlying_metrics": {
                "cv_percent": cv,
                "sample_std_dev": std_dev,
                "mean_fare": mean_fare
            },
            "data_disclaimer": DATA_HONESTY_NOTE
        })

    # 2. Walk-up Premium Flag
    premium_pct = compute_walkup_premium(windows)
    if premium_pct is not None:
        if premium_pct > THRESHOLD_WALKUP_PREMIUM_HIGH:
            flags.append({
                "flag_code": "HIGH_WALKUP_PREMIUM",
                "severity": "HIGH",
                "route_code": norm_route,
                "title": "Severe Walk-Up Fare Premium",
                "explanation": (
                    f"Last-minute T+1 bookings command an average +{premium_pct:.1f}% premium over 45-day advance bookings, "
                    f"exceeding the {THRESHOLD_WALKUP_PREMIUM_HIGH}% policy benchmark."
                ),
                "underlying_metrics": {
                    "walkup_premium_pct": premium_pct,
                    "threshold_pct": THRESHOLD_WALKUP_PREMIUM_HIGH
                },
                "data_disclaimer": DATA_HONESTY_NOTE
            })
        elif premium_pct >= THRESHOLD_WALKUP_PREMIUM_MODERATE:
            flags.append({
                "flag_code": "HIGH_WALKUP_PREMIUM",
                "severity": "MEDIUM",
                "route_code": norm_route,
                "title": "Noticeable Advance Booking Spread",
                "explanation": (
                    f"T+1 bookings command an average +{premium_pct:.1f}% markup over advance bookings, indicating active "
                    f"lead-time dynamic pricing."
                ),
                "underlying_metrics": {
                    "walkup_premium_pct": premium_pct,
                    "threshold_pct": THRESHOLD_WALKUP_PREMIUM_MODERATE
                },
                "data_disclaimer": DATA_HONESTY_NOTE
            })

    # 3. Limited Competition Flag
    if observed_carriers_count <= 2:
        flags.append({
            "flag_code": "LIMITED_OBSERVED_COMPETITION",
            "severity": "HIGH" if observed_carriers_count <= 1 else "MEDIUM",
            "route_code": norm_route,
            "title": "Limited Carrier Competition in Dataset",
            "explanation": (
                f"Only {observed_carriers_count} operating airlines observed on corridor {norm_route} "
                f"(competitive benchmark is >= {MIN_COMPETITIVE_CARRIER_COUNT} carriers)."
            ),
            "underlying_metrics": {
                "observed_carriers_count": observed_carriers_count,
                "benchmark_carriers": MIN_COMPETITIVE_CARRIER_COUNT
            },
            "data_disclaimer": DATA_HONESTY_NOTE
        })

    # 4. Inter-Carrier Price Spread Flag
    spread_info = compute_carrier_spread(airlines, mean_fare)
    if spread_info:
        spread_pct = spread_info["spread_pct"]
        spread_rs = spread_info["spread_rupees"]
        if spread_pct > THRESHOLD_CARRIER_SPREAD_PCT_HIGH:
            flags.append({
                "flag_code": "SIGNIFICANT_PRICE_SPREAD",
                "severity": "HIGH",
                "route_code": norm_route,
                "title": "Substantial Inter-Carrier Fare Disparity",
                "explanation": (
                    f"Inter-carrier price spread on {norm_route} is ₹{spread_rs:,.2f} ({spread_pct:.1f}% of route average), "
                    f"signaling significant carrier price dispersion."
                ),
                "underlying_metrics": spread_info,
                "data_disclaimer": DATA_HONESTY_NOTE
            })
        elif spread_pct >= THRESHOLD_CARRIER_SPREAD_PCT_MOD:
            flags.append({
                "flag_code": "SIGNIFICANT_PRICE_SPREAD",
                "severity": "MEDIUM",
                "route_code": norm_route,
                "title": "Moderate Inter-Carrier Fare Difference",
                "explanation": (
                    f"Inter-carrier price spread is ₹{spread_rs:,.2f} ({spread_pct:.1f}% of route average)."
                ),
                "underlying_metrics": spread_info,
                "data_disclaimer": DATA_HONESTY_NOTE
            })

    return flags


def get_route_policy_assessment(route_code: str) -> Optional[Dict[str, Any]]:
    """
    Assembles a complete, auditable policy decision-support assessment for a corridor.
    Returns None if route has no fare observations.
    """
    norm_route = route_code.upper().strip()
    stats = get_route_fare_stats(norm_route)
    if not stats:
        return None

    windows = get_booking_window_analysis(norm_route)
    airlines = get_airline_fare_comparison(norm_route)
    network_summary = get_route_network_summary(norm_route)

    source_city = "UNKNOWN"
    dest_city = "UNKNOWN"
    observed_flight_records = 0
    non_stop_ratio = 0.0

    if network_summary:
        n_info = network_summary[0]
        source_city = n_info.get("source_city", "UNKNOWN")
        dest_city = n_info.get("destination_city", "UNKNOWN")
        observed_flight_records = n_info.get("observed_flight_records", 0)
        non_stop_count = n_info.get("non_stop_records", 0)
        if observed_flight_records > 0:
            non_stop_ratio = round(non_stop_count / observed_flight_records, 3)

    walkup_premium = compute_walkup_premium(windows)
    spread_info = compute_carrier_spread(airlines, stats.get("mean_fare", 0.0))
    carrier_spread_pct = spread_info["spread_pct"] if spread_info else None
    carrier_spread_rs = spread_info["spread_rupees"] if spread_info else None
    observed_carriers_count = len(airlines)

    priority = classify_route_policy_priority(
        cv_percent=stats["coefficient_of_variation"],
        walkup_premium_pct=walkup_premium,
        carrier_spread_pct=carrier_spread_pct,
        observed_carriers_count=observed_carriers_count
    )

    flags = generate_route_policy_flags(
        route_code=norm_route,
        stats=stats,
        windows=windows,
        airlines=airlines,
        observed_carriers_count=observed_carriers_count
    )

    return {
        "route_code": norm_route,
        "source_city": source_city,
        "destination_city": dest_city,
        "priority_classification": priority,
        "volatility_cv": stats["coefficient_of_variation"],
        "walkup_premium_pct": walkup_premium,
        "carrier_price_spread": carrier_spread_rs,
        "observed_flight_records": observed_flight_records,
        "observed_airlines_count": observed_carriers_count,
        "non_stop_ratio": non_stop_ratio,
        "flags": flags,
        "provenance": {
            "data_mode": stats["data_mode"],
            "environment": stats["environment"],
            "observation_count": stats["observation_count"],
            "data_honesty_note": DATA_HONESTY_NOTE
        }
    }


def get_network_policy_overview() -> Dict[str, Any]:
    """
    Computes a network-wide macro policy overview summarizing monitored corridors,
    priority distributions, top surge routes, and total active policy flags.
    """
    routes = get_all_routes_fare_summary()
    total_monitored = len(routes)

    priority_counts = {"HIGH_ATTENTION": 0, "MONITOR": 0, "LOW_ATTENTION": 0}
    flags_by_severity = {"HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    all_assessments: List[Dict[str, Any]] = []

    for r in routes:
        assessment = get_route_policy_assessment(r["route_code"])
        if assessment:
            all_assessments.append(assessment)
            cat = assessment["priority_classification"]["priority_category"]
            priority_counts[cat] = priority_counts.get(cat, 0) + 1
            for flag in assessment["flags"]:
                sev = flag.get("severity", "INFO")
                flags_by_severity[sev] = flags_by_severity.get(sev, 0) + 1

    total_flags = sum(flags_by_severity.values())

    # Sort routes by volatility descending
    highest_volatility = sorted(
        [
            {
                "route_code": a["route_code"],
                "source_city": a["source_city"],
                "destination_city": a["destination_city"],
                "volatility_cv": a["volatility_cv"],
                "priority_category": a["priority_classification"]["priority_category"],
            }
            for a in all_assessments
        ],
        key=lambda x: x["volatility_cv"],
        reverse=True
    )

    # Sort routes by walkup premium descending
    highest_premiums = sorted(
        [
            {
                "route_code": a["route_code"],
                "source_city": a["source_city"],
                "destination_city": a["destination_city"],
                "walkup_premium_pct": a["walkup_premium_pct"],
                "priority_category": a["priority_classification"]["priority_category"],
            }
            for a in all_assessments
            if a["walkup_premium_pct"] is not None
        ],
        key=lambda x: x["walkup_premium_pct"] or 0.0,
        reverse=True
    )

    avg_carriers = (
        round(sum(a["observed_airlines_count"] for a in all_assessments) / total_monitored, 2)
        if total_monitored > 0 else 0.0
    )

    return {
        "total_monitored_routes": total_monitored,
        "priority_distribution": priority_counts,
        "total_active_flags": total_flags,
        "flags_by_severity": flags_by_severity,
        "highest_volatility_routes": highest_volatility,
        "highest_walkup_premium_routes": highest_premiums,
        "competition_summary": {
            "average_active_carriers_per_corridor": avg_carriers,
            "corridors_with_limited_competition": sum(
                1 for a in all_assessments if a["observed_airlines_count"] < MIN_COMPETITIVE_CARRIER_COUNT
            ),
            "benchmark_carrier_threshold": MIN_COMPETITIVE_CARRIER_COUNT
        },
        "data_clarification": DATA_HONESTY_NOTE
    }


def get_all_policy_flags(
    severity: Optional[str] = None,
    route_code: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Returns filtered or complete list of all policy flags across monitored routes.
    """
    routes = get_all_routes_fare_summary()
    all_flags: List[Dict[str, Any]] = []

    for r in routes:
        if route_code and r["route_code"] != route_code.upper().strip():
            continue
        assessment = get_route_policy_assessment(r["route_code"])
        if assessment:
            for flag in assessment["flags"]:
                if severity and flag.get("severity", "").upper() != severity.upper().strip():
                    continue
                all_flags.append(flag)

    return all_flags
