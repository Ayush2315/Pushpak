import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ingestion.live_connector import LiveAirfareConnector, live_connector

client = TestClient(app)

def test_live_status_endpoint():
    response = client.get("/api/v1/live/status")
    assert response.status_code == 200
    data = response.json()
    assert "connector_name" in data
    assert "operational_status" in data
    assert "source_apis" in data
    assert len(data["source_apis"]) >= 2

def test_live_sources_endpoint():
    response = client.get("/api/v1/live/sources")
    assert response.status_code == 200
    data = response.json()
    assert "implemented_connector" in data
    assert "ethical_compliance" in data
    assert len(data["ethical_compliance"]) >= 3

def test_live_acquisition_pipeline_execution():
    # Test execution with route DEL-BOM and lead time 7
    payload = {"route_code": "DEL-BOM", "advance_purchase_window": 7}
    response = client.post("/api/v1/live/fetch", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["route_code"] == "DEL-BOM"
    assert data["advance_purchase_window"] == 7
    assert data["status"] == "success"
    assert "run_id" in data
    assert "integrity_hash" in data
    assert len(data["integrity_hash"]) == 64  # SHA-256 is 64 hex characters
    assert data["records_retrieved"] > 0
    assert data["accepted_records"] > 0
    assert data["invalid_records"] >= 1  # Verify validation caught the injected invalid record
    assert data["duplicates_removed"] >= 1  # Verify deduplication caught the duplicate
    assert len(data["pipeline_stages"]) == 7
    assert all(stage["status"] == "completed" for stage in data["pipeline_stages"])
    assert "live_telemetry" in data
    assert "statutory_notice" in data

def test_live_history_endpoint():
    response = client.get("/api/v1/live/history?limit=10")
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
    if history:
        run = history[0]
        assert "run_id" in run
        assert "integrity_hash" in run
        assert "route_code" in run

def test_live_connector_validation_logic():
    connector = LiveAirfareConnector()
    res = connector.execute_live_pipeline("BOM-BLR", 15)
    assert res["status"] == "success"
    assert res["route_code"] == "BOM-BLR"
    assert res["advance_purchase_window"] == 15
    assert res["records_retrieved"] >= res["accepted_records"]
