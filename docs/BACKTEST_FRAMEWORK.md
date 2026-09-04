# PUSHPAK Historical Backtest Framework

## Purpose

The Historical Backtest Framework provides a methodology for verifying PUSHPAK Price Index calculations against accumulated historical fare observations over time. This is not a fabricated "30-day backtest" — it is an honest architectural readiness document.

## Current State (Honest Assessment)

### What Exists Today

- **50,000 verified domestic flight registry records** from audited CSV datasets
- **Deterministic fare simulation baseline** across 5 advance purchase horizons (T+1, T+7, T+15, T+30, T+45)
- **Representative 3-route basket** with volume-proportional weights summing to unity
- **Laspeyres-type price index engine** computing Headline and Core indices in real-time
- **Airfare Acquisition Lab** with 9-stage validated pipeline producing clean, deduplicated observations with SHA-256 provenance

### What Does NOT Yet Exist

- **30-day continuous historical accumulation**: The system has been running in prototype mode. True backtesting requires consecutive daily fare collection across the full basket over a sustained observation window.
- **Time-series index trajectory**: A genuine I(t₁), I(t₂), ..., I(tₙ) series requires N distinct daily observation snapshots, which the prototype is architecturally ready to produce but has not yet accumulated.

## Backtest Methodology (When Data Accumulates)

### Step 1: Daily Fare Collection

For each day `t` in the backtest window:
1. Execute the 9-stage acquisition pipeline for each route in the representative basket
2. Record validated, deduplicated fare observations timestamped to day `t`
3. Compute SHA-256 provenance hash for each daily collection run

### Step 2: Compute Daily Price Relatives

For each route `i` on day `t`:
```
Rᵢ(t) = P̄ᵢ(t) / Pᵢ(0)
```
Where:
- `P̄ᵢ(t)` = geometric mean of accepted fare observations for route `i` on day `t`
- `Pᵢ(0)` = baseline fare for route `i` (T+45 advance purchase reference)

### Step 3: Compute Daily Index Value

```
I(t) = Σ(wᵢ × Rᵢ(t)) × 100
```

### Step 4: Derive Analytical Metrics

- **Headline Index Trajectory**: I₁, I₂, ..., Iₙ (all 5 booking horizons)
- **Core Index Trajectory**: Excluding T+1 and T+7 walk-up windows
- **Walk-Up Surge Spread Over Time**: (Headline − Core) daily tracking
- **Index Volatility**: Standard deviation of daily index changes
- **Day-over-Day Movement**: ΔI(t) = I(t) − I(t−1)

## Validation Criteria

When sufficient data accumulates, PUSHPAK will validate:

| Criterion | Expected Behavior |
|-----------|-------------------|
| Base period index | I(0) = 100.00 exactly |
| Walk-up surge spread | Headline > Core (consistently) |
| Advance window monotonicity | T+1 fares > T+7 > T+15 > T+30 > T+45 |
| Basket weight stability | Σwᵢ = 1.0000 across all days |
| Hash chain integrity | No provenance hash collisions across distinct runs |

## Prototype Capability

The PUSHPAK system is **architecturally ready** to execute full historical backtesting:

- The acquisition pipeline can be scheduled via cron for daily execution
- Each run is independently hashable and auditable
- Clean observations are stored with temporal metadata (observation_timestamp)
- The index engine can be invoked against any date-filtered subset of observations

## Honest Limitation

> **Transparency Note**: PUSHPAK does not fabricate a fake 30-day backtest chart. The system is architecturally prepared to accumulate genuine time-series data. Fabricating historical backtests would violate the project's strict data honesty policy.
