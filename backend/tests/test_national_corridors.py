import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.analytics.national_corridors import get_top_10_corridors, get_corridor_by_code

client = TestClient(app)

def test_top_10_corridors_analytics_structure():
    corridors = get_top_10_corridors()
    assert len(corridors) == 10
    assert corridors[0]["route_code"] == "DEL-BOM"
    assert corridors[0]["rank"] == 1
    assert corridors[0]["is_in_representative_basket"] is True
    
    # Check that basket separation exists
    basket_routes = [c for c in corridors if c["is_in_representative_basket"]]
    explorer_only = [c for c in corridors if not c["is_in_representative_basket"]]
    assert len(basket_routes) == 3
    assert len(explorer_only) == 7

def test_get_corridor_by_code():
    corridor = get_corridor_by_code("DEL-BOM")
    assert corridor is not None
    assert corridor["source_city"] == "Delhi"
    assert corridor["destination_city"] == "Mumbai"
    assert corridor["distance_km"] > 1000

    non_existent = get_corridor_by_code("XYZ-ABC")
    assert non_existent is None

def test_api_top10_corridors_endpoint():
    response = client.get("/api/v1/corridors/top10")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_corridors"] == 10
    assert data["representative_basket_count"] == 3
    assert data["explorer_only_count"] == 7
    assert len(data["corridors"]) == 10

def test_api_get_corridor_details_success():
    response = client.get("/api/v1/corridors/DEL-BLR")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["corridor"]["route_code"] == "DEL-BLR"
    assert data["corridor"]["is_in_representative_basket"] is True

def test_api_get_corridor_details_not_found():
    response = client.get("/api/v1/corridors/UNKNOWN-ROUTE")
    assert response.status_code == 404
