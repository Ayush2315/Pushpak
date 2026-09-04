# PUSHPAK: Domestic Flight Registry & Route Network Specification

## 1. Overview & Data Source
The PUSHPAK Flight Registry forms the structural backbone of Indian civil aviation network intelligence. Sourced from the domestic flight record collection (`flightsdata.pdf`), the document contains **300,153 raw records** across 12,774 pages (with the primary 50,000 representative records covering Delhi and major trunk routes indexed in the active baseline registry).

---

## 2. Fundamental Data Clarification & Ethics
1. **Duration vs Price**: The numerical value in `flightsdata.pdf` represents **flight duration in hours**, not ticket prices. Airfare observations are collected through PUSHPAK's dedicated micro-observation ingestion pipeline (Milestone 0A).
2. **Observed Records vs Daily Frequency**: The registry represents an indexed historical dataset of observed flight schedules. Counts are strictly documented as `observed_flight_records` rather than assumed daily flight frequencies.
3. **Categorical Time Slots Preserved**: Departure and arrival times are faithfully retained as categorical slots (`Early_Morning`, `Morning`, `Afternoon`, `Evening`, `Night`, `Late_Night`) rather than inventing arbitrary clock times (e.g. 06:00).

---

## 3. Database Schema

### `flight_registry` Table
```sql
CREATE TABLE IF NOT EXISTS flight_registry (
    flight_id TEXT PRIMARY KEY,
    airline TEXT NOT NULL,
    flight_number TEXT NOT NULL,
    source_city TEXT NOT NULL,
    origin_code TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_code TEXT NOT NULL,
    route_code TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    stops TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    class_type TEXT NOT NULL,
    duration_hours REAL NOT NULL,
    data_mode TEXT NOT NULL,
    environment TEXT NOT NULL,
    source_type TEXT NOT NULL
);
```

### `v_route_network` Summary View
```sql
CREATE VIEW IF NOT EXISTS v_route_network AS
SELECT 
    route_code,
    origin_code,
    destination_code,
    source_city,
    destination_city,
    COUNT(*) AS observed_flight_records,
    COUNT(DISTINCT airline) AS active_airlines_count,
    ROUND(AVG(duration_hours), 2) AS avg_duration_hours,
    ROUND(MIN(duration_hours), 2) AS min_duration_hours,
    SUM(CASE WHEN LOWER(stops) = 'zero' THEN 1 ELSE 0 END) AS non_stop_records
FROM flight_registry
GROUP BY route_code;
```

---

## 4. Provenance Classification
- **Real PDF Dataset**:
  - `data_mode`: `historical`
  - `environment`: `offline`
  - `source_type`: `pdf_dataset`
- **Fallback Seed Dataset**:
  - `data_mode`: `demo_simulation`
  - `environment`: `offline`
  - `source_type`: `seed_fallback`

---

## 5. Analytical Capabilities (`backend/analytics/network_analytics.py`)
- **Route Connectivity**: Minimum flight duration, average duration, and non-stop vs 1-stop connectivity.
- **Carrier Presence**: Operating airline breakdown and route market share.
- **Departure Slot Profile**: Distribution across Early Morning, Morning, Afternoon, Evening, and Night.
