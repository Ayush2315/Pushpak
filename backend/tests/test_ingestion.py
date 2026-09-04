import pytest
import sqlite3
from pathlib import Path
from backend.ingestion.mock_adapter import MockDemoConnector
from backend.ingestion.sandbox_adapter import SandboxApiConnector
from backend.ingestion.pipeline import run_ingestion_pipeline
from backend.core.database import get_connection
from backend.models.observation import DataMode, Environment

def test_mock_connector_offline():
    """Confirms MockDemoConnector generates data offline for target routes."""
    connector = MockDemoConnector()
    assert connector.health_check() is True
    assert connector.data_mode == DataMode.DEMO_SIMULATION
    assert connector.environment == Environment.OFFLINE

    records = connector.fetch_fares(
        origin="DEL",
        destination="BOM",
        departure_date="2026-09-11",
        lead_time_bucket="T+7",
        lead_time_days=7
    )
    assert len(records) == 3  # IndiGo, Air India, SpiceJet
    for r in records:
        assert r["origin"] == "DEL"
        assert r["destination"] == "BOM"
        assert r["base_fare"] > 0
        assert r["total_fare"] >= r["base_fare"]
        assert len(r["source_hash"]) == 16

def test_sandbox_connector_graceful_skip():
    """Confirms SandboxApiConnector handles missing configuration safely."""
    connector = SandboxApiConnector()
    # Without keys configured, health_check must return False safely
    assert connector.health_check() is False
    # Fetch fares must safely yield empty list without error
    fares = connector.fetch_fares("DEL", "BOM", "2026-09-11", "T+7", 7)
    assert fares == []

def test_pipeline_execution_and_sqlite_wal(tmp_path):
    """Confirms end-to-end pipeline inserts >= 100 records and SQLite runs in WAL mode."""
    test_db = tmp_path / "test_pushpak.db"
    
    # Run pipeline on default 3 routes
    summary = run_ingestion_pipeline(include_sandbox=False)

    assert summary["status"] == "SUCCESS"
    assert summary["records_ingested_this_run"] >= 100
    assert set(summary["routes_covered"]) == {"DEL-BOM", "DEL-BLR", "BOM-BLR"}
    assert set(summary["lead_windows"]) == {"T+1", "T+7", "T+15", "T+30", "T+45"}

    # Verify directly via SQLite connection
    conn = get_connection()
    cursor = conn.cursor()

    # Check WAL mode
    wal_status = cursor.execute("PRAGMA journal_mode;").fetchone()[0]
    assert wal_status.lower() == "wal"

    # Check count
    total_count = cursor.execute("SELECT COUNT(*) FROM fare_observations;").fetchone()[0]
    assert total_count >= 100

    # Check routes represented
    distinct_routes = [r[0] for r in cursor.execute("SELECT DISTINCT route_code FROM fare_observations;").fetchall()]
    assert "DEL-BOM" in distinct_routes
    assert "DEL-BLR" in distinct_routes
    assert "BOM-BLR" in distinct_routes

    # Check lead times represented
    distinct_buckets = [r[0] for r in cursor.execute("SELECT DISTINCT lead_time_bucket FROM fare_observations;").fetchall()]
    assert set(distinct_buckets) == {"T+1", "T+7", "T+15", "T+30", "T+45"}

    conn.close()

def test_mock_connector_determinism():
    """Confirms MockDemoConnector generates 100% deterministic, predictable results for identical inputs."""
    connector = MockDemoConnector()
    run1 = connector.fetch_fares("DEL", "BOM", "2026-09-12", "T+7", 7)
    run2 = connector.fetch_fares("DEL", "BOM", "2026-09-12", "T+7", 7)

    assert run1 == run2, "MockDemoConnector output must be identical across runs for identical inputs"
    assert len(run1) == 3
    for r1, r2 in zip(run1, run2):
        assert r1["observation_id"] == r2["observation_id"]
        assert r1["base_fare"] == r2["base_fare"]
        assert r1["total_fare"] == r2["total_fare"]
        assert r1["source_hash"] == r2["source_hash"]

def test_pipeline_idempotency_no_duplicates():
    """Confirms running the pipeline multiple times does not produce duplicate observations."""
    from datetime import datetime, timezone
    fixed_date = datetime(2026, 9, 5, tzinfo=timezone.utc)

    # First run
    summary1 = run_ingestion_pipeline(base_date=fixed_date, include_sandbox=False)
    count1 = summary1["total_records_in_db"]

    # Second run with identical base date
    summary2 = run_ingestion_pipeline(base_date=fixed_date, include_sandbox=False)
    count2 = summary2["total_records_in_db"]

    assert count1 == count2, f"Idempotency violated: Run 1 had {count1} records, but Run 2 had {count2} records"

    # Confirm no duplicate observation_id values in SQLite
    conn = get_connection()
    cursor = conn.cursor()
    dup_check = cursor.execute("""
        SELECT observation_id, COUNT(*) 
        FROM fare_observations 
        GROUP BY observation_id 
        HAVING COUNT(*) > 1;
    """).fetchall()
    conn.close()

    assert len(dup_check) == 0, f"Found duplicate observation IDs: {dup_check}"

def test_pipeline_reset_functionality():
    """Confirms pipeline reset flag cleanly purges demo data and repopulates."""
    from datetime import datetime, timezone
    fixed_date = datetime(2026, 9, 5, tzinfo=timezone.utc)

    # Run with reset
    summary = run_ingestion_pipeline(base_date=fixed_date, include_sandbox=False, reset_demo=True)
    assert summary["status"] == "SUCCESS"
    assert summary["records_ingested_this_run"] == 135
    assert summary["total_records_in_db"] == 135

