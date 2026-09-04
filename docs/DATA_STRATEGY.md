# PUSHPAK: Data Strategy & Governance

## 1. Executive Summary
The foundation of PUSHPAK is **technical transparency**. In national civil aviation analytics and economic index compilation, confusing simulated data with live market data is unacceptable. PUSHPAK establishes a rigorous data architecture dividing data into distinct functional layers and enforcing strict provenance tags on every stored record.

---

## 2. Core Data Layers

### Layer A: Domestic Flight Registry (`flightsdata.pdf`)
- **Scope**: ~47,000 Indian domestic flight records.
- **Fields**: Airline, Flight Number, Source City, Departure Time, Stops, Arrival Time, Destination City, Class, Duration.
- **Critical Clarification**: `flightsdata.pdf` **does not contain airfares**. The numerical metric in this dataset is flight duration in hours/minutes, not ticket prices.
- **Intended Use**:
  - Construction of India's domestic flight connectivity graph.
  - Airline route coverage and frequency analysis.
  - Route scheduling baselines (morning vs evening flight distribution).
  - Normalization weights for airline presence.

### Layer B: Micro-Level Airfare Price Observations
- **Scope**: Real-time and scheduled price quotes across advance booking windows.
- **Fields**: Carrier code, route code (`ORIGIN-DEST`), cabin class, base fare, airport fees & taxes, total fare payable, departure date, and booking window bucket.
- **Booking Windows Stratification**:
  - **T+1**: Last-minute / walk-up demand (captures peak volatility and surge pricing).
  - **T+7**: Short-range business and emergency travel.
  - **T+15**: Medium-range leisure and planned domestic travel.
  - **T+30**: Standard advance purchase leisure booking baseline.
  - **T+45**: Early-bird promotional fare tier.

### Layer C: Official Statistics & Benchmarks
- **Scope**: Ministry of Statistics and Programme Implementation (MoSPI) CPI weights and DGCA monthly passenger traffic reports.
- **Intended Use**: Calibrating route-level weights and calculating macro CPI Transport basket sensitivities.

---

## 3. Strict Provenance Taxonomy

Every single observation committed to `pushpak.db` must define both `data_mode` and `environment`:

### Data Mode (`data_mode`)
1. `official`: Sourced directly from published government gazettes, MoSPI CPI indices, or DGCA reports.
2. `historical`: Extracted from verified historical flight schedules (e.g., `flightsdata.pdf`).
3. `external_connector`: Captured via authorized external flight APIs or permitted developer sandboxes.
4. `demo_simulation`: Generated via deterministic yield curve algorithms for offline demonstrations and test runs.

### Operational Environment (`environment`)
1. `production`: Live verified public data feed.
2. `sandbox`: Developer sandbox or test environment with sample credentials.
3. `offline`: Completely local, isolated runtime with zero network dependency.

---

## 4. Ethical Ingestion Principles

PUSHPAK enforces strict compliance with ethical and legal data acquisition standards:
- **No Evasive Scraping**: PUSHPAK does not use residential proxy rotation, browser fingerprint spoofing, or headless stealth evasion.
- **No CAPTCHA Cracking**: The system does not attempt to bypass CAPTCHAs or Cloudflare bot mitigation systems.
- **Connector Abstraction**: All external sources interface through `BaseConnector`. If an external endpoint enforces strict rate limits or fails, the pipeline logs the event and falls back to deterministic simulation without crashing.
- **Respect for Source Infrastructure**: Connectors enforce rate limits and polite request headers (`User-Agent: PUSHPAK-CivilAviationResearch/1.0`).
