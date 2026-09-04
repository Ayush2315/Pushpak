# PUSHPAK: Technical Reference & Architecture Guide

This guide provides technical reference for the PUSHPAK platform architecture. Regardless of specialization, technical contributors and presenters can reference their assigned domain.

---

## 1. Knowledge Tier Taxonomy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TECHNICAL KNOWLEDGE TIERS                       │
├──────────────┬─────────────────────────────────┬───────────────────────┤
│ Tier         │ Competency Required             │ Target Audience       │
├──────────────┼─────────────────────────────────┼───────────────────────┤
│ BASIC        │ What is it? Why does PUSHPAK    │ All Presenters        │
│              │ need it? Where is it on screen? │                       │
├──────────────┼─────────────────────────────────┼───────────────────────┤
│ INTERMEDIATE │ How does it work internally?    │ Technical Presenters  │
│              │ How do components communicate?  │                       │
├──────────────┼─────────────────────────────────┼───────────────────────┤
│ ADVANCED     │ Defend mathematical design,     │ Tech Lead & Data Lead │
│              │ debug live, explain tradeoffs.  │                       │
└──────────────┴─────────────────────────────────┴───────────────────────┘
```

---

## 2. Topic-by-Topic Breakdown

### Topic 1: Data Modes & Technical Honesty
- **Basic (All)**: We never misrepresent data sources. PUSHPAK uses explicit data modes (`official`, `historical`, `external_connector`, `demo_simulation`) and environments (`production`, `sandbox`, `offline`).
- **Intermediate**: Every row in SQLite has `data_mode` and `environment` enforced by SQL checks and Pydantic enums.
- **Advanced**: Why this matters to government evaluators: deceptive prototypes that fake live data lose institutional credibility; transparent prototypes with pluggable adapters show enterprise maturity.

### Topic 2: Ethical Data Acquisition
- **Basic (All)**: We do not scrape illegally, break CAPTCHAs, or violate airline terms of service.
- **Intermediate**: Connectors inherit from `BaseConnector`. If an external sandbox API fails or has no key, the pipeline falls back gracefully to `DemoAirlineConnector`.
- **Advanced**: How government systems operate in reality: through formal bilateral GDS agreements, open APIs, and authorized data-sharing pipelines (e.g. DigiYatra, NDAP).

### Topic 3: Flight Registry (`flightsdata.pdf`) vs. Price Observations
- **Basic (All)**: The registry has domestic flight records but **no airfares**—the numerical figure is flight duration. We use it for route frequency and airline network modeling, while our pipeline collects actual fares.
- **Intermediate**: PDF parsed into `flight_registry` table; fare observations stored in `fare_observations` table.
- **Advanced**: Combining network topology from schedules with dynamic pricing from micro-observations gives true route revenue and market power insights.

### Topic 4: Advance Booking Lead Times (T+1 to T+45)
- **Basic (All)**: Airfares change drastically depending on when you book. $T+1$ is walk-up surge; $T+45$ is early-bird advance booking.
- **Intermediate**: We model 5 distinct buckets: $T+1, T+7, T+15, T+30, T+45$.
- **Advanced**: Why traditional periodic CPI sampling misses critical price changes: sampling only 30-day advance fares underestimates inflation during peak periods when travelers book $T+1$ to $T+7$.

### Topic 5: SQLite in WAL Mode
- **Basic (All)**: Our database is a single portable file (`pushpak.db`), requiring zero setup or installation.
- **Intermediate**: We enabled Write-Ahead Logging (`PRAGMA journal_mode = WAL;`), which allows fast concurrent reads without locking writers.
- **Advanced**: Why WAL mode is superior for portable deployments: eliminates file locking bugs during simultaneous CLI ingestion and web API requests.

### Topic 6: FastAPI REST Architecture & OpenAPI
- **Basic (All)**: Our backend serves JSON data through REST endpoints (`/api/v1/...`) and auto-generates interactive API documentation at `/docs` (Swagger UI) and `/redoc`.
- **Intermediate**: Routers are split into modular domain modules (`health`, `flights`, `routes`, `analytics`, `fares`, `provenance`, `acquisition`, `government`). Requests and responses are strictly validated via Pydantic v2 schemas.
- **Advanced**: How data integrity is preserved in the API: flight registry endpoints explicitly return `observed_flight_records` with warning notes that counts are dataset observations. Fares retain cryptographic hashes (`source_hash`) and provenance mode tags (`demo_simulation`, etc.).

### Topic 7: Fare Intelligence & Explainable Volatility
- **Basic (All)**: Data aggregation groups observations by route, airline, and booking window to calculate averages, minimums, maximums, and spreads.
- **Intermediate**: Standard deviation measures pricing dispersion; Coefficient of Variation ($CV$) divides standard deviation by the mean as a normalized percentage, enabling fair comparison between ₹4,000 and ₹10,000 routes.

### Topic 8: Airfare Price Index Suite (Headline vs Core)
- **Basic (All)**: An index sets a starting baseline at 100.00 and tracks whether prices rose or fell relative to that benchmark.
- **Intermediate**: Headline Index incorporates all booking windows (T+1 to T+45). Core Index filters out short-term walk-up volatility (T+1 and T+7) to reveal structural capacity pricing.
- **Advanced**: Walk-Up Surge Spread equals Headline minus Core Index points, isolating the dynamic pricing penalty caused by near-departure bookings.

---

## 3. Recommended Demonstration Rehearsal
1. **First Priority**: Master Topic 1 (Data Honesty) and Topic 2 (Ethics). Be clear that demonstration data validates architecture without claiming live scraping or 30-day backtesting.
2. **Second Priority**: Master Topic 3 (`flightsdata.pdf` registry vs fare observations) and Topic 4 (Advance booking buckets).
3. **Execution Verification**: Rehearse running the CLI commands and demonstrating the live API:
   ```bash
   # Run tests
   python -m pytest -v

   # Start backend
   uvicorn backend.main:app --reload
   ```
   and navigate to `http://localhost:8000/docs` to execute endpoints for technical reviewers.
