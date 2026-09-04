# PUSHPAK: Data Provenance & Audit Trail Specification

## 1. Overview
In official government statistics, **data provenance** is the complete record of data origin, transformation steps, collection methodology, and custody over time. PUSHPAK implements an end-to-end audit trail down to every individual airfare price record.

---

## 2. Provenance Record Schema

Every observation stored in the `fare_observations` table includes the following provenance attributes:

| Field | Type | Description |
| :--- | :--- | :--- |
| `observation_id` | TEXT (PK) | Unique identifier prefixed by source (e.g. `OBS-9A2F4B8C10E2-1`) |
| `source_connector` | TEXT | Identifier of the connector module that captured the record (`mock_demo_engine`, `sandbox_travel_api`) |
| `data_mode` | TEXT | Provenance classification (`official`, `historical`, `external_connector`, `demo_simulation`) |
| `environment` | TEXT | Runtime environment (`production`, `sandbox`, `offline`) |
| `query_timestamp` | TEXT | UTC ISO-8601 timestamp representing exact capture time |
| `source_hash` | TEXT | SHA-256 16-character hex hash prefix derived from the raw source payload |
| `confidence_score` | REAL | Reliability weighting between 0.00 and 1.00 |

---

## 3. Cryptographic Source Hashing

To ensure data integrity and detect upstream data mutations, PUSHPAK hashes raw ingestion payloads before any database transformation occurs:

```python
import hashlib
import json

def generate_source_hash(payload: Any) -> str:
    if isinstance(payload, (dict, list)):
        raw_str = json.dumps(payload, sort_keys=True)
    else:
        raw_str = str(payload)
    return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()[:16]
```

This hash acts as an immutable fingerprint verifying that stored values match the connector output.

---

## 4. Confidence Scoring System

PUSHPAK assigns an explicit `confidence_score` ($0.0 \le c \le 1.0$) to each observation:

- **1.00**: Direct government publication or authorized GDS feed with complete fare breakdown (base fare, UDF, ASF, GST).
- **0.95**: Permitted public sandbox API with verified HTTP 200 response.
- **0.85**: Deterministic econometric yield curve simulation.
- **0.70**: Estimated fares where taxes or surcharges had to be inferred.

---

## 5. Provenance Audit Queries

Anyone can audit the database integrity using standard SQL queries:

```sql
-- 1. Distribution of records across Data Modes and Environments
SELECT data_mode, environment, COUNT(*) AS count, ROUND(AVG(confidence_score), 2) AS avg_confidence
FROM fare_observations
GROUP BY data_mode, environment;

-- 2. Audit specific route pricing with hashes
SELECT observation_id, route_code, airline_name, lead_time_bucket, total_fare, source_hash, query_timestamp
FROM fare_observations
WHERE route_code = 'DEL-BOM'
ORDER BY query_timestamp DESC
LIMIT 5;
```

---

## 6. Frontend Badge Integration (Upcoming Milestone 2)

In the user interface, every table and chart displays a color-coded **Provenance Pill Badge**:
- 🟢 **Live External Feed** (`external_connector` / `production`)
- 🔵 **Official Publication** (`official` / `production`)
- 🟡 **Synthetic Simulation** (`demo_simulation` / `offline`)
- ⚪ **Historical Schedule** (`historical` / `offline`)

Clicking any badge opens an **Inspection Modal** revealing the raw hash, connector ID, and exact capture timestamp.
