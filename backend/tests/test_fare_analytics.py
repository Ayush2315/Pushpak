import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.analytics.fare_analytics import (
    get_route_fare_stats,
    get_booking_window_analysis,
    get_airline_fare_comparison,
    get_all_routes_fare_summary,
)
from backend.analytics.intelligence import (
    classify_route_volatility,
    generate_deterministic_insights,
    get_route_intelligence,
)

@pytest.fixture
def client():
    return TestClient(app)

# --------------------------------------------------------------------
# 1. CORE ANALYTICAL MATH TESTS
# --------------------------------------------------------------------

def test_route_fare_stats_math():
    stats = get_route_fare_stats("DEL-BOM")
    assert stats is not None
    assert stats["route_code"] == "DEL-BOM"
    assert stats["observation_count"] >= 45
    assert stats["min_fare"] > 0
    assert stats["max_fare"] > stats["min_fare"]
    assert stats["mean_fare"] > stats["min_fare"]
    assert stats["mean_fare"] < stats["max_fare"]
    assert stats["fare_range"] == round(stats["max_fare"] - stats["min_fare"], 2)
    assert stats["std_dev"] > 0
    assert stats["coefficient_of_variation"] > 0
    assert stats["data_mode"] == "demo_simulation"
    assert stats["environment"] == "offline"

def test_route_fare_stats_nonexistent():
    stats = get_route_fare_stats("DEL-MAA")
    assert stats is None

def test_booking_window_analysis_order_and_yield():
    windows = get_booking_window_analysis("DEL-BOM")
    assert len(windows) == 5
    buckets = [w["lead_time_bucket"] for w in windows]
    assert buckets == ["T+1", "T+7", "T+15", "T+30", "T+45"]

    # In standard revenue management yield curve, T+1 walk-up fare is higher than T+45 advance
    t1 = next(w for w in windows if w["lead_time_bucket"] == "T+1")
    t45 = next(w for w in windows if w["lead_time_bucket"] == "T+45")
    assert t1["avg_fare"] > t45["avg_fare"]
    assert t1["observation_count"] >= 9
    assert t45["observation_count"] >= 9

def test_airline_fare_comparison():
    airlines = get_airline_fare_comparison("DEL-BOM")
    assert len(airlines) == 3
    names = [a["airline_name"] for a in airlines]
    assert "Air India" in names
    assert "IndiGo" in names
    assert "SpiceJet" in names
    # Should be sorted by avg_fare ascending
    assert airlines[0]["avg_fare"] <= airlines[1]["avg_fare"] <= airlines[2]["avg_fare"]
    for a in airlines:
        assert a["observation_count"] >= 15
        assert a["booking_windows_covered"] == 5

def test_all_routes_fare_summary():
    summaries = get_all_routes_fare_summary()
    assert len(summaries) >= 3
    route_codes = [s["route_code"] for s in summaries]
    assert "DEL-BOM" in route_codes
    assert "DEL-BLR" in route_codes
    assert "BOM-BLR" in route_codes

# --------------------------------------------------------------------
# 2. CLASSIFICATION & EXPLAINABLE INSIGHT TESTS
# --------------------------------------------------------------------

def test_route_volatility_classification_bands():
    # Boundary: CV < 15.0 -> Stable
    assert classify_route_volatility(14.99)["band"] == "Stable"
    assert classify_route_volatility(0.0)["band"] == "Stable"

    # Boundary: 15.0 <= CV <= 30.0 -> Moderate Variation
    assert classify_route_volatility(15.00)["band"] == "Moderate Variation"
    assert classify_route_volatility(22.50)["band"] == "Moderate Variation"
    assert classify_route_volatility(30.00)["band"] == "Moderate Variation"

    # Boundary: CV > 30.0 -> High Variation
    assert classify_route_volatility(30.01)["band"] == "High Variation"
    assert classify_route_volatility(45.00)["band"] == "High Variation"

def test_determinism_consistency():
    """Confirms identical inputs produce 100% identical insights and classifications."""
    stats = get_route_fare_stats("DEL-BOM")
    windows = get_booking_window_analysis("DEL-BOM")
    airlines = get_airline_fare_comparison("DEL-BOM")

    c1 = classify_route_volatility(stats["coefficient_of_variation"])
    c2 = classify_route_volatility(stats["coefficient_of_variation"])
    assert c1 == c2

    i1 = generate_deterministic_insights(stats, windows, airlines)
    i2 = generate_deterministic_insights(stats, windows, airlines)
    assert i1 == i2

def test_deterministic_insights_generation():
    stats = get_route_fare_stats("DEL-BOM")
    windows = get_booking_window_analysis("DEL-BOM")
    airlines = get_airline_fare_comparison("DEL-BOM")

    insights = generate_deterministic_insights(stats, windows, airlines)
    assert len(insights) >= 3

    # Must contain provenance warning for simulation data
    assert any("[Simulation-Based Analytical Insight]" in i for i in insights)
    # Must mention walk-up vs advance
    assert any("T+1" in i for i in insights)
    # Must mention lowest average fare carrier
    assert any("lowest average fare carrier" in i for i in insights)

def test_get_route_intelligence_service():
    intel = get_route_intelligence("DEL-BOM")
    assert intel is not None
    assert intel["route_code"] == "DEL-BOM"
    assert intel["origin"] == "DEL"
    assert intel["destination"] == "BOM"
    assert intel["classification"]["band"] in ["Stable", "Moderate Variation", "High Variation"]
    assert intel["provenance"]["data_mode"] == "demo_simulation"

# --------------------------------------------------------------------
# 3. FASTAPI REST ENDPOINT TESTS
# --------------------------------------------------------------------

def test_api_route_intelligence_success(client):
    response = client.get("/api/v1/intelligence/routes/DEL-BOM")
    assert response.status_code == 200
    data = response.json()
    assert data["route_code"] == "DEL-BOM"
    assert data["fare_summary"]["observation_count"] >= 45
    assert len(data["booking_windows"]) == 5
    assert len(data["airline_comparison"]) == 3
    assert "classification" in data
    assert "insights" in data
    assert data["provenance"]["data_mode"] == "demo_simulation"

def test_api_route_intelligence_not_found(client):
    response = client.get("/api/v1/intelligence/routes/DEL-MAA")
    assert response.status_code == 404
    err = response.json()
    assert err["status_code"] == 404
    assert "message" in err or "detail" in err

def test_api_booking_windows_endpoint(client):
    # Cross-network
    resp1 = client.get("/api/v1/intelligence/booking-windows")
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert len(data1["booking_windows"]) == 5

    # Filtered by route
    resp2 = client.get("/api/v1/intelligence/booking-windows?route_code=DEL-BLR")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["route_code"] == "DEL-BLR"
    assert len(data2["booking_windows"]) == 5

def test_api_compare_airlines_endpoint(client):
    resp = client.get("/api/v1/intelligence/compare-airlines?route_code=BOM-BLR")
    assert resp.status_code == 200
    data = resp.json()
    assert data["route_code"] == "BOM-BLR"
    assert len(data["airline_comparison"]) == 3

def test_api_fare_index_endpoint(client):
    resp = client.get("/api/v1/intelligence/fare-index")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_routes_with_fare_observations"] >= 3
    assert len(data["routes"]) >= 3

