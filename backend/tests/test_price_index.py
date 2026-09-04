import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.analytics.price_index import (
    get_headline_index,
    get_core_index,
    get_index_summary,
    get_index_methodology,
    get_representative_route_basket,
    get_route_weights,
    calculate_route_price_relative,
    INDEX_BASE_VALUE,
    INDEX_DISCLAIMER,
)

@pytest.fixture
def client():
    return TestClient(app)

# ====================================================================
# 1. CORE PRICE INDEX ENGINE UNIT TESTS
# ====================================================================

def test_representative_route_basket_detection():
    """Confirms route basket is dynamically extracted from available fare observations."""
    basket = get_representative_route_basket()
    assert isinstance(basket, list)
    assert len(basket) >= 3
    assert "DEL-BOM" in basket
    assert "DEL-BLR" in basket
    assert "BOM-BLR" in basket


def test_route_weights_sum_to_unity():
    """Confirms corridor weights normalize to 1.0000 (100%) for both weighting modes."""
    basket = get_representative_route_basket()

    # 1. Observed records weighting
    weights_vol = get_route_weights(basket, weighting_method="observed_records")
    total_w_vol = sum(v["weight"] for v in weights_vol.values())
    total_pct_vol = sum(v["weight_pct"] for v in weights_vol.values())
    assert 0.999 <= total_w_vol <= 1.001
    assert 99.9 <= total_pct_vol <= 100.1

    # 2. Equal weights
    weights_eq = get_route_weights(basket, weighting_method="equal_weights")
    total_w_eq = sum(v["weight"] for v in weights_eq.values())
    assert 0.999 <= total_w_eq <= 1.001


def test_headline_index_calculation_and_base_convention():
    """Confirms Headline Index computes against Base = 100.00 with mathematical consistency."""
    headline = get_headline_index()
    assert headline is not None
    assert headline["index_code"] == "PUSHPAK_HEADLINE"
    assert headline["base_value"] == INDEX_BASE_VALUE
    assert headline["index_value"] > INDEX_BASE_VALUE  # Dynamic pricing and walk-up surge elevate above base
    assert headline["movement"] == round(headline["index_value"] - INDEX_BASE_VALUE, 2)
    assert headline["percentage_movement"] == round(((headline["index_value"] - INDEX_BASE_VALUE) / INDEX_BASE_VALUE) * 100.0, 2)
    assert headline["route_count"] >= 3
    assert headline["observation_count"] >= 135

    # Check route contributions sum to index_value
    contrib_sum = sum(rc["weighted_contribution"] for rc in headline["route_contributions"])
    assert abs(contrib_sum - headline["index_value"]) <= 0.15  # Allow minor rounding discrepancy across components


def test_headline_index_determinism():
    """Confirms repeated calculations yield 100% identical outputs."""
    h1 = get_headline_index()
    h2 = get_headline_index()
    assert h1 == h2


def test_core_index_calculation_and_factors():
    """Confirms Core Index isolates structural trends and documents excluded walk-up factors."""
    core = get_core_index()
    assert core is not None
    assert core["index_code"] == "PUSHPAK_CORE"
    assert core["base_value"] == INDEX_BASE_VALUE
    assert core["index_value"] > INDEX_BASE_VALUE
    assert isinstance(core["excluded_factors"], list)
    assert any("T+1" in f for f in core["excluded_factors"])
    assert any("T+7" in f for f in core["excluded_factors"])


def test_core_index_determinism():
    """Confirms repeated Core calculations yield 100% identical outputs."""
    c1 = get_core_index()
    c2 = get_core_index()
    assert c1 == c2


def test_headline_vs_core_methodology_divergence():
    """
    Confirms economic principle: Headline Index is higher than Core Index
    because Headline includes volatile short-term walk-up surge pricing (T+1 and T+7).
    """
    headline = get_headline_index()
    core = get_core_index()

    assert headline["index_value"] > core["index_value"]
    spread = round(headline["index_value"] - core["index_value"], 2)
    assert spread > 10.0  # Demonstrates meaningful walk-up surge premium


def test_nonexistent_route_price_relative():
    """Confirms querying a non-existent route safely returns None."""
    rel = calculate_route_price_relative("NONEXISTENT-ROUTE")
    assert rel is None


def test_index_summary_spread_and_interpretation():
    """Confirms summary endpoint properly computes surge spread points and economic interpretation."""
    summary = get_index_summary()
    assert summary["headline_index"] > summary["core_index"]
    assert summary["surge_spread_points"] == round(summary["headline_index"] - summary["core_index"], 2)
    assert summary["surge_spread_pct"] > 0
    assert len(summary["route_basket"]) >= 3
    assert "analytical_interpretation" in summary
    assert "provenance" in summary
    assert INDEX_DISCLAIMER in summary["disclaimer"]


def test_index_methodology_metadata():
    """Confirms methodology metadata contains formulas, limitations, and CPI alignment."""
    method = get_index_methodology()
    assert "Base = 100.00" in method["base_convention"]
    assert "Sum(w_i * R_i * 100)" in method["mathematical_formula"]
    assert len(method["limitations"]) >= 3
    assert "MoSPI CPI" in method["cpi_alignment_explanation"]
    assert INDEX_DISCLAIMER in method["statutory_disclaimer"]


# ====================================================================
# 2. REST API INTEGRATION TESTS
# ====================================================================

def test_api_headline_index_endpoint(client):
    """Confirms GET /api/v1/index/headline returns HTTP 200 with valid schema."""
    response = client.get("/api/v1/index/headline")
    assert response.status_code == 200
    data = response.json()
    assert data["index_code"] == "PUSHPAK_HEADLINE"
    assert data["base_value"] == 100.0
    assert data["index_value"] > 100.0
    assert len(data["route_contributions"]) >= 3
    assert data["data_mode"] == "demo_simulation"
    assert "Prototype Analytical Index" in data["disclaimer"]


def test_api_core_index_endpoint(client):
    """Confirms GET /api/v1/index/core returns HTTP 200 with valid schema."""
    response = client.get("/api/v1/index/core")
    assert response.status_code == 200
    data = response.json()
    assert data["index_code"] == "PUSHPAK_CORE"
    assert data["base_value"] == 100.0
    assert len(data["excluded_factors"]) >= 2
    assert "Prototype Analytical Index" in data["disclaimer"]


def test_api_index_summary_endpoint(client):
    """Confirms GET /api/v1/index/summary returns HTTP 200 with surge spread."""
    response = client.get("/api/v1/index/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["headline_index"] > data["core_index"]
    assert data["surge_spread_points"] > 0
    assert "provenance" in data


def test_api_index_methodology_endpoint(client):
    """Confirms GET /api/v1/index/methodology returns HTTP 200 with specifications."""
    response = client.get("/api/v1/index/methodology")
    assert response.status_code == 200
    data = response.json()
    assert "base_convention" in data
    assert "mathematical_formula" in data
    assert "limitations" in data
