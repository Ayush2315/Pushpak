from datetime import datetime, timezone
from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator

class DataMode(str, Enum):
    OFFICIAL = "official"
    HISTORICAL = "historical"
    EXTERNAL_CONNECTOR = "external_connector"
    DEMO_SIMULATION = "demo_simulation"

class Environment(str, Enum):
    PRODUCTION = "production"
    SANDBOX = "sandbox"
    OFFLINE = "offline"

class CabinClass(str, Enum):
    ECONOMY = "economy"
    PREMIUM_ECONOMY = "premium_economy"
    BUSINESS = "business"

class FareObservation(BaseModel):
    observation_id: str = Field(..., description="Unique UUID/Hash of observation")
    source_connector: str = Field(..., description="Name of connector that generated the observation")
    data_mode: DataMode = Field(..., description="Strict data mode taxonomy")
    environment: Environment = Field(..., description="Operational environment")
    
    # Route details
    origin: str = Field(..., min_length=3, max_length=3, description="IATA 3-letter origin code (e.g., DEL)")
    destination: str = Field(..., min_length=3, max_length=3, description="IATA 3-letter destination code (e.g., BOM)")
    route_code: str = Field(..., description="e.g. DEL-BOM")
    airline_code: str = Field(..., description="IATA airline code (e.g. 6E, AI, SG)")
    airline_name: str = Field(..., description="Airline display name (e.g. IndiGo, Air India)")
    flight_number: Optional[str] = Field(None, description="e.g. 6E-204")
    
    # Temporal details & Lead-time window
    query_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC capture time")
    departure_date: str = Field(..., description="Departure date (YYYY-MM-DD)")
    lead_time_days: int = Field(..., ge=0, description="Advance booking days (T+N)")
    lead_time_bucket: str = Field(..., description="T+1, T+7, T+15, T+30, T+45")
    
    # Pricing Breakdown (in INR)
    cabin_class: CabinClass = Field(default=CabinClass.ECONOMY)
    base_fare: float = Field(..., ge=0.0, description="Base ticket price in INR")
    taxes_fees: float = Field(default=0.0, ge=0.0, description="Taxes and airport charges in INR")
    total_fare: float = Field(..., ge=0.0, description="Total fare payable in INR")
    
    # Audit & Provenance
    source_hash: str = Field(..., description="SHA-256 hash of raw source record")
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Reliability score")

    @field_validator("route_code")
    @classmethod
    def validate_route_code(cls, v: str, info) -> str:
        parts = v.split("-")
        if len(parts) != 2 or len(parts[0]) != 3 or len(parts[1]) != 3:
            raise ValueError(f"route_code must follow 'ORIGIN-DEST' format, got '{v}'")
        return v.upper()

    @field_validator("total_fare")
    @classmethod
    def validate_total_fare(cls, v: float, info) -> float:
        base = info.data.get("base_fare", 0.0)
        taxes = info.data.get("taxes_fees", 0.0)
        # Small floating point tolerance check
        if v < (base + taxes) - 0.5:
            raise ValueError(f"total_fare ({v}) cannot be less than base_fare ({base}) + taxes_fees ({taxes})")
        return v

    def to_sqlite_dict(self) -> Dict[str, Any]:
        """Converts model into dictionary ready for SQLite parameterized insertion."""
        return {
            "observation_id": self.observation_id,
            "source_connector": self.source_connector,
            "data_mode": self.data_mode.value,
            "environment": self.environment.value,
            "origin": self.origin.upper(),
            "destination": self.destination.upper(),
            "route_code": self.route_code.upper(),
            "airline_code": self.airline_code.upper(),
            "airline_name": self.airline_name,
            "flight_number": self.flight_number,
            "query_timestamp": self.query_timestamp.isoformat(),
            "departure_date": self.departure_date,
            "lead_time_days": self.lead_time_days,
            "lead_time_bucket": self.lead_time_bucket,
            "cabin_class": self.cabin_class.value,
            "base_fare": round(self.base_fare, 2),
            "taxes_fees": round(self.taxes_fees, 2),
            "total_fare": round(self.total_fare, 2),
            "source_hash": self.source_hash,
            "confidence_score": round(self.confidence_score, 2),
        }
