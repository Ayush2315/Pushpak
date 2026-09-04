# PUSHPAK API Reference & Developer Guide

- **Base URL**: `http://localhost:8000`
- **Version**: `v1` (`/api/v1`)
- **Interactive Documentation**:
  - Swagger UI: `http://localhost:8000/docs`
  - ReDoc: `http://localhost:8000/redoc`
  - OpenAPI JSON Specification: `http://localhost:8000/openapi.json`

---

## 1. Architectural Overview

The PUSHPAK API is built on **FastAPI** with **Pydantic v2** validation and serialization. It exposes civil aviation intelligence, flight registry records, route network analytics, airfare observations, and transparent data provenance.

```
Client (React Frontend / Government Portal / Analysts)
                         │
                         ▼
        FastAPI App Layer (CORS Enabled)
                         │
      ┌──────────────────┴──────────────────┐
      ▼                                     ▼
 /health & Docs                      /api/v1 Router
                                            │
   ┌───────────────┬────────────────────────┼────────────────┬───────────────┐
   ▼               ▼                        ▼                ▼               ▼
/flights        /routes                 /analytics        /fares       /provenance
(Registry)      (Network Topology)      (Market Share)    (Observations)(Data Audit)
   └───────────────┴────────────────────────┼────────────────┴───────────────┘
                                            │
                                            ▼
                           SQLite Database (WAL Journal Mode)
```

### Key Principles
1. **Zero Data Falsification**: Historical registry counts are clearly tagged as `observed_flight_records`, never daily flight frequencies. Categorical time slots (`Early_Morning`, `Morning`, etc.) are preserved without fabricating minute-level timestamps.
2. **Mandatory Provenance**: Every observation and data stream includes `data_mode` (`demo_simulation`, `historical`, `external_connector`, `official`) and `environment` (`production`, `sandbox`, `offline`).
3. **Structured Errors**: Standard HTTP error payloads with informative messages and consistent structure.

---

## 2. Endpoints Reference

### 2.1 System Health

#### `GET /health` or `GET /api/v1/health`
Performs an active database connection check and returns system operational status.

- **Response Status**: `200 OK`
- **Sample Response**:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "database": "connected",
  "data_mode": "prototype",
  "environment": "offline",
  "timestamp": "2026-09-04T19:45:00.000000Z"
}
```

---

### 2.2 Flight Registry

#### `GET /api/v1/flights`
Returns paginated domestic flight records from the verified flight registry.

- **Query Parameters**:
  - `route_code` (*optional*, string): e.g. `DEL-BOM`
  - `airline` (*optional*, string): e.g. `Vistara`, `Air India`
  - `origin_code` (*optional*, string): 3-letter IATA code, e.g. `DEL`
  - `destination_code` (*optional*, string): 3-letter IATA code, e.g. `BOM`
  - `page` (*optional*, int, default: `1`): Page number (1-indexed)
  - `page_size` (*optional*, int, default: `50`, max: `200`): Items per page

- **Response Status**: `200 OK`
- **Sample Response**:
```json
{
  "items": [
    {
      "flight_id": "REC-000000-da765e903f",
      "flight_number": "SG-8709",
      "airline": "SpiceJet",
      "route_code": "DEL-BOM",
      "origin_code": "DEL",
      "origin_city": "Delhi",
      "destination_code": "BOM",
      "destination_city": "Mumbai",
      "departure_time_slot": "Early_Morning",
      "arrival_time_slot": "Morning",
      "stops": "zero",
      "travel_class": "Economy",
      "duration_hours": 2.17,
      "data_mode": "historical",
      "source_type": "pdf_dataset"
    }
  ],
  "total": 50000,
  "page": 1,
  "page_size": 50,
  "total_pages": 1000,
  "metric_note": "Flight counts represent observed dataset records, NOT confirmed daily flight frequencies. Time slots represent categorical schedule bands."
}
```

#### `GET /api/v1/flights/{flight_id}`
Retrieves a specific flight record by its unique deterministic record ID.

- **Path Parameters**:
  - `flight_id` (string): e.g. `REC-000000-da765e903f`
- **Response Status**: `200 OK` (or `404 Not Found` if nonexistent)

---

### 2.3 Route Network

#### `GET /api/v1/routes`
Returns summary metrics for all active domestic routes aggregated from the verified flight registry (`v_route_network`).

- **Response Status**: `200 OK`
- **Sample Response**:
```json
[
  {
    "route_code": "BOM-DEL",
    "origin_code": "BOM",
    "origin_city": "Mumbai",
    "destination_code": "DEL",
    "destination_city": "Delhi",
    "observed_flight_records": 13096,
    "unique_flight_numbers": 46,
    "operating_carriers": 6,
    "avg_duration_hours": 9.48,
    "min_duration_hours": 2.0,
    "max_duration_hours": 29.25,
    "metric_note": "observed_flight_records reflects dataset observation count, NOT daily flight frequency"
  }
]
```

#### `GET /api/v1/routes/{route_code}`
Returns detailed route profile including operating airlines, categorical departure time slot distributions, and stops breakdown.

- **Path Parameters**:
  - `route_code` (string): Standard route code (e.g. `DEL-BOM`)
- **Response Status**: `200 OK` (or `404 Not Found`)
- **Sample Response**:
```json
{
  "route_code": "DEL-BOM",
  "origin_code": "DEL",
  "origin_city": "Delhi",
  "destination_code": "BOM",
  "destination_city": "Mumbai",
  "observed_flight_records": 14893,
  "unique_flight_numbers": 48,
  "operating_carriers": 6,
  "avg_duration_hours": 8.95,
  "min_duration_hours": 2.08,
  "max_duration_hours": 28.58,
  "operating_carrier_list": [
    {"airline": "Vistara", "record_count": 6649, "percentage": 44.64},
    {"airline": "Air India", "record_count": 4277, "percentage": 28.72},
    {"airline": "Indigo", "record_count": 2187, "percentage": 14.68}
  ],
  "departure_time_distribution": {
    "Early_Morning": 3481,
    "Morning": 4768,
    "Afternoon": 2420,
    "Evening": 3315,
    "Night": 909
  },
  "stops_breakdown": {
    "zero": 1785,
    "one": 13008,
    "two_or_more": 100
  },
  "metric_note": "Counts represent historical dataset observations, NOT daily flight frequencies"
}
```

---

### 2.4 Civil Aviation Analytics

#### `GET /api/v1/analytics/airlines`
Returns carrier-level market presence and share across observed domestic operations.

- **Response Status**: `200 OK`
- **Sample Response**:
```json
{
  "total_records_analyzed": 50000,
  "airline_breakdown": [
    {"airline": "Vistara", "observed_records": 21327, "market_share_percent": 42.65, "routes_served": 6},
    {"airline": "Air India", "observed_records": 13589, "market_share_percent": 27.18, "routes_served": 6},
    {"airline": "Indigo", "observed_records": 7183, "market_share_percent": 14.37, "routes_served": 6},
    {"airline": "GO FIRST", "observed_records": 3971, "market_share_percent": 7.94, "routes_served": 6},
    {"airline": "AirAsia", "observed_records": 2750, "market_share_percent": 5.5, "routes_served": 6},
    {"airline": "SpiceJet", "observed_records": 1180, "market_share_percent": 2.36, "routes_served": 6}
  ],
  "metric_note": "Market share calculated from historical flight dataset observations (300k population, 50k active prototype registry)"
}
```

#### `GET /api/v1/analytics/network`
Returns network-wide aggregate metrics for the Indian domestic aviation system.

- **Response Status**: `200 OK`
- **Sample Response**:
```json
{
  "total_observed_records": 50000,
  "distinct_routes_count": 6,
  "operating_airlines_count": 6,
  "avg_system_duration_hours": 11.22,
  "system_stops_breakdown": {
    "zero": 4350,
    "one": 41804,
    "two_or_more": 3846
  },
  "system_departure_slots": {
    "Early_Morning": 6401,
    "Morning": 16670,
    "Afternoon": 7927,
    "Evening": 10986,
    "Night": 8016
  },
  "dataset_metadata": {
    "full_dataset_size": 300153,
    "active_registry_size": 50000,
    "source_file": "backend/data/flightsdata.pdf"
  }
}
```

---

### 2.5 Fare Observations

#### `GET /api/v1/fares`
Returns airfare observations collected by the ingestion pipeline, preserving advance booking lead times (`days_ahead`), fare breakdowns, and audit hashes.

- **Query Parameters**:
  - `route_code` (*optional*, string): Filter by route (e.g. `DEL-BOM`)
  - `airline` (*optional*, string): Filter by airline (e.g. `Air India`)
  - `days_ahead` (*optional*, int): Advance booking window (`1`, `7`, `15`, `30`, `45`)
  - `data_mode` (*optional*, string): `demo_simulation`, `external_connector`, etc.
  - `limit` (*optional*, int, default: `50`, max: `200`): Result count limit

- **Response Status**: `200 OK`
- **Sample Response**:
```json
[
  {
    "observation_id": "OBS-DEL-BOM-AI-20260905-T1-E",
    "flight_number": "AI-805",
    "airline": "Air India",
    "route_code": "DEL-BOM",
    "origin_airport": "DEL",
    "destination_airport": "BOM",
    "departure_date": "2026-09-05",
    "booking_date": "2026-09-04",
    "days_ahead": 1,
    "travel_class": "Economy",
    "base_fare": 8500.0,
    "fuel_surcharge": 400.0,
    "airport_fee": 350.0,
    "user_dev_fee": 150.0,
    "cgst": 235.0,
    "sgst": 235.0,
    "total_fare": 9870.0,
    "currency": "INR",
    "source_type": "mock_demo",
    "data_mode": "demo_simulation",
    "environment": "offline",
    "source_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "recorded_at": "2026-09-04T12:00:00Z"
  }
]
```

---

### 2.6 Data Provenance

#### `GET /api/v1/provenance`
Returns a transparent audit summary of all data sources, modes, and environments across both the airfare observation store and the flight registry.

- **Response Status**: `200 OK`
- **Sample Response**:
```json
{
  "total_records_managed": 50135,
  "fare_observations_breakdown": [
    {
      "source_type": "mock_demo",
      "data_mode": "demo_simulation",
      "environment": "offline",
      "record_count": 135
    }
  ],
  "flight_registry_breakdown": [
    {
      "source_type": "pdf_dataset",
      "data_mode": "historical",
      "record_count": 50000
    }
  ],
  "data_integrity_rules": [
    "demo_simulation records are NEVER represented as live market data",
    "flight_registry counts are historical observations, NOT daily flight frequencies",
    "Time slots are strictly categorical (Early_Morning, etc.) without fabricated timestamps",
    "All fare observations retain SHA-256 cryptographic provenance hashes"
  ]
}
```

---

### 2.7 Intelligence & Fare Analytics (Milestone 2)

#### `GET /api/v1/intelligence/routes/{route_code}`
Returns the complete route intelligence dossier, including statistical distribution metrics (mean, median, range, std dev, $CV$), 5-bucket booking window yield curve ($T+1$ to $T+45$), inter-airline fare comparison, heuristic volatility classification (`Stable`, `Moderate Variation`, `High Variation`), and deterministic rule-based insights.

- **Path Parameters**:
  - `route_code` (string): Corridor identifier (e.g. `DEL-BOM`, `DEL-BLR`, `BOM-BLR`)
- **Response Status**: `200 OK` (or `404 Not Found`)
- **Sample Response**:
```json
{
  "route_code": "DEL-BOM",
  "origin": "DEL",
  "destination": "BOM",
  "fare_summary": {
    "route_code": "DEL-BOM",
    "observation_count": 45,
    "mean_fare": 7332.58,
    "median_fare": 6979.85,
    "min_fare": 5197.97,
    "max_fare": 11220.6,
    "fare_range": 6022.63,
    "std_dev": 1735.93,
    "coefficient_of_variation": 23.67,
    "currency": "INR",
    "data_mode": "demo_simulation",
    "environment": "offline",
    "provenance_note": "Statistics calculated directly from recorded fare observations. Simulated data is labeled demo_simulation."
  },
  "booking_windows": [
    {
      "lead_time_bucket": "T+1",
      "lead_time_days": 1,
      "observation_count": 9,
      "avg_fare": 10271.0,
      "min_fare": 9500.61,
      "max_fare": 11220.6,
      "std_dev": 756.81,
      "delta_from_previous": null,
      "pct_change_from_previous": null
    },
    {
      "lead_time_bucket": "T+7",
      "lead_time_days": 7,
      "observation_count": 9,
      "avg_fare": 7753.32,
      "min_fare": 7608.2,
      "max_fare": 7830.51,
      "std_dev": 108.91,
      "delta_from_previous": -2517.68,
      "pct_change_from_previous": -24.51
    }
  ],
  "airline_comparison": [
    {
      "airline_code": "SG",
      "airline_name": "SpiceJet",
      "observation_count": 15,
      "avg_fare": 7021.89,
      "min_fare": 5197.97,
      "max_fare": 9500.61,
      "std_dev": 1595.62,
      "booking_windows_covered": 5,
      "diff_from_market_avg": -310.69,
      "pct_diff_from_market_avg": -4.24
    }
  ],
  "classification": {
    "band": "Moderate Variation",
    "cv_percent": 23.67,
    "description": "Standard market yield dynamic pricing driven primarily by advance lead times.",
    "policy_risk": "Moderate variation typical of normal airline revenue management.",
    "classification_note": "PUSHPAK Analytical Classification: Volatility Band (Heuristic metric, NOT an official DGCA/MoCA government designation)."
  },
  "insights": [
    "[Simulation-Based Analytical Insight] Metrics derived from deterministic prototype observations. Not live real-time market quotes.",
    "Severe walk-up premium: T+1 bookings command an average +81.0% premium over 45-day advance bookings (₹10,271.00 vs ₹5,675.44).",
    "SpiceJet observed as lowest average fare carrier at ₹7,021.89 (4.2% below route average).",
    "Inter-carrier price spread on this route is ₹787.80 between SpiceJet and Air India.",
    "Moderate dynamic pricing (CV: 23.7%): pricing follows standard airline revenue management yield curves.",
    "Observed fares range from a low of ₹5,197.97 to a peak of ₹11,220.60 (spread: ₹6,022.63)."
  ],
  "provenance": {
    "data_mode": "demo_simulation",
    "environment": "offline",
    "observation_count": 45,
    "integrity_rule": "Simulated data is explicitly tagged; not live real-time quotes."
  }
}
```

#### `GET /api/v1/intelligence/booking-windows`
Returns advance lead-time curves across booking windows ($T+1, T+7, T+15, T+30, T+45$), with window-to-window rupee and percentage deltas.

- **Query Parameters**:
  - `route_code` (*optional*, string): e.g. `DEL-BOM`
- **Response Status**: `200 OK`

#### `GET /api/v1/intelligence/compare-airlines`
Returns carrier pricing differentials, averages, ranges, and market benchmark differentials.

- **Query Parameters**:
  - `route_code` (*optional*, string): e.g. `DEL-BOM`
- **Response Status**: `200 OK`

#### `GET /api/v1/intelligence/fare-index`
Returns network-wide fare summaries across all routes with recorded fare observations.

- **Response Status**: `200 OK`

---

## 3. Standardized Error Handling

All client and server errors return structured JSON conforming to `ErrorResponse`:

```json
{
  "error": "HTTPException",
  "message": "Route 'INVALID-ROUTE' was not found in the domestic route registry.",
  "status_code": 404,
  "timestamp": "2026-09-04T19:45:00.000000Z"
}
```

Common HTTP status codes used:
- `200 OK`: Successful retrieval.
- `400 Bad Request`: Invalid query parameters or route syntax.
- `404 Not Found`: Route, flight ID, or intelligence dossier not found.
- `422 Unprocessable Entity`: Schema validation failure.
- `500 Internal Server Error`: Unexpected server or database exception.


---

## 4. Running the API Server

Start the API server locally:
```bash
uvicorn backend.main:app --reload --port 8000
```

Verify in your browser:
- API Root: `http://localhost:8000/health`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- ReDoc Docs: `http://localhost:8000/redoc`
