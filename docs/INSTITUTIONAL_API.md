# PUSHPAK Institutional API Layer

## Overview

The PUSHPAK Institutional API Layer provides standardized, programmatic JSON REST endpoints designed for consumption by government statistical agencies, central banks, and aviation regulators:

- **Ministry of Statistics and Programme Implementation (MoSPI)** — CPI Augmentation Research
- **Reserve Bank of India (RBI)** — High-Frequency Inflation Monitoring
- **Directorate General of Civil Aviation (DGCA)** — Tariff & Supervisory Surveillance

## Architecture

```
┌─────────────────────────────┐
│   AIRLINE / DATA SOURCES    │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│  PYTHON ACQUISITION ENGINE  │
│  (Validation, Dedup, Hash)  │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│  CLEAN AIRFARE DATABASE     │
│  (SQLite WAL)               │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│  PRICE INDEX ENGINE         │
│  (Laspeyres Aggregation)    │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│  FASTAPI REST LAYER         │
│  /api/v1/*                  │
└──────┬──────┬──────┬────────┘
       ▼      ▼      ▼
   Dashboard  API   Institutional
   (React)  Explorer  Consumers
```

## API Domains

### 1. Price Index APIs (`/api/v1/index/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/headline` | GET | PUSHPAK Headline Price Index (all 5 horizons) |
| `/core` | GET | Core Price Index (excluding walk-up T+1/T+7) |
| `/summary` | GET | Side-by-side comparison with Walk-Up Surge Spread |
| `/methodology` | GET | Mathematical methodology and ILO/IMF alignment |

### 2. Airfare Acquisition APIs (`/api/v1/acquisition/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sources` | GET | Registered and planned acquisition connectors |
| `/run` | POST | Execute 9-stage acquisition pipeline |
| `/history` | GET | Immutable run audit log with SHA-256 hashes |
| `/observations` | GET | Clean, deduplicated fare observation database |

### 3. National Corridor APIs (`/api/v1/corridors/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/top10` | GET | Top 10 ranked domestic corridors |
| `/{route_code}` | GET | Corridor-level fare analytics and carrier shares |

### 4. Government & Governance APIs (`/api/v1/government/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/index/latest` | GET | Institutional index payload (MoSPI/RBI format) |
| `/index/summary` | GET | Structured mathematical summary |
| `/routes` | GET | Representative basket route definitions |
| `/provenance` | GET | Cryptographic provenance census and audit trail |
| `/data-status` | GET | Transparent dataset operational status |

## Integration Standards

- **Format**: JSON (application/json)
- **Authentication**: None required for prototype
- **Rate Limiting**: No enforced limits during prototype evaluation
- **CORS**: Enabled for localhost development origins
- **Error Handling**: Standardized `ErrorResponse` schema with HTTP status codes

## Interactive API Explorer

The PUSHPAK frontend includes an **Interactive API Explorer** page (`/institutional-api`) that allows evaluators to:

1. Browse all available API domains and endpoints
2. View sample cURL commands
3. Execute real requests against the running local FastAPI server
4. Inspect actual JSON response payloads with latency metrics

## Running the API Server

```bash
cd e:\Pus
uvicorn backend.main:app --reload
# API docs available at http://localhost:8000/docs
# ReDoc available at http://localhost:8000/redoc
```

## Disclaimer

This is a prototype analytical research platform. The API interface demonstrates institutional-grade programmatic interoperability. It does not represent an official Government of India gazetted CPI series.
