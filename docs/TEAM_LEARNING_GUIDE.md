# PUSHPAK: Team Learning & Knowledge Preparation Guide

This guide prepares the entire SIH team for tomorrow's presentation. Regardless of background, each team member should master their assigned tier.

---

## 1. Knowledge Tier Taxonomy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TEAM KNOWLEDGE TIERS                            │
├──────────────┬─────────────────────────────────┬───────────────────────┤
│ Tier         │ Competency Required             │ Target Audience       │
├──────────────┼─────────────────────────────────┼───────────────────────┤
│ BASIC        │ What is it? Why does PUSHPAK    │ All Team Members      │
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
- **Basic (All)**: We never lie about our data. PUSHPAK uses 4 modes (`official`, `historical`, `external_connector`, `demo_simulation`) and 3 environments (`production`, `sandbox`, `offline`).
- **Intermediate**: Every row in SQLite has `data_mode` and `environment` enforced by SQL checks and Pydantic enums.
- **Advanced**: Why this matters to government evaluators: deceptive prototypes that fake live data lose points instantly; transparent prototypes with pluggable adapters show enterprise maturity.

### Topic 2: Ethical Data Acquisition
- **Basic (All)**: We do not scrape illegally, break CAPTCHAs, or violate airline terms of service.
- **Intermediate**: Connectors inherit from `BaseConnector`. If an external sandbox API fails or has no key, the pipeline falls back gracefully to `MockDemoConnector`.
- **Advanced**: How government systems operate in reality: through formal bilateral GDS agreements, open APIs, and authorized data-sharing pipelines (e.g. DigiYatra, NDAP).

### Topic 3: Flight Registry (`flightsdata.pdf`) vs. Price Observations
- **Basic (All)**: The PDF has 47k domestic flight records but **no airfares**—the number is flight duration. We use it for route frequency and airline network modeling, while our pipeline collects actual fares.
- **Intermediate**: PDF parsed into `flight_registry` table; fare observations stored in `fare_observations` table.
- **Advanced**: Combining network topology from schedules with dynamic pricing from micro-observations gives true route revenue and market power insights.

### Topic 4: Advance Booking Lead Times (T+1 to T+45)
- **Basic (All)**: Airfares change drastically depending on when you book. $T+1$ is walk-up surge; $T+45$ is early-bird advance booking.
- **Intermediate**: We model 5 distinct buckets: $T+1, T+7, T+15, T+30, T+45$.
- **Advanced**: Why traditional CPI fails: sampling only 30-day advance fares underestimates inflation during holidays when people book $T+1$ to $T+7$.

### Topic 5: SQLite in WAL Mode
- **Basic (All)**: Our database is a single portable file (`pushpak.db`), requiring zero setup or installation.
- **Intermediate**: We enabled Write-Ahead Logging (`PRAGMA journal_mode = WAL;`), which allows fast concurrent reads without locking writers.
- **Advanced**: Why WAL mode is superior for hackathons: eliminates file locking bugs during simultaneous CLI ingestion and web API requests.

### Topic 6: FastAPI REST Architecture & OpenAPI
- **Basic (All)**: Our backend serves JSON data through REST endpoints (`/api/v1/...`) and auto-generates interactive API documentation at `/docs` (Swagger UI) and `/redoc`.
- **Intermediate**: Routers are split into modular domain modules (`health`, `flights`, `routes`, `analytics`, `fares`, `provenance`). Requests and responses are strictly validated via Pydantic v2 schemas.
- **Advanced**: How data integrity is preserved in the API: flight registry endpoints explicitly return `observed_flight_records` with warning notes that counts are not daily flight frequencies. Fares retain cryptographic hashes (`source_hash`) and provenance mode tags (`demo_simulation`, etc.).

### Topic 7: Fare Intelligence & Explainable Volatility
- **Basic (All)**: What is data aggregation? Instead of looking at 135 individual numbers, we group them by route, airline, and booking window to find averages, minimums, and maximums.
- **Intermediate**: What is Standard Deviation and Coefficient of Variation ($CV$)? Standard deviation measures how spread out fares are from the average. $CV$ divides standard deviation by the mean, giving a percentage. This lets us compare a ₹4,000 route and a ₹10,000 route fairly.
### Topic 8: Airfare Price Index Suite (Headline vs Core)
- **Basic (All)**: What is an index? It sets a starting baseline at 100.00 and tracks whether prices went up or down. If the index is 133.79, it means airfares are on average 33.79% higher than the baseline.
- **Intermediate**: Difference between Headline and Core Index: Headline measures all flights including urgent last-minute walk-up tickets (T+1). Core Index filters out short-term walk-up volatility (T+1 and T+7) to reveal underlying structural capacity pricing, exactly like Core CPI excludes volatile food and fuel.
- **Advanced**: How is the Walk-Up Surge Spread calculated? Subtract Core from Headline (133.79 - 112.94 = +20.85 points). This empirically isolates the exact consumer price penalty caused by last-minute urgency. Weights are derived from corridor flight volume and sum strictly to 1.0000.

---

## 3. Recommended Study Priority Before Tomorrow
1. **First 30 minutes**: Master Topic 1 (Data Honesty) and Topic 2 (Ethics). This is the #1 question judges ask.
2. **Next 30 minutes**: Master Topic 3 (`flightsdata.pdf` distinction) and Topic 4 (Advance booking buckets).
3. **Final 30 minutes**: Rehearse running the CLI commands and demonstrating the live API:
   ```bash
   # Run tests
   python -m pytest -v

   # Start backend
   uvicorn backend.main:app --reload
   ```
   and navigate to `http://localhost:8000/docs` to execute endpoints in front of judges.
