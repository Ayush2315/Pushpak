"""
Integration tests for FastAPI Airfare Acquisition Endpoints
Testing /sources, /run, /history, and /observations.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_api_acquisition_sources_endpoint():
    response = client.get("/api/v1/acquisition/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["count"] >= 3
    assert any(s["source_id"] == "demo_airfare_connector" for s in data["sources"])


def test_api_acquisition_run_endpoint_success():
    payload = {
        "source_id": "demo_airfare_connector",
        "route_code": "DEL-BOM",
        "advance_purchase_window": 15
    }
    response = client.post("/api/v1/acquisition/run", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "success"
    data = res["data"]
    assert data["route_code"] == "DEL-BOM"
    assert data["records_retrieved"] >= 10
    assert data["records_accepted"] >= 8
    assert data["duplicates_detected"] >= 1
    assert data["records_rejected"] >= 0
    assert data["records_retrieved"] == data["records_accepted"] + data["records_rejected"]
    assert len(data["stages"]) == 9
    assert len(data["accepted_observations"]) == data["records_accepted"]


def test_api_acquisition_run_invalid_source():
    payload = {
        "source_id": "non_existent_source",
        "route_code": "DEL-BOM",
        "advance_purchase_window": 15
    }
    response = client.post("/api/v1/acquisition/run", json=payload)
    assert response.status_code == 400
    assert "Unknown connector" in response.json()["message"]


def test_api_acquisition_run_inactive_connector():
    payload = {
        "source_id": "indigo_direct_api",
        "route_code": "DEL-BOM",
        "advance_purchase_window": 15
    }
    response = client.post("/api/v1/acquisition/run", json=payload)
    assert response.status_code == 400
    assert "not currently active" in response.json()["message"]


def test_api_acquisition_history_endpoint():
    response = client.get("/api/v1/acquisition/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["runs"], list)
    assert len(data["runs"]) >= 1
    first_run = data["runs"][0]
    assert "run_id" in first_run
    assert "provenance_hash" in first_run


def test_api_acquisition_observations_endpoint():
    response = client.get("/api/v1/acquisition/observations?route_code=DEL-BOM&limit=20")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["observations"], list)
    if len(data["observations"]) > 0:
        obs = data["observations"][0]
        assert obs["route_code"] == "DEL-BOM"
        assert obs["currency"] == "INR"
        assert obs["duplicate_status"] == "UNIQUE"
        assert "provenance_hash" in obs


def test_api_acquisition_scenarios_endpoint():
    response = client.get("/api/v1/acquisition/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["scenario_count"] == 5
    assert len(data["scenarios"]) == 5
    # Verify each scenario has required fields
    for sc in data["scenarios"]:
        assert "label" in sc
        assert "retrieved" in sc
        assert "accepted" in sc
        assert "fare_multiplier" in sc
        assert sc["accepted"] == sc["retrieved"] - sc["invalid"] - sc["duplicates"]


def test_api_acquisition_compare_endpoint():
    # Run two cycles to generate history
    p1 = {"source_id": "demo_airfare_connector", "route_code": "DEL-BOM", "advance_purchase_window": 15}
    r1 = client.post("/api/v1/acquisition/run", json=p1).json()["data"]

    p2 = {"source_id": "demo_airfare_connector", "route_code": "DEL-BOM", "advance_purchase_window": 15}
    r2 = client.post("/api/v1/acquisition/run", json=p2).json()["data"]

    # Call compare for the latest run
    res = client.get(f"/api/v1/acquisition/compare/{r2['run_id']}")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    audit = data["audit"]
    assert audit["current_run_id"] == r2["run_id"]
    assert audit["has_previous"] is True
    assert "delta_records_retrieved" in audit
    assert "delta_records_accepted" in audit
    assert "status_label" in audit
    assert "current_stats" in audit
    assert "previous_stats" in audit


def test_consecutive_runs_differ():
    """Verify consecutive acquisition runs produce genuinely different metrics or fare distributions."""
    p1 = {"source_id": "demo_airfare_connector", "route_code": "DEL-BLR", "advance_purchase_window": 7}
    r1 = client.post("/api/v1/acquisition/run", json=p1).json()["data"]

    p2 = {"source_id": "demo_airfare_connector", "route_code": "DEL-BLR", "advance_purchase_window": 7}
    r2 = client.post("/api/v1/acquisition/run", json=p2).json()["data"]

    # Compare either the counts or average fares
    fares_1 = [o["total_fare"] for o in r1["accepted_observations"]]
    fares_2 = [o["total_fare"] for o in r2["accepted_observations"]]
    mean_1 = sum(fares_1) / len(fares_1) if fares_1 else 0
    mean_2 = sum(fares_2) / len(fares_2) if fares_2 else 0

    has_different_counts = (
        r1["records_retrieved"] != r2["records_retrieved"] or
        r1["records_accepted"] != r2["records_accepted"] or
        r1["duplicates_detected"] != r2["duplicates_detected"]
    )
    has_different_fares = abs(mean_1 - mean_2) > 0.01

    assert has_different_counts or has_different_fares
