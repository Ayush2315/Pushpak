# Project PUSHPAK — Airfare Price Index Engine Architecture & Methodology

## 1. Executive Summary & Product Alignment
The core mission defined in the civil aviation price intelligence problem statement is:
> **"Development of a Real-time Airfare Price Index for India for CPI augmentation."**

Project PUSHPAK achieves this by establishing a high-frequency, transparent, and auditable airfare price index architecture modeled after international statistical standards (ILO / IMF Consumer Price Index Manual). It provides government economists and policymakers at the **Ministry of Statistics and Programme Implementation (MoSPI)** and the **Directorate General of Civil Aviation (DGCA)** with an empirical instrument to track civil aviation consumer price movements.

```
+---------------------------------------------------------------------------------+
|                       PUSHPAK PRICE INDEX ENGINE ARCHITECTURE                   |
+---------------------------------------------------------------------------------+
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   | Micro-Level Fare Observations (fare_observations: T+1 to T+45 Horizons) |   |
|   +------------------------------------+------------------------------------+   |
|                                        |                                        |
|                     +------------------+------------------+                     |
|                     |                                     |                     |
|                     v                                     v                     |
|   +-----------------------------------+ +-----------------------------------+   |
|   | PUSHPAK Headline Index            | | PUSHPAK Core Index                |   |
|   | (All Horizons: T+1 to T+45)       | | (Structural: T+15, T+30, T+45)    |   |
|   | • Captures total market volatility| | • Filters short-term walk-up surge|   |
|   | • Reflects last-minute premiums   | | • Reflects baseline capacity cost |   |
|   +-----------------+-----------------+ +-----------------+-----------------+   |
|                     |                                     |                     |
|                     +------------------+------------------+                     |
|                                        |                                        |
|                                        v                                        |
|   +-------------------------------------------------------------------------+   |
|   | Walk-Up Surge Spread = Headline Index (133.79) - Core Index (112.94)    |   |
|   | Delta: +20.85 Index Points (+18.46% Walk-Up Premium Spread)             |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

---

## 2. Base Index Convention & Price Relative Formulas

### 1. Base Period Convention
The index establishes an explicit baseline convention:
$$\text{Base Index Value} = 100.00$$

In standard economic price indices, the base represents the reference baseline expenditure or price level. In the PUSHPAK prototype dataset, baseline prices ($P_{i,0}$) are determined from the **$T+45$ advance purchase horizon**, where airlines price seats at structural advance rates before dynamic yield yield-management surge takes effect.

### 2. Corridor Price Relatives ($R_i$)
For each corridor $i$ in the representative route basket:
$$R_i = \frac{\overline{P}_{i, \text{measured}}}{\overline{P}_{i, \text{base}}}$$

Where:
- $\overline{P}_{i, \text{base}}$: Average fare observed at baseline $T+45$.
- $\overline{P}_{i, \text{measured}}$: Average fare observed across the horizons being indexed.
- Corridor Index: $I_i = R_i \times 100.00$.

### 3. Composite Price Index ($I$)
The composite price index across all $K$ representative corridors in the basket is computed using Laspeyres-type weighted arithmetic aggregation:
$$I = \sum_{i=1}^{K} w_i \cdot I_i = \sum_{i=1}^{K} w_i \left( \frac{\overline{P}_{i, \text{measured}}}{\overline{P}_{i, \text{base}}} \right) \times 100$$

Subject to the normalization constraint:
$$\sum_{i=1}^{K} w_i = 1.0000 \quad (100.00\%)$$

---

## 3. PUSHPAK Headline vs. PUSHPAK Core

| Index Metric | PUSHPAK Headline | PUSHPAK Core |
| :--- | :--- | :--- |
| **Index Code** | `PUSHPAK_HEADLINE` | `PUSHPAK_CORE` |
| **Observed Value** | **`133.79`** ($+33.79\%$ vs base) | **`112.94`** ($+12.94\%$ vs base) |
| **Included Horizons** | All booking horizons: $T+1, T+7, T+15, T+30, T+45$ | Medium-to-long advance horizons: $T+15, T+30, T+45$ |
| **Excluded Factors** | None (full market coverage) | $T+1$ (walk-up) and $T+7$ (near-term surge) |
| **Economic Purpose** | Measures comprehensive consumer out-of-pocket fare level including urgent travel surge. | Measures structural capacity airline pricing, filtering out transient dynamic scarcity spikes. |
| **CPI Analogy** | Headline CPI (all items including food and energy). | Core CPI (excludes volatile food and fuel). |

### The Walk-Up Surge Spread
$$\text{Surge Spread (Points)} = I_{\text{Headline}} - I_{\text{Core}} = 133.79 - 112.94 = +20.85 \text{ points}$$
$$\text{Surge Spread (\%)} = \left( \frac{133.79 - 112.94}{112.94} \right) \times 100 = +18.46\%$$

This metric isolates the pure price penalty consumers experience when booking last-minute vs planning in advance.

---

## 4. Route Basket & Weighting Strategy

### 1. Representative Route Basket
The basket is dynamically detected from active corridors possessing validated fare observations. The current prototype basket covers India's high-density domestic trunk routes:
1. `DEL-BOM` (Delhi $\leftrightarrow$ Mumbai)
2. `DEL-BLR` (Delhi $\leftrightarrow$ Bangalore)
3. `BOM-BLR` (Mumbai $\leftrightarrow$ Bangalore)

### 2. Weighting Methodology
Corridor weights are determined deterministically using cumulative observed flight records from the 50,000-record flight registry:
- **`DEL-BLR`**: 9,934 records $\rightarrow w = \mathbf{0.4074}$ ($40.74\%$)
- **`DEL-BOM`**: 9,733 records $\rightarrow w = \mathbf{0.3992}$ ($39.92\%$)
- **`BOM-BLR`**: 4,715 records $\rightarrow w = \mathbf{0.1934}$ ($19.34\%$)
- **Total Weight**: $\sum w_i = 1.0000$ ($100.00\%$)

An `equal_weights` mode ($w_i = 33.33\%$) is supported via query parameter `?weighting_method=equal_weights` as an analytical sensitivity comparator.

---

## 5. REST API Specifications

All endpoints are mounted under `/api/v1/index`:

### 1. Headline Index
- **Endpoint**: `GET /api/v1/index/headline`
- **Query Parameters**: `weighting_method` (`observed_records` or `equal_weights`)
- **Response**: `PriceIndexResponse`

### 2. Core Index
- **Endpoint**: `GET /api/v1/index/core`
- **Query Parameters**: `weighting_method` (`observed_records` or `equal_weights`)
- **Response**: `PriceIndexResponse` (includes `excluded_factors`)

### 3. Price Index Executive Summary
- **Endpoint**: `GET /api/v1/index/summary`
- **Response**: `PriceIndexSummaryResponse` (includes `headline_index`, `core_index`, `surge_spread_points`, `surge_spread_pct`, and plain-English economic interpretation)

### 4. Index Methodology Metadata
- **Endpoint**: `GET /api/v1/index/methodology`
- **Response**: `PriceIndexMethodologyResponse` (formal mathematical and statistical specification)

---

## 6. Strict Data Honesty & Statutory Disclaimers

> [!IMPORTANT]
> **Statutory Non-Government Notice**:
> The PUSHPAK Price Index Suite is an **empirical prototype analytical index** designed for official evaluation, institutional technical demonstration, and methodology prototyping.
> - It is **NOT an official Government of India Consumer Price Index (CPI)** series.
> - It is **NOT published or certified by MoSPI or DGCA**.
> - Weights reflect dataset volume rather than official MoSPI Household Consumer Expenditure Surveys (HCES).
> - Simulated observations are tagged `data_mode="demo_simulation"` and never represented as real-time market quotes.
