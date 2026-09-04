import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.analytics.policy_intelligence import (
    get_route_policy_assessment,
    get_network_policy_overview,
    get_all_policy_flags,
    classify_route_policy_priority,
    compute_walkup_premium,
    compute_carrier_spread,
    generate_route_policy_flags,
)
from backend.analytics.fare_analytics import get_route_fare_stats

@pytest.fixture
def client():
    return TestClient(app)

# ====================================================================
# 1. CORE POLICY INTELLIGENCE ENGINE TESTS
# ====================================================================

def test_route_policy_assessment_valid_route():
    """Confirms route policy assessment generates complete dossier for DEL-BOM."""
    assessment = get_route_policy_assessment("DEL-BOM")
    assert assessment is not None
    assert assessment["route_code"] == "DEL-BOM"
    assert assessment["source_city"] == "Delhi"
    assert assessment["destination_city"] == "Mumbai"
    assert assessment["volatility_cv"] > 0
    assert assessment["observed_flight_records"] > 0
    assert assessment["observed_airlines_count"] >= 3

    # Priority classification checks
    priority = assessment["priority_classification"]
    assert priority["priority_category"] in ["HIGH_ATTENTION", "MONITOR", "LOW_ATTENTION"]
    assert priority["priority_score"] in [1, 2, 3]
    assert "PUSHPAK Analytical Priority Classification" in priority["classification_notice"]
    assert "thresholds_applied" in priority

    # Flags check
    assert isinstance(assessment["flags"], list)
    assert len(assessment["flags"]) > 0

    # Provenance
    assert assessment["provenance"]["data_mode"] == "demo_simulation"
    assert "not active daily air traffic" in assessment["provenance"]["data_honesty_note"].lower()


def test_route_policy_assessment_invalid_route():
    """Confirms non-existent route safely returns None."""
    assessment = get_route_policy_assessment("NONEXISTENT-ROUTE")
    assert assessment is None


def test_policy_classification_determinism():
    """Confirms running classification repeatedly with identical inputs yields 100% identical outputs."""
    p1 = classify_route_policy_priority(
        cv_percent=23.67,
        walkup_premium_pct=72.23,
        carrier_spread_pct=25.0,
        observed_carriers_count=3
    )
    p2 = classify_route_policy_priority(
        cv_percent=23.67,
        walkup_premium_pct=72.23,
        carrier_spread_pct=25.0,
        observed_carriers_count=3
    )
    assert p1 == p2

    a1 = get_route_policy_assessment("DEL-BOM")
    a2 = get_route_policy_assessment("DEL-BOM")
    assert a1 == a2


def test_policy_priority_classification_rules():
    """Tests exact priority classification rule thresholds."""
    # High attention due to high CV (>30%)
    c_high_cv = classify_route_policy_priority(
        cv_percent=32.0, walkup_premium_pct=10.0, carrier_spread_pct=5.0, observed_carriers_count=4
    )
    assert c_high_cv["priority_category"] == "HIGH_ATTENTION"
    assert c_high_cv["priority_score"] == 3

    # High attention due to severe walk-up premium (>60%)
    c_high_prem = classify_route_policy_priority(
        cv_percent=12.0, walkup_premium_pct=65.0, carrier_spread_pct=5.0, observed_carriers_count=4
    )
    assert c_high_prem["priority_category"] == "HIGH_ATTENTION"

    # Monitor due to moderate CV (15-30%)
    c_mon = classify_route_policy_priority(
        cv_percent=20.0, walkup_premium_pct=15.0, carrier_spread_pct=10.0, observed_carriers_count=4
    )
    assert c_mon["priority_category"] == "MONITOR"
    assert c_mon["priority_score"] == 2

    # Low attention when all metrics are stable
    c_low = classify_route_policy_priority(
        cv_percent=10.0, walkup_premium_pct=10.0, carrier_spread_pct=5.0, observed_carriers_count=4
    )
    assert c_low["priority_category"] == "LOW_ATTENTION"
    assert c_low["priority_score"] == 1


def test_policy_flags_contain_explanations_and_metrics():
    """Confirms generated policy flags have structured titles, numbers-traceable explanations, and metrics."""
    flags = get_all_policy_flags(route_code="DEL-BOM")
    assert len(flags) > 0

    for flag in flags:
        assert flag["flag_code"] in [
            "HIGH_VOLATILITY",
            "HIGH_WALKUP_PREMIUM",
            "LIMITED_OBSERVED_COMPETITION",
            "SIGNIFICANT_PRICE_SPREAD",
        ]
        assert flag["severity"] in ["HIGH", "MEDIUM", "LOW", "INFO"]
        assert len(flag["title"]) > 0
        assert len(flag["explanation"]) > 0
        assert isinstance(flag["underlying_metrics"], dict)
        assert len(flag["underlying_metrics"]) > 0
        assert "data_disclaimer" in flag
        # Zero AI hallucination wording
        assert "ai" not in flag["explanation"].lower() or "air" in flag["explanation"].lower()


def test_network_policy_overview():
    """Confirms network overview computes correct totals and distributions."""
    overview = get_network_policy_overview()
    assert overview["total_monitored_routes"] >= 3
    assert "priority_distribution" in overview
    assert overview["total_active_flags"] >= 1
    assert "flags_by_severity" in overview
    assert len(overview["highest_volatility_routes"]) >= 3
    assert len(overview["highest_walkup_premium_routes"]) >= 1

    # Check competition summary
    comp = overview["competition_summary"]
    assert comp["average_active_carriers_per_corridor"] > 0
    assert comp["benchmark_carrier_threshold"] == 3

    # Check honest terminology
    assert "observed historical dataset records" in overview["data_clarification"].lower()
    assert "live air traffic" not in overview["data_clarification"].lower()


# ====================================================================
# 2. REST API INTEGRATION TESTS
# ====================================================================

def test_api_route_policy_assessment_success(client):
    """Confirms GET /api/v1/policy/routes/{route_code} returns HTTP 200 with valid schema."""
    response = client.get("/api/v1/policy/routes/DEL-BOM")
    assert response.status_code == 200
    data = response.json()
    assert data["route_code"] == "DEL-BOM"
    assert data["priority_classification"]["priority_category"] in ["HIGH_ATTENTION", "MONITOR", "LOW_ATTENTION"]
    assert len(data["flags"]) > 0
    assert "provenance" in data


def test_api_route_policy_assessment_not_found(client):
    """Confirms GET /api/v1/policy/routes/INVALID returns HTTP 404 with structured ErrorResponse."""
    response = client.get("/api/v1/policy/routes/DEL-NONEXISTENT")
    assert response.status_code == 404
    data = response.json()
    assert data["error"] == "HTTPException"
    assert data["status_code"] == 404
    assert "not found" in data["message"].lower()
    assert "timestamp" in data


def test_api_network_policy_overview(client):
    """Confirms GET /api/v1/policy/network returns HTTP 200 with valid macro overview."""
    response = client.get("/api/v1/policy/network")
    assert response.status_code == 200
    data = response.json()
    assert data["total_monitored_routes"] >= 3
    assert "priority_distribution" in data
    assert "highest_volatility_routes" in data
    assert "data_clarification" in data


def test_api_policy_flags_filtering(client):
    """Confirms GET /api/v1/policy/flags returns filtered flags by severity and route."""
    # All flags
    res_all = client.get("/api/v1/policy/flags")
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert data_all["total_flags"] > 0

    # Filter by route
    res_route = client.get("/api/v1/policy/flags?route_code=DEL-BOM")
    assert res_route.status_code == 200
    data_route = res_route.json()
    for f in data_route["flags"]:
        assert f["route_code"] == "DEL-BOM"

    # Filter by severity
    res_sev = client.get("/api/v1/policy/flags?severity=HIGH")
    assert res_sev.status_code == 200
    data_sev = res_sev.json()
    for f in data_sev["flags"]:
        assert f["severity"] == "HIGH"
