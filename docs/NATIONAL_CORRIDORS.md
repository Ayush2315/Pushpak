# PUSHPAK National Corridor Explorer Architecture

## 1. Overview & Architectural Principle

The **National Corridor Explorer** expands PUSHPAK's route monitoring beyond the strict 3-route representative basket to encompass the **Top 10 highest-density domestic air corridors in India**.

### Core Basket Separation Principle
To ensure mathematical and statistical integrity:
- **The Representative Index Basket remains strictly unchanged:**
  1. `DEL-BOM` (Weight: 42.5%)
  2. `DEL-BLR` (Weight: 32.5%)
  3. `BOM-BLR` (Weight: 25.0%)
  These 3 corridors account for 100% of the Laspeyres index weight.
- **The 7 additional National Corridors carry 0% weight in the official index:**
  They provide broader network visibility, capacity tracking, and competitive dispersion analytics without distorting the historical price index continuity.

---

## 2. Top 10 Indian Domestic Air Corridors

Corridors are ranked based on DGCA domestic city-pair traffic reports cross-referenced with the PUSHPAK flight registry:

| Rank | Route | City Pair | Distance | Duration | Observed Carriers | Basket Status | Weight |
|---|---|---|---|---|---|---|---|
| **1** | `DEL-BOM` | Delhi ↔ Mumbai | 1,148 km | 2h 10m | IndiGo, Air India, Vistara, Akasa Air | 🟢 **Representative Basket** | 42.5% |
| **2** | `DEL-BLR` | Delhi ↔ Bengaluru | 1,740 km | 2h 45m | IndiGo, Air India, Vistara, Akasa Air | 🟢 **Representative Basket** | 32.5% |
| **3** | `BOM-BLR` | Mumbai ↔ Bengaluru | 842 km | 1h 45m | IndiGo, Air India, Vistara, Akasa Air | 🟢 **Representative Basket** | 25.0% |
| **4** | `DEL-HYD` | Delhi ↔ Hyderabad | 1,260 km | 2h 15m | IndiGo, Air India, Vistara, SpiceJet | ⚪ **National Explorer Only** | 0.0% |
| **5** | `DEL-CCU` | Delhi ↔ Kolkata | 1,305 km | 2h 10m | IndiGo, Air India, SpiceJet | ⚪ **National Explorer Only** | 0.0% |
| **6** | `BOM-HYD` | Mumbai ↔ Hyderabad | 620 km | 1h 25m | IndiGo, Air India, Vistara | ⚪ **National Explorer Only** | 0.0% |
| **7** | `DEL-MAA` | Delhi ↔ Chennai | 1,760 km | 2h 50m | IndiGo, Air India, Vistara, SpiceJet | ⚪ **National Explorer Only** | 0.0% |
| **8** | `BOM-CCU` | Mumbai ↔ Kolkata | 1,660 km | 2h 35m | IndiGo, Air India, SpiceJet | ⚪ **National Explorer Only** | 0.0% |
| **9** | `BLR-HYD` | Bengaluru ↔ Hyderabad | 500 km | 1h 10m | IndiGo, Air India, Alliance Air | ⚪ **National Explorer Only** | 0.0% |
| **10** | `BOM-MAA` | Mumbai ↔ Chennai | 1,030 km | 1h 55m | IndiGo, Air India, Vistara | ⚪ **National Explorer Only** | 0.0% |

---

## 3. Contextual Analytical Window Integration

In accordance with PUSHPAK's unified UX standard:
- Clicking any corridor in the National Corridors page opens the **single-instance contextual information window** (`type: 'corridor-explorer'`).
- The panel presents:
  - Route classification and basket weight
  - Aerial distance & scheduled flight duration
  - Estimated annual passenger volume and daily scheduled frequency
  - Operating airlines and competitive presence
  - Comprehensive network importance and fare dispersion dynamics
- Clicking a different corridor immediately replaces the active panel without tab accumulation or ghost state.
- Navigating away via the sidebar automatically dismisses the panel.

---

## 4. API Endpoints

- `GET /api/v1/corridors/top10`: Returns the complete ranked list with basket flags and metadata.
- `GET /api/v1/corridors/{route_code}`: Returns detailed analytical intelligence for a specific corridor.
