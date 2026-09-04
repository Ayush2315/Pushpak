# PUSHPAK Government & Institutional API Specification

## 1. Overview & Purpose

> **Notice:** *Prototype integration interface for programmatic analytical consumption. Does not claim official Government of India status.*

The **PUSHPAK Government API** (`/api/v1/government`) provides high-frequency, machine-readable analytical feeds designed for institutional economists, monetary policy researchers (Reserve Bank of India), statistical agencies (Ministry of Statistics and Programme Implementation - MoSPI), and civil aviation regulators (DGCA / Ministry of Civil Aviation).

While the React dashboard serves human decision-makers, this API layer allows automated macro-econometric models, high-frequency nowcasting systems, and regulatory surveillance scripts to consume PUSHPAK outputs directly.

---

## 2. API Endpoints

### 2.1 Latest Index Output
`GET /api/v1/government/index/latest`

Returns the most up-to-date headline and structural price index values alongside the walk-up surge spread.

#### Response Example
```json
{
  "headline_index": 133.79,
  "core_index": 110.45,
  "surge_spread": 23.34,
  "base_reference_period": "2024-Q1 (T+45 Baseline = 100.00)",
  "methodology_version": "PUSHPAK-M4-Laspeyres-1.0",
  "data_status": "PROTOTYPE_SIMULATION_DATASET",
  "last_updated_utc": "2026-09-05T03:30:00Z"
}
```

---

### 2.2 Analytical Summary Breakdown
`GET /api/v1/government/index/summary`

Provides deep structural diagnostics explaining the divergence between Headline (all horizons) and Core (advance booking horizons), with econometric interpretation.

#### Key Fields
- `headline_index`: Dynamic aggregate index (133.79)
- `core_index`: Baseline capacity index (110.45)
- `spread_bps`: Spread expressed in basis points (2,334 bps)
- `economic_interpretation`: Formal explanation of whether price escalation reflects baseline inflation or short-term booking scarcity.

---

### 2.3 Representative Route Basket
`GET /api/v1/government/routes`

Exposes the fixed representative corridor basket that strictly drives the Laspeyres index.

#### Route Specifications
- **DEL-BOM (Delhi ↔ Mumbai):** Weight 42.5%, Distance 1,148 km.
- **DEL-BLR (Delhi ↔ Bengaluru):** Weight 32.5%, Distance 1,740 km.
- **BOM-BLR (Mumbai ↔ Bengaluru):** Weight 25.0%, Distance 842 km.
- **Total Weight:** 100.0%

---

### 2.4 Cryptographic Provenance & Audit
`GET /api/v1/government/provenance`

Returns complete cryptographic audit metadata for institutional verification:
- Primary dataset record count (50,000 verified observations)
- Cryptographic source hashes
- Recent live acquisition runs with SHA-256 integrity digests
- Audit verification status (`VERIFIED_DETERMINISTIC`)

---

### 2.5 Dataset Transparency & Status
`GET /api/v1/government/data-status`

Provides complete disclosure of system capabilities and limitations:
- `is_live_ingestion_active`: Boolean status of live open telemetry connectors.
- `demonstration_mode`: Clear indication that baseline data is calibrated from published DGCA periodic schedules.
- `backtesting_statement`: Explicit statement that 30-day historical backtesting is not claimed without verified historical archives.
- `official_cpi_disclaimer`: Reminds evaluators that this is an experimental research prototype for CPI augmentation.

---

## 3. Integration Recommendations for Regulatory Workflows

1. **Nowcasting Inflation:** Econometric teams at RBI and MoSPI can ingest `core_index` weekly to model early-warning trajectory in the *Transport & Communication* subgroup of CPI.
2. **Surge Monitoring:** Aviation regulators can monitor `surge_spread`. A spread exceeding 30.0 indicates that walk-up fares have decoupled from baseline inventory, triggering supervisory inquiries.
