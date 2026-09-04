import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_government_latest_index_endpoint():
    response = client.get("/api/v1/government/index/latest")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "headline_index" in data
    assert "core_index" in data
    assert "walkup_surge_spread" in data
    assert data["headline_index"]["value"] > 100.0
    assert data["core_index"]["value"] > 100.0
    assert data["walkup_surge_spread"]["spread_points"] > 0
    assert "representative_route_basket" in data
    assert len(data["representative_route_basket"]) == 3
    assert "disclaimer" in data

def test_government_index_summary_endpoint():
    response = client.get("/api/v1/government/index/summary")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "methodology" in data
    assert "integration_standard" in data

def test_government_routes_endpoint():
    response = client.get("/api/v1/government/routes")
    assert response.status_code == 200
    data = response.json()
    assert "basket_routes" in data
    assert len(data["basket_routes"]) == 3
    assert data["weight_sum"] == 1.0000

def test_government_provenance_endpoint():
    response = client.get("/api/v1/government/provenance")
    assert response.status_code == 200
    data = response.json()
    assert "database_engine" in data
    assert "cryptographic_standard" in data
    assert "dataset_census" in data
    assert "transparency_guarantee" in data

def test_government_data_status_endpoint():
    response = client.get("/api/v1/government/data-status")
    assert response.status_code == 200
    data = response.json()
    assert "prototype_version" in data
    assert "dataset_architecture" in data
    assert data["dataset_architecture"]["flight_registry_records"] > 0
    assert data["dataset_architecture"]["deterministic_fare_observations"] > 0
    assert "evaluation_boundaries" in data
