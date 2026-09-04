from datetime import datetime, timezone
from typing import List, Optional, Generic, TypeVar, Dict, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="Current service health status")
    service: str = Field(default="PUSHPAK Civil Aviation Intelligence Platform", description="Application service name")
    database: str = Field(default="connected", description="Database connectivity status")
    database_mode: str = Field(default="WAL (Write-Ahead Logging)", description="Active SQLite journal mode")
    environment: str = Field(default="development", description="Runtime environment")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Current UTC timestamp")

class PaginatedResponse(BaseModel, Generic[T]):
    total: int = Field(..., description="Total matching items available")
    limit: int = Field(..., description="Maximum items requested")
    offset: int = Field(..., description="Pagination offset index")
    items: List[T] = Field(..., description="List of items for current page")

class FlightRecordResponse(BaseModel):
    flight_id: str
    row_index: Optional[int] = None
    airline: str
    flight_number: str
    source_city: str
    origin_code: str
    destination_city: str
    destination_code: str
    route_code: str
    departure_time: str = Field(..., description="Categorical departure slot (e.g. Morning, Evening)")
    stops: str
    arrival_time: str = Field(..., description="Categorical arrival slot (e.g. Afternoon, Night)")
    class_type: str
    duration_hours: float
    data_mode: str = Field(..., description="Provenance mode (historical)")
    environment: str = Field(default="offline")
    source_type: str = Field(..., description="pdf_dataset or seed_fallback")

class RouteNetworkSummary(BaseModel):
    route_code: str
    origin_code: str
    destination_code: str
    source_city: str
    destination_city: str
    observed_flight_records: int = Field(..., description="Total observed records in dataset (not daily flight frequency)")
    active_airlines_count: int
    avg_duration_hours: float
    min_duration_hours: float
    non_stop_records: int

class RouteDetailResponse(BaseModel):
    route_summary: RouteNetworkSummary
    operating_airlines: List[Dict[str, Any]]
    departure_slots: List[Dict[str, Any]]
    stops_breakdown: List[Dict[str, Any]]
    data_clarification: str = Field(
        default="Observed counts represent cumulative dataset entries across time, not confirmed daily flight frequencies.",
        description="Official transparency notice"
    )

class AirlineAnalyticsResponse(BaseModel):
    total_operating_airlines: int
    carriers: List[Dict[str, Any]]
    data_clarification: str = Field(
        default="Carrier presence is calculated from historical flight records and represents dataset presence, not live official market share.",
        description="Official transparency notice"
    )

class NetworkAnalyticsResponse(BaseModel):
    total_routes_indexed: int
    total_observed_flight_records: int
    total_operating_airlines: int
    top_routes_by_records: List[Dict[str, Any]]
    data_clarification: str = Field(
        default="Network metrics reflect indexed historical dataset observations, not active daily air traffic control schedules.",
        description="Official transparency notice"
    )

class FareObservationResponse(BaseModel):
    observation_id: str
    source_connector: str
    data_mode: str = Field(..., description="Strict mode: demo_simulation, external_connector, official, or historical")
    environment: str = Field(..., description="Operational environment: production, sandbox, or offline")
    origin: str
    destination: str
    route_code: str
    airline_code: str
    airline_name: str
    flight_number: Optional[str] = None
    query_timestamp: str
    departure_date: str
    lead_time_days: int
    lead_time_bucket: str = Field(..., description="T+1, T+7, T+15, T+30, T+45")
    cabin_class: str
    base_fare: float
    taxes_fees: float
    total_fare: float
    source_hash: str
    confidence_score: float

class ProvenanceSummaryResponse(BaseModel):
    total_observations_across_system: int
    provenance_breakdown: List[Dict[str, Any]]
    data_honesty_statement: str = Field(
        default="PUSHPAK enforces absolute technical honesty: simulated data is never mislabeled as live data, and historical schedule records are never claimed to be real-time schedules.",
        description="National data governance statement"
    )

class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ====================================================================
# MILESTONE 2: INTELLIGENCE & FARE ANALYTICS SCHEMAS
# ====================================================================

class RouteFareStats(BaseModel):
    route_code: str
    observation_count: int
    mean_fare: float
    median_fare: float
    min_fare: float
    max_fare: float
    fare_range: float
    std_dev: float
    coefficient_of_variation: float = Field(..., description="CV (%) = (std_dev / mean_fare) * 100")
    currency: str = "INR"
    data_mode: str
    environment: str
    provenance_note: str

class BookingWindowAnalysisItem(BaseModel):
    lead_time_bucket: str = Field(..., description="T+1, T+7, T+15, T+30, T+45")
    lead_time_days: int
    observation_count: int
    avg_fare: float
    min_fare: float
    max_fare: float
    std_dev: float
    delta_from_previous: Optional[float] = None
    pct_change_from_previous: Optional[float] = None

class AirlineFareComparisonItem(BaseModel):
    airline_code: str
    airline_name: str
    observation_count: int
    avg_fare: float
    min_fare: float
    max_fare: float
    std_dev: float
    booking_windows_covered: int
    diff_from_market_avg: float
    pct_diff_from_market_avg: float

class RouteVolatilityClassification(BaseModel):
    band: str = Field(..., description="Stable, Moderate Variation, or High Variation")
    cv_percent: float
    description: str
    policy_risk: str
    classification_note: str

class RouteIntelligenceResponse(BaseModel):
    route_code: str
    origin: str
    destination: str
    fare_summary: RouteFareStats
    booking_windows: List[BookingWindowAnalysisItem]
    airline_comparison: List[AirlineFareComparisonItem]
    classification: RouteVolatilityClassification
    insights: List[str]
    provenance: Dict[str, Any]

class BookingWindowsResponse(BaseModel):
    route_code: Optional[str] = None
    booking_windows: List[BookingWindowAnalysisItem]
    data_clarification: str = Field(
        default="Analysis reflects advance lead times from recorded airfare observations. Simulated data is labeled demo_simulation.",
        description="Official transparency notice"
    )

class AirlinesComparisonResponse(BaseModel):
    route_code: Optional[str] = None
    airline_comparison: List[AirlineFareComparisonItem]
    data_clarification: str = Field(
        default="Inter-carrier comparison reflects recorded fare observations on the specified corridor.",
        description="Official transparency notice"
    )

class NetworkFareSummaryResponse(BaseModel):
    total_routes_with_fare_observations: int
    routes: List[RouteFareStats]
    data_clarification: str = Field(
        default="Network fare statistics calculated across all routes currently possessing recorded fare observations.",
        description="Official transparency notice"
    )

