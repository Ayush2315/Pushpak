import pytest
from backend.models.registry import FlightRecord, resolve_iata
from backend.models.observation import DataMode, Environment
from backend.ingestion.pdf_registry_parser import (
    ingest_flight_registry,
    load_seed_fallback,
    SEED_FALLBACK_PATH,
)
from backend.analytics.network_analytics import (
    get_route_network_summary,
    get_airline_market_presence,
    get_departure_time_distribution,
    get_stops_breakdown,
)
from backend.core.database import get_connection

def test_iata_city_resolution():
    """Confirms Indian cities resolve accurately to 3-letter IATA codes."""
    assert resolve_iata("Delhi") == "DEL"
    assert resolve_iata("New Delhi") == "DEL"
    assert resolve_iata("Mumbai") == "BOM"
    assert resolve_iata("Bangalore") == "BLR"
    assert resolve_iata("Bengaluru") == "BLR"
    assert resolve_iata("Kolkata") == "CCU"
    assert resolve_iata("Hyderabad") == "HYD"
    assert resolve_iata("Chennai") == "MAA"

def test_flight_record_deterministic_id_and_time_slots():
    """
    Confirms:
    1. Departure/arrival times are preserved as categories (not fabricated clock times).
    2. Record IDs are deterministically derived from all fields.
    3. Repeated flight numbers with different cabin classes or slots produce distinct IDs.
    """
    rec_econ = FlightRecord.create_from_raw(
        airline="Air_India",
        flight="AI-805",
        source_city="Delhi",
        departure_time="Afternoon",
        stops="zero",
        arrival_time="Evening",
        destination_city="Mumbai",
        class_name="Economy",
        duration=2.33,
        is_real_pdf=True
    )
    rec_biz = FlightRecord.create_from_raw(
        airline="Air_India",
        flight="AI-805",
        source_city="Delhi",
        departure_time="Afternoon",
        stops="zero",
        arrival_time="Evening",
        destination_city="Mumbai",
        class_name="Business",
        duration=2.33,
        is_real_pdf=True
    )

    # Identical inputs must yield identical deterministic ID
    rec_econ_duplicate = FlightRecord.create_from_raw(
        airline="Air_India",
        flight="AI-805",
        source_city="Delhi",
        departure_time="Afternoon",
        stops="zero",
        arrival_time="Evening",
        destination_city="Mumbai",
        class_name="Economy",
        duration=2.33,
        is_real_pdf=True
    )
    assert rec_econ.flight_id == rec_econ_duplicate.flight_id
    assert rec_econ.flight_id.startswith("REC-")

    # Different class on same flight number must yield distinct deterministic IDs
    assert rec_econ.flight_id != rec_biz.flight_id

    # Time slots preserved faithfully
    assert rec_econ.departure_time == "Afternoon"
    assert rec_econ.arrival_time == "Evening"
    assert rec_econ.origin_code == "DEL"
    assert rec_econ.destination_code == "BOM"
    assert rec_econ.route_code == "DEL-BOM"
    assert rec_econ.data_mode == DataMode.HISTORICAL
    assert rec_econ.source_type == "pdf_dataset"

def test_fallback_seed_labeling():
    """Confirms fallback seed data is honestly labeled as demo_simulation and seed_fallback."""
    rec_fallback = FlightRecord.create_from_raw(
        airline="SpiceJet",
        flight="SG-8709",
        source_city="Delhi",
        departure_time="Early_Morning",
        stops="zero",
        arrival_time="Morning",
        destination_city="Mumbai",
        class_name="Economy",
        duration=2.17,
        is_real_pdf=False
    )
    assert rec_fallback.data_mode == DataMode.DEMO_SIMULATION
    assert rec_fallback.source_type == "seed_fallback"

def test_ingestion_and_sqlite_route_view():
    """
    Confirms registry ingestion populates flight_registry table and v_route_network view.
    """
    summary = ingest_flight_registry(force_fallback=True, reset_registry=False)
    assert summary["status"] == "SUCCESS"
    assert summary["records_ingested_this_run"] > 30
    assert summary["distinct_routes_indexed"] >= 5

    # Check v_route_network view directly in SQLite
    conn = get_connection()
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM v_route_network WHERE route_code = 'DEL-BOM'").fetchone()

    assert row is not None
    assert row["origin_code"] == "DEL"
    assert row["destination_code"] == "BOM"
    # Faithfully labelled as observed_flight_records (not daily frequency)
    assert row["observed_flight_records"] >= 5
    assert row["active_airlines_count"] >= 3
    assert row["avg_duration_hours"] > 0

    # If real PDF records are present, clean up the temporary seed_fallback records
    # so flight_registry maintains a pristine historical dataset of exactly 50,000 records.
    has_pdf_data = cursor.execute(
        "SELECT COUNT(*) FROM flight_registry WHERE source_type = 'pdf_dataset';"
    ).fetchone()[0] > 0
    if has_pdf_data:
        cursor.execute("DELETE FROM flight_registry WHERE source_type = 'seed_fallback';")
        conn.commit()
    conn.close()

def test_network_analytics():
    """Confirms network analytics functions compute correct shares and distributions."""
    # Ensure database has registry records
    conn = get_connection()
    cursor = conn.cursor()
    reg_count = cursor.execute("SELECT COUNT(*) FROM flight_registry;").fetchone()[0]
    conn.close()
    if reg_count == 0:
        ingest_flight_registry(force_fallback=True)

    # Route summary
    routes = get_route_network_summary()
    assert len(routes) > 0
    del_bom = [r for r in routes if r["route_code"] == "DEL-BOM"][0]
    assert del_bom["observed_flight_records"] > 0

    # Airline market presence
    carriers = get_airline_market_presence("DEL-BOM")
    assert len(carriers) >= 3
    total_share = sum(c["share_percentage"] for c in carriers)
    assert 99.0 <= total_share <= 101.0  # Floating point sum near 100%


    # Departure slots distribution
    slots = get_departure_time_distribution("DEL-BOM")
    assert len(slots) > 0
    slot_names = [s["time_slot"] for s in slots]
    # At least some of the categories exist
    assert any(name in ["Morning", "Afternoon", "Evening", "Night", "Early_Morning"] for name in slot_names)

    # Stops breakdown
    stops = get_stops_breakdown("DEL-BOM")
    assert len(stops) > 0
