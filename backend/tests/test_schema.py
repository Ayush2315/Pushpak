import pytest
from datetime import datetime, timezone
from pydantic import ValidationError
from backend.models.observation import (
    FareObservation,
    DataMode,
    Environment,
    CabinClass,
)

def test_valid_fare_observation():
    """Confirms valid airfare dictionary instantiates FareObservation correctly."""
    valid_data = {
        "observation_id": "OBS-TEST123456",
        "source_connector": "mock_demo_engine",
        "data_mode": DataMode.DEMO_SIMULATION.value,
        "environment": Environment.OFFLINE.value,
        "origin": "DEL",
        "destination": "BOM",
        "route_code": "DEL-BOM",
        "airline_code": "6E",
        "airline_name": "IndiGo",
        "flight_number": "6E-2041",
        "departure_date": "2026-09-11",
        "lead_time_days": 7,
        "lead_time_bucket": "T+7",
        "cabin_class": CabinClass.ECONOMY.value,
        "base_fare": 4500.0,
        "taxes_fees": 950.0,
        "total_fare": 5450.0,
        "source_hash": "a1b2c3d4e5f67890",
        "confidence_score": 0.85,
    }
    obs = FareObservation.model_validate(valid_data)
    assert obs.route_code == "DEL-BOM"
    assert obs.total_fare == 5450.0
    assert obs.data_mode == DataMode.DEMO_SIMULATION
    assert obs.environment == Environment.OFFLINE

    sqlite_dict = obs.to_sqlite_dict()
    assert sqlite_dict["origin"] == "DEL"
    assert sqlite_dict["destination"] == "BOM"
    assert sqlite_dict["base_fare"] == 4500.0

def test_invalid_data_mode_rejected():
    """Confirms invalid data_mode string raises ValidationError."""
    invalid_data = {
        "observation_id": "OBS-INVALID",
        "source_connector": "test",
        "data_mode": "unverified_live_stream",  # Invalid mode
        "environment": Environment.OFFLINE.value,
        "origin": "DEL",
        "destination": "BOM",
        "route_code": "DEL-BOM",
        "airline_code": "6E",
        "airline_name": "IndiGo",
        "departure_date": "2026-09-11",
        "lead_time_days": 7,
        "lead_time_bucket": "T+7",
        "base_fare": 5000.0,
        "taxes_fees": 1000.0,
        "total_fare": 6000.0,
        "source_hash": "abcdef1234567890",
    }
    with pytest.raises(ValidationError):
        FareObservation.model_validate(invalid_data)

def test_negative_base_fare_rejected():
    """Confirms negative fare values are rejected."""
    bad_fare_data = {
        "observation_id": "OBS-NEG",
        "source_connector": "test",
        "data_mode": DataMode.DEMO_SIMULATION.value,
        "environment": Environment.OFFLINE.value,
        "origin": "DEL",
        "destination": "BOM",
        "route_code": "DEL-BOM",
        "airline_code": "6E",
        "airline_name": "IndiGo",
        "departure_date": "2026-09-11",
        "lead_time_days": 7,
        "lead_time_bucket": "T+7",
        "base_fare": -100.0,  # Negative fare
        "taxes_fees": 500.0,
        "total_fare": 400.0,
        "source_hash": "abcdef1234567890",
    }
    with pytest.raises(ValidationError):
        FareObservation.model_validate(bad_fare_data)

def test_invalid_route_code_format_rejected():
    """Confirms malformed route codes raise validation errors."""
    bad_route_data = {
        "observation_id": "OBS-ROUTE",
        "source_connector": "test",
        "data_mode": DataMode.DEMO_SIMULATION.value,
        "environment": Environment.OFFLINE.value,
        "origin": "DEL",
        "destination": "BOM",
        "route_code": "DELHI-MUMBAI",  # Malformed route
        "airline_code": "6E",
        "airline_name": "IndiGo",
        "departure_date": "2026-09-11",
        "lead_time_days": 7,
        "lead_time_bucket": "T+7",
        "base_fare": 4000.0,
        "taxes_fees": 800.0,
        "total_fare": 4800.0,
        "source_hash": "abcdef1234567890",
    }
    with pytest.raises(ValidationError):
        FareObservation.model_validate(bad_route_data)
