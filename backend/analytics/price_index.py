from typing import Dict, Any, List, Optional
from backend.core.database import get_connection

# ====================================================================
# PUSHPAK PRICE INDEX CONFIGURATION & STATUTORY DISCLAIMERS
# ====================================================================

INDEX_BASE_VALUE = 100.0  # Base convention: Base = 100.00
DEFAULT_BASE_BUCKET = "T+45"  # Advance structural baseline horizon

CORE_EXCLUDED_HORIZONS = ["T+1", "T+7"]  # Volatile walk-up surge horizons excluded from Core
CORE_INCLUDED_HORIZONS = ["T+15", "T+30", "T+45"]  # Structural planning horizons included in Core

INDEX_DISCLAIMER = (
    "PUSHPAK Prototype Analytical Index generated from available prototype observations. "
    "Simulation-based analytical output. This is not an official Government of India CPI series, "
    "nor an official MoSPI/DGCA statutory index."
)

WEIGHTING_DISCLAIMER = (
    "Prototype analytical weighting derived from observed flight registry records. "
    "Not an official MoSPI CPI weight structure."
)


def get_representative_route_basket() -> List[str]:
    """
    Dynamically detects available representative route corridors possessing fare observations.
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
    return routes


def get_route_weights(
    basket: List[str],
    weighting_method: str = "observed_records"
) -> Dict[str, Dict[str, float]]:
    """
    Computes analytical route weights across the representative basket.
    Supported methods:
      - 'observed_records': Volume-weighted by observed records in flight registry
      - 'equal_weights': Unweighted arithmetic average (1 / K)
    """
    if not basket:
        return {}

    weights_result: Dict[str, Dict[str, float]] = {}

    if weighting_method == "equal_weights":
        equal_w = round(1.0 / len(basket), 4)
        for r in basket:
            weights_result[r] = {
                "weight": equal_w,
                "weight_pct": round(equal_w * 100.0, 2)
            }
        return weights_result

    # Default: observed_records
    conn = get_connection()
    cursor = conn.cursor()
    counts: Dict[str, int] = {}
    total_records = 0

    for r in basket:
        cnt = cursor.execute(
            "SELECT COUNT(*) FROM flight_registry WHERE route_code = ?;", (r,)
        ).fetchone()[0]
        counts[r] = cnt
        total_records += cnt
    conn.close()

    if total_records == 0:
        equal_w = round(1.0 / len(basket), 4)
        for r in basket:
            weights_result[r] = {"weight": equal_w, "weight_pct": round(equal_w * 100.0, 2)}
        return weights_result

    # Compute normalized weights
    for r in basket:
        w = round(counts[r] / total_records, 4)
        weights_result[r] = {
            "weight": w,
            "weight_pct": round(w * 100.0, 2),
            "observed_records": counts[r]
        }

    return weights_result


def calculate_route_price_relative(
    route_code: str,
    base_bucket: str = DEFAULT_BASE_BUCKET,
    horizon_filter: Optional[List[str]] = None
) -> Optional[Dict[str, Any]]:
    """
    Computes price relative R_i = Current_Fare / Base_Fare for a specific corridor.
    Base Fare defaults to advance planning benchmark (T+45).
    """
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Base fare query (T+45)
    cursor.execute("""
        SELECT AVG(total_fare), COUNT(*)
        FROM fare_observations
        WHERE route_code = ? AND lead_time_bucket = ?;
    """, (route_code.upper().strip(), base_bucket))
    base_row = cursor.fetchone()

    if not base_row or base_row[0] is None or base_row[0] <= 0:
        # Fallback to route overall average if base_bucket missing
        cursor.execute("""
            SELECT AVG(total_fare), COUNT(*)
            FROM fare_observations
            WHERE route_code = ?;
        """, (route_code.upper().strip(),))
        base_row = cursor.fetchone()
        if not base_row or base_row[0] is None or base_row[0] <= 0:
            conn.close()
            return None

    base_fare = round(float(base_row[0]), 2)

    # 2. Current fare query (filtered by horizons if specified)
    if horizon_filter:
        placeholders = ",".join("?" for _ in horizon_filter)
        sql = f"""
            SELECT AVG(total_fare), COUNT(*)
            FROM fare_observations
            WHERE route_code = ? AND lead_time_bucket IN ({placeholders});
        """
        cursor.execute(sql, [route_code.upper().strip()] + horizon_filter)
    else:
        cursor.execute("""
            SELECT AVG(total_fare), COUNT(*)
            FROM fare_observations
            WHERE route_code = ?;
        """, (route_code.upper().strip(),))

    cur_row = cursor.fetchone()
    conn.close()

    if not cur_row or cur_row[0] is None or cur_row[0] <= 0:
        return None

    current_fare = round(float(cur_row[0]), 2)
    obs_count = int(cur_row[1])

    price_relative = round(current_fare / base_fare, 4)
    route_index = round(price_relative * 100.0, 2)

    return {
        "route_code": route_code.upper().strip(),
        "base_fare": base_fare,
        "current_fare": current_fare,
        "price_relative": price_relative,
        "route_index": route_index,
        "observation_count": obs_count
    }


def get_headline_index(weighting_method: str = "observed_records") -> Dict[str, Any]:
    """
    Computes PUSHPAK Headline Price Index across all representative corridors
    and all booking horizons (T+1 to T+45).
    Captures full dynamic pricing, last-minute walk-up surge, and seasonal shifts.
    """
    basket = get_representative_route_basket()
    weights = get_route_weights(basket, weighting_method=weighting_method)

    conn = get_connection()
    cursor = conn.cursor()

    route_contributions = []
    composite_index = 0.0
    total_observations = 0

    for r in basket:
        rel = calculate_route_price_relative(r, base_bucket=DEFAULT_BASE_BUCKET, horizon_filter=None)
        if not rel:
            continue

        # Get route city metadata
        cursor.execute("SELECT source_city, destination_city FROM v_route_network WHERE route_code = ?;", (r,))
        city_row = cursor.fetchone()
        source_city = city_row["source_city"] if city_row else "UNKNOWN"
        dest_city = city_row["destination_city"] if city_row else "UNKNOWN"

        w_info = weights.get(r, {"weight": 1.0 / len(basket), "weight_pct": 100.0 / len(basket)})
        w = w_info["weight"]
        weighted_contrib = round(w * rel["route_index"], 2)
        composite_index += w * rel["route_index"]
        total_observations += rel["observation_count"]

        route_contributions.append({
            "route_code": r,
            "source_city": source_city,
            "destination_city": dest_city,
            "weight": w,
            "weight_pct": w_info["weight_pct"],
            "base_fare": rel["base_fare"],
            "current_fare": rel["current_fare"],
            "price_relative": rel["price_relative"],
            "route_index": rel["route_index"],
            "weighted_contribution": weighted_contrib,
            "observation_count": rel["observation_count"]
        })

    conn.close()

    final_index = round(composite_index, 2)
    movement = round(final_index - INDEX_BASE_VALUE, 2)
    pct_movement = round(((final_index - INDEX_BASE_VALUE) / INDEX_BASE_VALUE) * 100.0, 2)

    return {
        "index_name": "PUSHPAK Headline Airfare Price Index",
        "index_code": "PUSHPAK_HEADLINE",
        "index_value": final_index,
        "base_value": INDEX_BASE_VALUE,
        "movement": movement,
        "percentage_movement": pct_movement,
        "route_count": len(route_contributions),
        "observation_count": total_observations,
        "weighting_method": f"{weighting_method} ({WEIGHTING_DISCLAIMER})",
        "route_contributions": route_contributions,
        "methodology_note": (
            "Headline Index encompasses all observed booking horizons (T+1, T+7, T+15, T+30, T+45). "
            "Reflects comprehensive market pricing including last-minute walk-up surge premiums."
        ),
        "excluded_factors": None,
        "data_mode": "demo_simulation",
        "environment": "offline",
        "disclaimer": INDEX_DISCLAIMER
    }


def get_core_index(weighting_method: str = "observed_records") -> Dict[str, Any]:
    """
    Computes PUSHPAK Core Price Index, isolating structural airfare movements
    by excluding high-volatility short-term walk-up horizons (T+1, T+7).
    Analogous to Core CPI excluding volatile food and energy components.
    """
    basket = get_representative_route_basket()
    weights = get_route_weights(basket, weighting_method=weighting_method)

    conn = get_connection()
    cursor = conn.cursor()

    route_contributions = []
    composite_index = 0.0
    total_observations = 0

    for r in basket:
        rel = calculate_route_price_relative(
            r,
            base_bucket=DEFAULT_BASE_BUCKET,
            horizon_filter=CORE_INCLUDED_HORIZONS
        )
        if not rel:
            continue

        cursor.execute("SELECT source_city, destination_city FROM v_route_network WHERE route_code = ?;", (r,))
        city_row = cursor.fetchone()
        source_city = city_row["source_city"] if city_row else "UNKNOWN"
        dest_city = city_row["destination_city"] if city_row else "UNKNOWN"

        w_info = weights.get(r, {"weight": 1.0 / len(basket), "weight_pct": 100.0 / len(basket)})
        w = w_info["weight"]
        weighted_contrib = round(w * rel["route_index"], 2)
        composite_index += w * rel["route_index"]
        total_observations += rel["observation_count"]

        route_contributions.append({
            "route_code": r,
            "source_city": source_city,
            "destination_city": dest_city,
            "weight": w,
            "weight_pct": w_info["weight_pct"],
            "base_fare": rel["base_fare"],
            "current_fare": rel["current_fare"],
            "price_relative": rel["price_relative"],
            "route_index": rel["route_index"],
            "weighted_contribution": weighted_contrib,
            "observation_count": rel["observation_count"]
        })

    conn.close()

    final_index = round(composite_index, 2)
    movement = round(final_index - INDEX_BASE_VALUE, 2)
    pct_movement = round(((final_index - INDEX_BASE_VALUE) / INDEX_BASE_VALUE) * 100.0, 2)

    return {
        "index_name": "PUSHPAK Core Airfare Price Index",
        "index_code": "PUSHPAK_CORE",
        "index_value": final_index,
        "base_value": INDEX_BASE_VALUE,
        "movement": movement,
        "percentage_movement": pct_movement,
        "route_count": len(route_contributions),
        "observation_count": total_observations,
        "weighting_method": f"{weighting_method} ({WEIGHTING_DISCLAIMER})",
        "route_contributions": route_contributions,
        "methodology_note": (
            "Core Index isolates structural airline capacity pricing by measuring medium-to-long advance "
            "horizons (T+15, T+30, T+45) and explicitly filtering out volatile short-term walk-up surge pricing."
        ),
        "excluded_factors": [
            "T+1 walk-up horizon (1-day advance booking)",
            "T+7 near-term horizon (7-day advance booking)"
        ],
        "data_mode": "demo_simulation",
        "environment": "offline",
        "disclaimer": INDEX_DISCLAIMER
    }


def get_index_summary(weighting_method: str = "observed_records") -> Dict[str, Any]:
    """
    Provides a comprehensive decision-support summary comparing Headline and Core indices,
    isolating the Walk-Up Surge Spread and providing economic interpretation.
    """
    headline = get_headline_index(weighting_method=weighting_method)
    core = get_core_index(weighting_method=weighting_method)

    h_val = headline["index_value"]
    c_val = core["index_value"]

    surge_spread_points = round(h_val - c_val, 2)
    surge_spread_pct = round(((h_val - c_val) / c_val) * 100.0, 2) if c_val > 0 else 0.0

    interpretation = (
        f"The PUSHPAK Headline Index stands at {h_val:.2f} (+{headline['percentage_movement']:.2f}% vs base), "
        f"while the PUSHPAK Core Index stands at {c_val:.2f} (+{core['percentage_movement']:.2f}% vs base). "
        f"The {surge_spread_points:+.2f} point spread ({surge_spread_pct:+.2f}%) represents the isolated "
        f"premium attributable directly to short-term walk-up surge pricing across the representative network."
    )

    basket = [rc["route_code"] for rc in headline["route_contributions"]]

    return {
        "headline_index": h_val,
        "core_index": c_val,
        "surge_spread_points": surge_spread_points,
        "surge_spread_pct": surge_spread_pct,
        "representative_routes_count": len(basket),
        "route_basket": basket,
        "weighting_method": headline["weighting_method"],
        "analytical_interpretation": interpretation,
        "provenance": {
            "headline_observation_count": headline["observation_count"],
            "core_observation_count": core["observation_count"],
            "data_mode": headline["data_mode"],
            "environment": headline["environment"],
            "integrity_rule": "Deterministic Laspeyres-type aggregation from audited database observations."
        },
        "disclaimer": INDEX_DISCLAIMER
    }


def get_index_methodology() -> Dict[str, Any]:
    """
    Returns transparent metadata documenting index construction, formulas,
    weighting methodology, limitations, and statutory disclaimers.
    """
    return {
        "index_family": "PUSHPAK Civil Aviation Price Index Suite",
        "base_convention": "Base = 100.00 established at T+45 advance purchase baseline horizon.",
        "headline_methodology": (
            "Comprehensive weighted arithmetic price relative aggregation across all representative corridors "
            "and all booking horizons (T+1, T+7, T+15, T+30, T+45)."
        ),
        "core_methodology": (
            "Trimmed horizon index measuring underlying structural airfare trends across medium-to-long advance "
            "horizons (T+15, T+30, T+45), excluding volatile short-term walk-up surge horizons (T+1, T+7)."
        ),
        "mathematical_formula": (
            "Route Price Relative: R_i = P_current,i / P_base,i; "
            "Composite Index: I = Sum(w_i * R_i * 100) where Sum(w_i) = 1.0."
        ),
        "weighting_strategy": (
            "Volume-proportional weighting derived from cumulative observed flight registry records per corridor, "
            "normalizing to unity (Sum(w_i) = 1.0000). Equal-weights aggregation is supported as an analytical variant."
        ),
        "route_basket_selection": (
            "Dynamically constructed from domestic corridors possessing validated airfare observations. "
            "Current prototype basket covers trunk corridors DEL-BOM, DEL-BLR, and BOM-BLR."
        ),
        "data_requirements": (
            "Requires validated micro-fare observations tagged with lead time horizons, cabin class, "
            "and cryptographic source hashes."
        ),
        "limitations": [
            "Prototype observations are generated from deterministic mock/simulation connectors.",
            "Historical flight frequency is derived from dataset sample size rather than active ATC radar.",
            "Weights reflect observed dataset corridor volume rather than official MoSPI consumer expenditure surveys."
        ],
        "cpi_alignment_explanation": (
            "Aligns with IMF and ILO Consumer Price Index standards for high-frequency transport index tracking. "
            "Engineered to augment MoSPI CPI Transport & Communication subgroup analysis."
        ),
        "statutory_disclaimer": INDEX_DISCLAIMER
    }
