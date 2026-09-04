# PUSHPAK Airfare Acquisition Architecture

## Overview

PUSHPAK implements a transparent, ethical, and extensible airfare data acquisition pipeline designed to demonstrate how domestic airline fare observations are collected, validated, cleaned, and prepared for Consumer Price Index (CPI) augmentation.

## Strict Data Honesty Policy

- **🟢 LIVE OPERATIONAL DATA**: Real-time aviation telemetry (e.g., OpenSky ADS-B, METAR weather) fetched over network.
- **🟠 AIRFARE ACQUISITION DEMONSTRATION**: Structured demonstration of the complete acquisition pipeline architecture using demonstration connectors. Never presented as fabricated live market prices.
- **🔵 HISTORICAL/SIMULATION DATA**: Audited 50,000-record domestic flight registry baseline for deterministic index verification.

## 9-Stage Acquisition Pipeline

```
Stage 1: Initialize Source Connector
       ↓ (ethical policies, rate limits, robots.txt compliance)
Stage 2: Retrieve Fare Observations
       ↓ (raw flight fare quote payloads from source)
Stage 3: Parse Records
       ↓ (structured intermediate observation schema)
Stage 4: Validate Required Fields
       ↓ (IATA codes, financial non-negativity, arithmetic audit)
Stage 5: Normalize Currency & Metadata
       ↓ (INR standardization, canonical cabin classes)
Stage 6: Detect Duplicate Observations
       ↓ (deterministic composite signature key)
Stage 7: Record Clean Observations
       ↓ (accepted records stored; rejects isolated with audit reason)
Stage 8: Generate Provenance Hash
       ↓ (SHA-256 cryptographic digest for institutional auditability)
Stage 9: Ready for Index Processing
       ↓ (clean database → Price Relatives Rᵢ → Basket Weights wᵢ → Index Iₜ)
```

## Connector Architecture

### BaseAirfareConnector (Abstract Base Class)

All connectors inherit from `BaseAirfareConnector`, which provides:

- `retrieve_raw_records()` — Abstract method; implemented per source
- `parse_record()` — Converts raw vendor payload into structured schema
- `validate_record()` — Enforces IATA codes, positive fares, arithmetic consistency
- `normalize_record()` — Standardizes currency to INR, canonical cabin classes
- `compute_deduplication_key()` — Deterministic composite key:
  `carrier | origin | destination | departure_date | advance_purchase_window | fare_class | total_fare`
- `generate_provenance_hash()` — SHA-256 over sorted canonical payload
- `execute_pipeline()` — Orchestrates all 9 stages with full audit logging

### Registered Connectors

| Source ID | Name | Type | Status |
|-----------|------|------|--------|
| `demo_airfare_connector` | Domestic Multi-Carrier Demo Engine | demonstration_connector | **Active** |
| `indigo_direct_api` | IndiGo Direct NDC API Feed | airline_direct_api | Architecture Ready |
| `airindia_amadeus_ndc` | Air India Amadeus GDS Bridge | gds_ndc_bridge | Planned |

## Deduplication Mechanism

### Deterministic Composite Key

```
carrier | origin | destination | departure_date | advance_purchase_window | fare_class | total_fare
```

Example: `INDIGO|DEL|BOM|2026-10-15|15|ECONOMY|5205.00`

### Why Duplicates Distort Price Indices

If identical fare quotes are counted multiple times, the route-level geometric mean shifts artificially, biasing price relatives (Rᵢ) and contaminating the aggregate national index.

## Database Schema

### `airfare_acquisition_runs`

Stores immutable metadata for each pipeline execution run:

| Column | Type | Description |
|--------|------|-------------|
| `run_id` | TEXT PK | Unique run identifier (e.g., `RUN-20260905143000-a1b2c3`) |
| `source_id` | TEXT | Connector identifier |
| `records_retrieved` | INTEGER | Total raw records fetched |
| `records_validated` | INTEGER | Records passing schema validation |
| `duplicates_detected` | INTEGER | Duplicate observations removed |
| `records_accepted` | INTEGER | Clean records stored |
| `records_rejected` | INTEGER | Invalid + duplicate records discarded |
| `provenance_hash` | TEXT | SHA-256 cryptographic audit hash |

### `airfare_observations`

Stores clean, validated, deduplicated fare observations:

| Column | Type | Description |
|--------|------|-------------|
| `observation_id` | TEXT PK | Unique observation identifier |
| `run_id` | TEXT FK | Reference to acquisition run |
| `route_code` | TEXT | Domestic corridor (e.g., `DEL-BOM`) |
| `carrier` | TEXT | Operating airline |
| `total_fare` | REAL | Total inclusive fare in INR |
| `provenance_hash` | TEXT | SHA-256 hash linking to run audit |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/acquisition/sources` | Registered connectors |
| `POST` | `/api/v1/acquisition/run` | Execute 9-stage pipeline |
| `GET` | `/api/v1/acquisition/history` | Immutable run audit log |
| `GET` | `/api/v1/acquisition/observations` | Clean fare observation repository |

## Mathematical Connection to Price Index

```
Clean Fare DB → Route Aggregation → Price Relatives (Rᵢ = Pᵢ,ₜ / Pᵢ,₀)
    → Basket Weights (wᵢ = Vᵢ / Σ Vⱼ)
    → PUSHPAK Index (Iₜ = Σ(wᵢ × Rᵢ) × 100)
```

## Testing

```bash
# Unit tests for connector, validation, deduplication, provenance
python -m pytest backend/tests/test_airfare_acquisition.py -v

# Integration tests for FastAPI endpoints
python -m pytest backend/tests/test_acquisition_api.py -v
```
