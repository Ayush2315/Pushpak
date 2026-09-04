import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.database import init_db
from backend.ingestion.pipeline import run_ingestion_pipeline
from backend.ingestion.pdf_registry_parser import ingest_flight_registry

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database_data():
    """Ensure database has baseline observations and registry records for tests."""
    init_db()
    from backend.core.database import get_connection
    conn = get_connection()
    cursor = conn.cursor()
    fare_count = cursor.execute("SELECT COUNT(*) FROM fare_observations;").fetchone()[0]
    reg_count = cursor.execute("SELECT COUNT(*) FROM flight_registry;").fetchone()[0]
    conn.close()

    # Populate fare observations if empty
    if fare_count == 0:
        run_ingestion_pipeline(include_sandbox=False)
    # Populate flight registry fallback only if empty
    if reg_count == 0:
        ingest_flight_registry(force_fallback=True)


def test_root_health_check():
    """Confirms GET /health returns 200 with service and database metadata."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "PUSHPAK" in data["service"]

def test_v1_health_check():
    """Confirms GET /api/v1/health returns 200."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_flights_pagination():
    """Confirms GET /api/v1/flights returns paginated records."""
    response = client.get("/api/v1/flights?limit=10&offset=0")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert data["limit"] == 10
    assert data["offset"] == 0
    assert len(data["items"]) <= 10
    if data["items"]:
        item = data["items"][0]
        assert "flight_id" in item
        assert "route_code" in item
        assert item["data_mode"] in ["historical", "demo_simulation"]

def test_list_flights_filtering():
    """Confirms filtering flights by origin and destination."""
    response = client.get("/api/v1/flights?origin=DEL&destination=BOM&limit=20")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["origin_code"] == "DEL"
        assert item["destination_code"] == "BOM"
        assert item["route_code"] == "DEL-BOM"

def test_get_flight_by_id_success():
    """Confirms retrieving a single flight by its ID."""
    # First get an existing ID
    list_res = client.get("/api/v1/flights?limit=1")
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert len(items) > 0
    target_id = items[0]["flight_id"]

    # Fetch by ID
    get_res = client.get(f"/api/v1/flights/{target_id}")
    assert get_res.status_code == 200
    flight = get_res.json()
    assert flight["flight_id"] == target_id
    assert "departure_time" in flight

def test_get_flight_by_id_not_found():
    """Confirms HTTP 404 on non-existent flight ID."""
    response = client.get("/api/v1/flights/REC-DOESNOTEXIST999")
    assert response.status_code == 404
    error = response.json()
    assert "not found" in error["message"].lower()

def test_list_routes():
    """Confirms GET /api/v1/routes returns route network summaries."""
    response = client.get("/api/v1/routes")
    assert response.status_code == 200
    routes = response.json()
    assert isinstance(routes, list)
    assert len(routes) > 0
    route = routes[0]
    assert "route_code" in route
    assert "observed_flight_records" in route
    assert "active_airlines_count" in route

def test_get_route_details_success():
    """Confirms GET /api/v1/routes/{route_code} returns comprehensive route intelligence."""
    response = client.get("/api/v1/routes/DEL-BOM")
    assert response.status_code == 200
    data = response.json()
    assert "route_summary" in data
    assert data["route_summary"]["route_code"] == "DEL-BOM"
    assert "operating_airlines" in data
    assert "departure_slots" in data
    assert "stops_breakdown" in data
    assert "data_clarification" in data

def test_get_route_details_not_found():
    """Confirms HTTP 404 on invalid route code."""
    response = client.get("/api/v1/routes/DEL-NONEXISTENT")
    assert response.status_code == 404

def test_airline_analytics():
    """Confirms GET /api/v1/analytics/airlines returns relative carrier share and disclaimer."""
    response = client.get("/api/v1/analytics/airlines")
    assert response.status_code == 200
    data = response.json()
    assert data["total_operating_airlines"] > 0
    assert len(data["carriers"]) > 0
    assert "data_clarification" in data

def test_network_analytics():
    """Confirms GET /api/v1/analytics/network returns high-level network totals."""
    response = client.get("/api/v1/analytics/network")
    assert response.status_code == 200
    data = response.json()
    assert data["total_routes_indexed"] > 0
    assert data["total_observed_flight_records"] > 0
    assert data["total_operating_airlines"] > 0
    assert len(data["top_routes_by_records"]) > 0

def test_list_fares_provenance():
    """Confirms GET /api/v1/fares preserves data_mode, environment, and source_hash."""
    response = client.get("/api/v1/fares?route_code=DEL-BOM&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["items"]) > 0
    fare = data["items"][0]
    assert fare["route_code"] == "DEL-BOM"
    assert fare["data_mode"] in ["demo_simulation", "external_connector", "official", "historical"]
    assert fare["environment"] in ["production", "sandbox", "offline"]
    assert len(fare["source_hash"]) == 16
    assert fare["total_fare"] > 0

def test_provenance_summary_endpoint():
    """Confirms GET /api/v1/provenance returns comprehensive audit breakdown."""
    response = client.get("/api/v1/provenance")
    assert response.status_code == 200
    data = response.json()
    assert data["total_observations_across_system"] > 0
    assert len(data["provenance_breakdown"]) > 0
    assert "data_honesty_statement" in data

def test_openapi_documentation_accessible():
    """Confirms Swagger UI and OpenAPI JSON endpoints return 200."""
    res_docs = client.get("/docs")
    assert res_docs.status_code == 200

    res_redoc = client.get("/redoc")
    assert res_redoc.status_code == 200

    res_json = client.get("/openapi.json")
    assert res_json.status_code == 200
    openapi = res_json.json()
    assert openapi["info"]["title"] == "PUSHPAK Civil Aviation Intelligence API"

def test_malformed_query_parameter_validation():
    """Confirms malformed query parameters return HTTP 422 with structured ErrorResponse."""
    response = client.get("/api/v1/flights?limit=-5")
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "ValidationError"
    assert data["status_code"] == 422
    assert "timestamp" in data
    assert "limit" in data["message"]
