"""
Unit tests for PUSHPAK Airfare Acquisition Architecture
Testing connector abstraction, 9-stage pipeline, validation engine,
deterministic deduplication, and SHA-256 provenance hashing.
"""

import pytest
from backend.ingestion.airfare_connector import (
    BaseAirfareConnector,
    DemoAirlineConnector,
    PlannedIndiGoNDCConnector,
    PlannedAirIndiaAmadeusConnector,
    get_available_connectors,
    run_airfare_pipeline,
)


def test_connector_initialization():
    demo = DemoAirlineConnector()
    assert demo.source_id == "demo_airfare_connector"
    assert demo.status == "active"
    assert demo.respects_robots_txt is True
    assert demo.rate_limit_per_minute > 0

    indigo = PlannedIndiGoNDCConnector()
    assert indigo.source_id == "indigo_direct_api"
    assert indigo.status == "architecture_ready"

    airindia = PlannedAirIndiaAmadeusConnector()
    assert airindia.source_id == "airindia_amadeus_ndc"
    assert airindia.status == "planned"


def test_get_available_connectors():
    connectors = get_available_connectors()
    assert len(connectors) >= 3
    source_ids = [c["source_id"] for c in connectors]
    assert "demo_airfare_connector" in source_ids
    assert "indigo_direct_api" in source_ids
    assert "airindia_amadeus_ndc" in source_ids


def test_validation_engine_rules():
    connector = DemoAirlineConnector()

    # Valid record
    valid_rec = {
        "origin": "DEL",
        "destination": "BOM",
        "route_code": "DEL-BOM",
        "carrier": "IndiGo",
        "flight_identifier": "6E-201",
        "departure_date": "2026-10-15",
        "fare_class": "Economy",
        "base_fare": 4500.0,
        "taxes": 705.0,
        "total_fare": 5205.0
    }
    is_valid, msg = connector.validate_record(valid_rec)
    assert is_valid is True
    assert msg == "VALID"

    # Missing required field
    invalid_missing = dict(valid_rec)
    invalid_missing["flight_identifier"] = ""
    is_valid, msg = connector.validate_record(invalid_missing)
    assert is_valid is False
    assert "Missing required field" in msg

    # Negative fare
    invalid_negative = dict(valid_rec)
    invalid_negative["base_fare"] = -100.0
    is_valid, msg = connector.validate_record(invalid_negative)
    assert is_valid is False
    assert "Non-positive" in msg

    # Arithmetic mismatch (base + taxes != total)
    invalid_math = dict(valid_rec)
    invalid_math["total_fare"] = 9999.0
    is_valid, msg = connector.validate_record(invalid_math)
    assert is_valid is False
    assert "arithmetic mismatch" in msg


def test_normalization_engine():
    connector = DemoAirlineConnector()
    raw = {
        "origin": "del",
        "destination": "bom",
        "route_code": "del-bom",
        "carrier": "Air India",
        "flight_identifier": "AI-101",
        "departure_date": "2026-10-15",
        "fare_class": "business class",
        "base_fare": 12000.456,
        "taxes": 1920.123,
        "total_fare": 13920.579,
        "currency": "inr"
    }
    norm = connector.normalize_record(raw)
    assert norm["origin"] == "DEL"
    assert norm["destination"] == "BOM"
    assert norm["route_code"] == "DEL-BOM"
    assert norm["currency"] == "INR"
    assert norm["fare_class"] == "Business"
    assert norm["base_fare"] == 12000.46
    assert norm["taxes"] == 1920.12
    assert norm["total_fare"] == 13920.58


def test_deterministic_deduplication():
    connector = DemoAirlineConnector()
    rec1 = {
        "carrier": "IndiGo",
        "origin": "DEL",
        "destination": "BOM",
        "departure_date": "2026-10-15",
        "advance_purchase_window": 15,
        "fare_class": "Economy",
        "total_fare": 5200.0
    }
    rec2 = dict(rec1)
    key1 = connector.compute_deduplication_key(rec1)
    key2 = connector.compute_deduplication_key(rec2)
    assert key1 == key2
    assert "INDIGO" in key1
    assert "DEL|BOM" in key1


def test_provenance_hash_integrity():
    connector = DemoAirlineConnector()
    obs = [
        {"carrier": "IndiGo", "flight_identifier": "6E-101", "total_fare": 5000.0, "raw_record_identifier": "raw_1"},
        {"carrier": "Air India", "flight_identifier": "AI-202", "total_fare": 6000.0, "raw_record_identifier": "raw_2"}
    ]
    hash1 = connector.generate_provenance_hash("RUN-001", obs)
    hash2 = connector.generate_provenance_hash("RUN-001", obs)
    assert hash1 == hash2
    assert len(hash1) == 64  # SHA-256 hex digest length


def test_nine_stage_pipeline_execution():
    result = run_airfare_pipeline(
        source_id="demo_airfare_connector",
        route_code="DEL-BLR",
        advance_purchase_window=30
    )
    assert result["route_code"] == "DEL-BLR"
    assert result["advance_purchase_window"] == 30
    assert result["records_retrieved"] >= 10
    assert result["records_validated"] >= 8
    assert result["duplicates_detected"] >= 1
    assert result["records_accepted"] >= 8
    assert result["records_retrieved"] == result["records_accepted"] + result["records_rejected"]
    assert result["validation_status"] == "PASSED"
    assert len(result["provenance_hash"]) == 64
    assert len(result["stages"]) == 9
    assert len(result["accepted_observations"]) == result["records_accepted"]
    assert len(result["rejected_observations"]) == result["records_rejected"]


def test_scenario_rotation_and_deterministic_variation():
    """Verify that multiple runs cycle through scenarios with varying counts and multipliers."""
    runs = []
    for _ in range(5):
        res = run_airfare_pipeline(
            source_id="demo_airfare_connector",
            route_code="DEL-BOM",
            advance_purchase_window=15
        )
        runs.append(res)

    retrieved_counts = [r["records_retrieved"] for r in runs]
    accepted_counts = [r["records_accepted"] for r in runs]

    # Verify there are at least 2 distinct retrieved counts and accepted counts across 5 runs
    assert len(set(retrieved_counts)) >= 2
    assert len(set(accepted_counts)) >= 2


def test_previous_vs_current_audit_calculation():
    """Verify previous vs current audit returns valid comparison metrics."""
    from backend.ingestion.airfare_connector import get_previous_vs_current_audit

    r1 = run_airfare_pipeline(source_id="demo_airfare_connector", route_code="DEL-BOM", advance_purchase_window=15)
    r2 = run_airfare_pipeline(source_id="demo_airfare_connector", route_code="DEL-BOM", advance_purchase_window=15)

    audit = get_previous_vs_current_audit(r2["run_id"])
    assert audit["current_run_id"] == r2["run_id"]
    assert audit["has_previous"] is True
    assert "delta_records_retrieved" in audit
    assert "delta_records_accepted" in audit
    assert "pct_mean_fare_movement" in audit
    assert "status_label" in audit
