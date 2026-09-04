# PUSHPAK: Project Overview

## 1. What is PUSHPAK?
PUSHPAK (Price Unified Surveillance for Harmonized Price Analysis and Knowledge) is a government-oriented Civil Aviation Intelligence Platform designed for India. Its primary mission is to establish India's first automated, high-frequency **Real-Time Airfare Price Index**, augmenting the Consumer Price Index (CPI) compiled by the Ministry of Statistics and Programme Implementation (MoSPI) and providing analytical tooling for the Ministry of Civil Aviation (MoCA) and the Directorate General of Civil Aviation (DGCA).

---

## 2. What Problem Does It Solve?
1. **Airfare Volatility & Dynamic Pricing**: Airlines in India adjust prices algorithmically in seconds based on demand, lead times, and capacity. Official CPI airfare sampling has traditionally relied on periodic, manual price collections that miss intraday and lead-time price surges.
2. **Lead-Time Blindness**: A passenger booking 45 days in advance ($T+45$) pays a drastically different fare than a passenger booking 24 hours before departure ($T+1$). Traditional statistics often average these indiscriminately. PUSHPAK explicitly stratifies fares across standard advance booking windows ($T+1, T+7, T+15, T+30, T+45$).
3. **Consumer Price Index Augmentation**: Policymakers lack real-time visibility into how domestic airfare surges ripple into the CPI Transport group. PUSHPAK bridges this gap with an interactive Policy Sandbox.
4. **Market Transparency**: Monitors carrier concentration, route-level pricing power, and post-merger market power across Indian civil aviation.

---

## 3. Who Uses PUSHPAK?
- **MoSPI / Central Statistics Office (CSO)**: For augmenting the CPI Transport and Communication basket with high-frequency airfare series.
- **Ministry of Civil Aviation (MoCA) & DGCA**: For monitoring predatory pricing, cartelization, surge price anomalies during festivals/emergencies, and regional connectivity.
- **Reserve Bank of India (RBI)**: For lead indicators on services inflation.
- **Aviation Researchers & Policy Analysts**: For empirical research into dynamic yield management.

---

## 4. What Data Does PUSHPAK Collect?
- **Micro-level Airfare Observations**: Carrier code, route code (`ORIGIN-DEST`), cabin class, base fare, airport fees & taxes, total fare payable, departure date, and booking window bucket ($T+1$ to $T+45$).
- **Domestic Flight Schedules & Route Network**: Structural baseline derived from 47,000 flight records (`flightsdata.pdf`), providing carrier route presence, flight numbers, duration, and stopovers.
- **Statistical Benchmarks**: Historical passenger traffic and city pair weights from DGCA reports.

---

## 5. How Does Data Move Through the System?
1. **Connectors**: Collect fare observations via permitted public APIs, developer sandboxes, or deterministic yield engines.
2. **Pydantic Validation**: All observations pass through strict schemas checking for valid IATA codes, non-negative amounts, and required advance windows.
3. **Provenance Tagging**: Every record is enriched with a SHA-256 source hash, capture timestamp, `data_mode`, and operational `environment`.
4. **SQLite Persistence**: Committed to SQLite configured with Write-Ahead Logging (WAL) for microsecond query response.
5. **Analytics Engine**: Computes geometric mean price relatives (Jevons Index) and flags Z-score price anomalies.
6. **FastAPI Layer**: Exposes versioned `/api/v1/` endpoints.
7. **Presentation**: Rendered on a React dashboard with dynamic module-specific sidebars.

---

## 6. How is the PUSHPAK Index Generated?
PUSHPAK employs the **Jevons Geometric Mean Index** formulation (endorsed by the IMF and ILO for elementary aggregate price indices):

$$I_{\text{Jevons}}^{0:t} = \prod_{i=1}^n \left( \frac{p_i^t}{p_i^0} \right)^{\frac{1}{n}} = \frac{\left( \prod_{i=1}^n p_i^t \right)^{\frac{1}{n}}}{\left( \prod_{i=1}^n p_i^0 \right)^{\frac{1}{n}}}$$

This formula avoids the arithmetic upward price bias inherent in simple averages (the Carli index) and satisfies both the time-reversal and transitivity tests. Indices are calculated at the route level for each booking window and aggregated nationally using passenger-traffic route weights.

---

## 7. Data Mode Honesty Policy
To guarantee 100% technical honesty during institutional evaluation and regulatory auditing, simulated or demonstration data is **never** presented as live market data. Every record displays one of four modes:

| Data Mode | Description | Example Environment |
| :--- | :--- | :--- |
| `official` | Verified publications from MoSPI or DGCA | `production` |
| `historical` | Static domestic schedule snapshots | `offline` |
| `external_connector` | Captured live via permitted public APIs | `sandbox` / `production` |
| `demo_simulation` | Mathematically modeled deterministic yield curves | `offline` |

---

## 8. Government Integration Readiness
PUSHPAK's REST API (`/api/v1/`) is designed for plug-and-play integration with:
- **National Data & Analytics Platform (NDAP)** (NITI Aayog)
- **Unified Logistics Interface Platform (ULIP)**
- Direct JSON feeds for MoSPI CPI compilers

---

## 9. Current Status (Milestone 0A Completed)
- ✅ Pluggable Connector Architecture (`BaseConnector`, `MockDemoConnector`, `SandboxApiConnector`).
- ✅ Strict Pydantic v2 validation schema (`FareObservation`).
- ✅ High-performance SQLite database with Write-Ahead Logging (`pushpak.db`).
- ✅ 135 validated observations persisted across `DEL-BOM`, `DEL-BLR`, and `BOM-BLR` across all 5 lead-time windows.
- ✅ Automated unit test suite passing with 100% success.
