import hashlib
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from backend.models.observation import DataMode, Environment

# Standard IATA mapping for Indian domestic airports
CITY_TO_IATA = {
    "DELHI": "DEL",
    "NEW DELHI": "DEL",
    "MUMBAI": "BOM",
    "BOMBAY": "BOM",
    "BANGALORE": "BLR",
    "BENGALURU": "BLR",
    "KOLKATA": "CCU",
    "CALCUTTA": "CCU",
    "HYDERABAD": "HYD",
    "CHENNAI": "MAA",
    "MADRAS": "MAA",
    "AHMEDABAD": "AMD",
    "GOA": "GOI",
    "PUNE": "PNQ",
    "JAIPUR": "JAI",
    "LUCKNOW": "LKO",
    "GUWAHATI": "GAU",
    "PATNA": "PAT",
    "COCHIN": "COK",
    "KOCHI": "COK",
}

def resolve_iata(city_name: str) -> str:
    """Normalizes city name to 3-letter IATA airport code."""
    cleaned = city_name.strip().upper().replace("_", " ")
    if cleaned in CITY_TO_IATA:
        return CITY_TO_IATA[cleaned]
    # Fallback to uppercase 3-letter prefix if unknown
    return cleaned[:3]

class FlightRecord(BaseModel):
    """
    Pydantic schema representing an individual domestic flight record.
    Faithfully preserves original categorical departure/arrival slots without fabricating timestamps.
    """
    flight_id: str = Field(..., description="Deterministic record identifier (hash of row contents + index)")
    row_index: Optional[int] = Field(None, description="Original dataset row index")
    airline: str = Field(..., description="Airline name (e.g. Indigo, Air_India, Vistara, SpiceJet)")
    flight_number: str = Field(..., description="Flight designation (e.g. SG-8709, 6E-204)")
    source_city: str = Field(..., description="Origin city name as recorded in dataset")
    origin_code: str = Field(..., min_length=3, max_length=3, description="Normalized IATA origin code")
    destination_city: str = Field(..., description="Destination city name as recorded in dataset")
    destination_code: str = Field(..., min_length=3, max_length=3, description="Normalized IATA destination code")
    route_code: str = Field(..., description="e.g. DEL-BOM")
    departure_time: str = Field(..., description="Categorical departure slot (e.g. Early_Morning, Morning, Afternoon, Evening, Night)")
    stops: str = Field(..., description="Categorical stop indicator (e.g. zero, one, two_or_more)")
    arrival_time: str = Field(..., description="Categorical arrival slot (e.g. Morning, Afternoon, Evening, Night)")
    class_type: str = Field(..., description="Cabin class (Economy, Business)")
    duration_hours: float = Field(..., ge=0.0, description="Flight duration in decimal hours")
    data_mode: DataMode = Field(..., description="historical or demo_simulation")
    environment: Environment = Field(default=Environment.OFFLINE)
    source_type: str = Field(..., description="pdf_dataset or seed_fallback")

    @classmethod
    def create_from_raw(
        cls,
        airline: str,
        flight: str,
        source_city: str,
        departure_time: str,
        stops: str,
        arrival_time: str,
        destination_city: str,
        class_name: str,
        duration: float,
        row_index: Optional[int] = None,
        is_real_pdf: bool = True
    ) -> "FlightRecord":
        """Factory method to construct a validated FlightRecord with deterministic ID."""
        orig_code = resolve_iata(source_city)
        dest_code = resolve_iata(destination_city)
        route = f"{orig_code}-{dest_code}"

        # Deterministic unique ID computed from row index and normalized record
        id_seed = f"{row_index}_{airline.strip()}_{flight.strip()}_{source_city.strip()}_{departure_time.strip()}_{stops.strip()}_{arrival_time.strip()}_{destination_city.strip()}_{class_name.strip()}_{duration:.2f}"
        deterministic_hash = hashlib.sha256(id_seed.encode("utf-8")).hexdigest()[:10].upper()
        row_tag = f"{row_index:06d}-" if row_index is not None else ""
        flight_id = f"REC-{row_tag}{deterministic_hash}"

        data_mode = DataMode.HISTORICAL if is_real_pdf else DataMode.DEMO_SIMULATION
        source_type = "pdf_dataset" if is_real_pdf else "seed_fallback"

        return cls(
            flight_id=flight_id,
            row_index=row_index,
            airline=airline.strip(),
            flight_number=flight.strip(),
            source_city=source_city.strip(),
            origin_code=orig_code,
            destination_city=destination_city.strip(),
            destination_code=dest_code,
            route_code=route,
            departure_time=departure_time.strip(),
            stops=stops.strip(),
            arrival_time=arrival_time.strip(),
            class_type=class_name.strip(),
            duration_hours=round(float(duration), 2),
            data_mode=data_mode,
            environment=Environment.OFFLINE,
            source_type=source_type,
        )

    def to_sqlite_dict(self) -> Dict[str, Any]:
        return {
            "flight_id": self.flight_id,
            "row_index": self.row_index,
            "airline": self.airline,
            "flight_number": self.flight_number,
            "source_city": self.source_city,
            "origin_code": self.origin_code,
            "destination_city": self.destination_city,
            "destination_code": self.destination_code,
            "route_code": self.route_code,
            "departure_time": self.departure_time,
            "stops": self.stops,
            "arrival_time": self.arrival_time,
            "class_type": self.class_type,
            "duration_hours": self.duration_hours,
            "data_mode": self.data_mode.value,
            "environment": self.environment.value,
            "source_type": self.source_type,
        }
