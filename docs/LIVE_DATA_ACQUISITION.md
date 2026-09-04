# PUSHPAK Live Data Acquisition Architecture & Pipeline

## 1. Executive Summary

Project **PUSHPAK** (*"Development of a Real-time Airfare Price Index for India for CPI augmentation"*) requires verifiable, transparent, and reproducible data ingestion. This document details the **Live Data Acquisition Architecture**, its **7-stage processing pipeline**, cryptographic provenance guarantees, and ethical acquisition boundaries.

---

## 2. Ethical Data Acquisition Boundaries & Compliance

In accordance with strict regulatory and engineering integrity principles:
1. **No Scraping Violations:** PUSHPAK does not bypass CAPTCHAs, violate commercial airline terms of service, circumvent session tokens, or simulate deceptive user-agents.
2. **Open Aviation Telemetry:** Live acquisitions query public, unauthenticated civil aviation APIs:
   - **OpenSky Network:** Live ADS-B airspace telemetry over Indian FIRs (`opensky-network.org`).
   - **AviationWeather.gov (NOAA):** Real-time METAR aerodrome observations for major Indian hub airports (VIDP/DEL, VABB/BOM, VOBL/BLR).
3. **Transparent Status Reporting:** When external public APIs experience network latency or rate-limiting, PUSHPAK reports failures transparently rather than fabricating artificial numbers.
4. **Clean Boundary Labels:**
   - 🟢 **LIVE FETCHED DATA:** Records genuinely retrieved, validated, cleaned, and signed during an active pipeline run.
   - 🔵 **DEMONSTRATION DATA:** Historical baseline records calibrated from DGCA periodic schedules used for full-year econometric stability.

---

## 3. Connector Architecture

The acquisition engine is implemented in [backend/ingestion/live_connector.py](file:///e:/Pus/backend/ingestion/live_connector.py) and inherits from the abstract `BaseConnector` foundation established in Milestone 0A:

```text
BaseConnector (abstract)
      │
      ├── MockAirfareConnector (deterministic simulation baseline)
      ├── SandboxAirfareConnector (staging connector)
      └── LiveAirfareConnector (OpenSky & AviationWeather open telemetry)
```

### Connector Interface Contract
- `connect() -> bool`: Verifies public telemetry service reachability within timeout budgets.
- `extract(route_code, advance_purchase_window) -> List[Dict]`: Retrieves live air corridor telemetry records.
- `validate(records) -> Tuple[List[Dict], int]`: Enforces strict schema and value constraints.
- `clean(records) -> List[Dict]`: Normalizes airport codes, timestamps, and fare fields.
- `deduplicate(records) -> Tuple[List[Dict], int]`: Removes duplicate observations via deterministic composite key.
- `run_pipeline(route_code, advance_purchase_window) -> Dict`: Coordinates the complete 7-stage ingestion run and computes SHA-256 provenance.

---

## 4. The 7-Stage Acquisition & Ingestion Pipeline

```text
① Source Connection
        ↓
② Data Extraction
        ↓
③ Record Validation
        ↓
④ Data Cleaning & Normalization
        ↓
⑤ Deterministic Deduplication
        ↓
⑥ Database Storage (SQLite WAL)
        ↓
⑦ SHA-256 Cryptographic Provenance Generation
```

### Stage 1 — Source Connection
Establishes a rate-limited HTTP session to approved open aviation endpoints with exponential backoff and connection timeouts (5.0s max).

### Stage 2 — Data Extraction
Queries telemetry feeds for active flights operating between the requested route city-pair (e.g. DEL-BOM). Retrieves flight callsign, transponder ICAO24 address, altitude, groundspeed, and terminal aerodrome conditions.

### Stage 3 — Validation
Applies deterministic validation rules:
- `route_code`: Must match standard format `[A-Z]{3}-[A-Z]{3}`.
- `origin != destination`: Rejects loops.
- `total_fare`: Must be strictly positive numeric value (`total_fare > 0`).
- `advance_purchase_window`: Must be valid horizon (1, 7, 15, 30, 45).
- `observation_timestamp`: Must parse as valid ISO 8601 UTC timestamp.
Invalid observations increment `records_rejected` and are excluded from analysis.

### Stage 4 — Cleaning & Normalization
- Uppercases IATA/ICAO codes.
- Standardizes carrier prefixes (e.g., `6E` $\to$ IndiGo, `AI` $\to$ Air India, `QP` $\to$ Akasa Air).
- Rounds currency fields to 2 decimal places.

### Stage 5 — Deduplication
Observations are deduplicated using a deterministic composite key:
$$\text{Key} = \text{MD5}(\text{route\_code} + \text{carrier} + \text{window} + \text{date} + \text{class})$$
If an identical observation is encountered in the same acquisition window, it is pruned and increments `duplicates_removed`.

### Stage 6 — Database Storage
Accepted records are committed to SQLite using WAL mode across two tables:
1. `live_acquisition_runs`: Run-level audit record.
2. `live_fare_observations`: Observation-level record referencing `run_id`.

### Stage 7 — SHA-256 Cryptographic Provenance
Generates an irreversible, deterministic 256-bit hash of the entire run:
$$\text{Hash} = \text{SHA-256}(\text{run\_id} \mathbin{\Vert} \text{source} \mathbin{\Vert} \text{timestamp} \mathbin{\Vert} \text{accepted\_count} \mathbin{\Vert} \text{records\_stream})$$
This ensures independent reproducibility and auditability for regulatory oversight.

---

## 5. Live Data API Endpoints (`/api/v1/live`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/live/status` | Current connector reachability, rate limits, and honest status. |
| `POST` | `/api/v1/live/fetch` | Triggers the 7-stage pipeline for a given route and window. |
| `GET` | `/api/v1/live/history` | Returns recent acquisition runs and cryptographic hashes. |
| `GET` | `/api/v1/live/sources` | Explains implemented sources vs future extension architecture. |

---

## 6. Verification and Testing

Automated pytest tests in [backend/tests/test_live_acquisition.py](file:///e:/Pus/backend/tests/test_live_acquisition.py) verify:
- Complete mock-isolated pipeline runs without external network dependencies.
- Rejection of negative fare and inverted route records.
- Deduplication deterministic removal.
- SHA-256 hash reproducibility.
- Zero mock failures during network downtime.
