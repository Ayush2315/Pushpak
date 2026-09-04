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

---

## 3. Recommended Study Priority Before Tomorrow
1. **First 30 minutes**: Master Topic 1 (Data Honesty) and Topic 2 (Ethics). This is the #1 question judges ask.
2. **Next 30 minutes**: Master Topic 3 (`flightsdata.pdf` distinction) and Topic 4 (Advance booking buckets).
3. **Final 30 minutes**: Rehearse running the CLI command:
   ```bash
   python -m backend.ingestion.pipeline
   ```
   and explaining the terminal summary box.
