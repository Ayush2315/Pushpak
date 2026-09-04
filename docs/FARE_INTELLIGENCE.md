# PUSHPAK Fare Intelligence & Volatility Engine

- **Module**: `backend/analytics/fare_analytics.py` & `backend/analytics/intelligence.py`
- **API Router**: `/api/v1/intelligence/`
- **Scope**: Explainable statistical analysis, yield curve tracking, inter-carrier price dispersion, and deterministic insight generation.

---

## 1. Architectural Design & Philosophy

The PUSHPAK Fare Intelligence Engine turns raw micro-observations into actionable civil aviation insights for authorities, analysts, and consumers.

```
RAW FARE OBSERVATIONS (fare_observations table)
                   │
                   ▼
       FARES ANALYTICS ENGINE (backend/analytics/fare_analytics.py)
       - Summary Statistics (Mean, Min, Max, Range, Std Dev, CV)
       - Booking Window Dynamics (T+1 to T+45)
       - Airline Price Comparison & Differentials
                   │
                   ▼
      INTELLIGENCE SERVICE (backend/analytics/intelligence.py)
       - Route Volatility Classification (Stable, Moderate, High)
       - Deterministic Rule-Based Insight Generator (Zero LLMs)
       - Provenance Enforcement & Transparency Tagging
                   │
                   ▼
       REST API LAYER (/api/v1/intelligence)
       - GET /api/v1/intelligence/routes/{route_code}
       - GET /api/v1/intelligence/booking-windows
       - GET /api/v1/intelligence/compare-airlines
       - GET /api/v1/intelligence/fare-index
```

### Core Principles
1. **Explainable Mathematics**: Every score is derived from standard statistical formulas. No black-box neural networks or proprietary black-box calculations are used.
2. **Zero Nondeterministic LLMs**: All textual insights are produced via deterministic rule trees. Identical inputs generate identical outputs every single time.
3. **Transparent Authority Badging**: Volatility bands are clearly labeled as *"PUSHPAK Analytical Classification"*, never misrepresented as official DGCA/MoCA regulatory benchmarks.
4. **Mandatory Provenance Preservation**: Every payload includes `data_mode` (`demo_simulation`), `environment` (`offline`), and disclaimers that simulated records are not live market quotes.

---

## 2. Statistical Formulas & Metrics

### 2.1 Route Fare Distribution Metrics
For $N$ airfare observations $\{x_1, x_2, \dots, x_N\}$ on a given corridor:

- **Mean Fare ($\bar{x}$)**:
  $$\bar{x} = \frac{1}{N}\sum_{i=1}^N x_i$$
- **Sample Standard Deviation ($s$)**:
  $$s = \sqrt{\frac{1}{N-1}\sum_{i=1}^N (x_i - \bar{x})^2} \quad (\text{for } N > 1)$$
- **Fare Range ($R$)**:
  $$R = x_{max} - x_{min}$$
- **Coefficient of Variation ($CV$)**:
  $$CV = \left(\frac{s}{\bar{x}}\right) \times 100\%$$
  *Why $CV$?* Standard deviation is sensitive to the scale of the route (a ₹1,000 spread is huge on a ₹3,000 route but modest on a ₹12,000 route). $CV$ normalizes dispersion across routes, enabling objective volatility comparisons across India's domestic network.

### 2.2 Advance Booking Dynamics
- **Walk-up / Advance Premium ($S_{lead}$)**:
  $$S_{lead} = \left(\frac{\bar{x}_{T+1} - \bar{x}_{T+45}}{\bar{x}_{T+45}}\right) \times 100\%$$
  Measures the percentage price surge borne by last-minute travelers ($T+1$) relative to planned advance bookings ($T+45$).

### 2.3 Carrier Price Spread
- **Inter-Carrier Spread**:
  $$\text{Spread}_{carrier} = \bar{x}_{airline\_max} - \bar{x}_{airline\_min}$$
  Measures the pricing differential between the highest and lowest average carriers on the route.

---

## 3. Route Volatility Classification

Routes are classified using the Coefficient of Variation ($CV$):

| Band | $CV$ Range | Nature of Pricing | Policy / Consumer Implication |
| :--- | :--- | :--- | :--- |
| **`Stable`** | $CV < 15.0\%$ | Minimal fare dispersion across lead times. | Predictable corridor; minimal walk-up fare shock. |
| **`Moderate Variation`** | $15.0\% \le CV \le 30.0\%$ | Standard dynamic pricing yield curve. | Normal airline revenue management behavior. |
| **`High Variation`** | $CV > 30.0\%$ | Extreme spread between advance and walk-up fares. | High consumer fare uncertainty; priority for price surveillance. |

---

## 4. Deterministic Insight Rules

Insights are generated deterministically using the following rules:

1. **Lead-Time Advance Booking**:
   - If $S_{lead} > 50\%$: Reports a severe walk-up premium with actual rupee averages for $T+1$ vs $T+45$.
   - If $20\% \le S_{lead} \le 50\%$: Reports significant advance discount for planning ahead.
   - If $S_{lead} < 20\%$: Reports flat lead-time pricing.
2. **Airline Leadership**:
   - Identifies the lowest average carrier and its percentage discount relative to the route mean.
   - Calculates the rupee spread between the most affordable and most expensive carrier.
3. **Volatility Risk**:
   - Matches the classification band ($CV$) to an objective assessment of price predictability for travelers.
4. **Range Bounds**:
   - States minimum observed fare, maximum observed fare, and absolute spread.
5. **Provenance Tag**:
   - For `demo_simulation` data, prepends: `"[Simulation-Based Analytical Insight] Metrics derived from deterministic prototype observations. Not live real-time market quotes."`

---

## 5. API Reference

### `GET /api/v1/intelligence/routes/{route_code}`
Returns the complete route intelligence dossier.
- **Example**: `GET /api/v1/intelligence/routes/DEL-BOM`
- **Response**: Summary stats, 5-bucket booking window curve, carrier comparisons, volatility classification, deterministic insights, and provenance tags.

### `GET /api/v1/intelligence/booking-windows`
Returns advance lead-time curves ($T+1$ to $T+45$) network-wide or filtered by route.
- **Query Param**: `route_code` (optional)

### `GET /api/v1/intelligence/compare-airlines`
Returns carrier pricing differentials, averages, and booking window coverage.
- **Query Param**: `route_code` (optional)

### `GET /api/v1/intelligence/fare-index`
Returns network-wide fare summaries across all routes with recorded fare observations.
