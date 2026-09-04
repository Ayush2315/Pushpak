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
