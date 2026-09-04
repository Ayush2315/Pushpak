# PUSHPAK: Civil Aviation Intelligence Platform

[![Status](https://img.shields.io/badge/Status-Evaluation_Ready-orange.svg)]()
[![Milestones](https://img.shields.io/badge/Milestones-M0_to_M9_Complete-green.svg)]()
[![License](https://img.shields.io/badge/License-Government_Open_Access-blue.svg)]()

PUSHPAK is an institutional-grade Civil Aviation Intelligence Platform. It delivers India's first high-frequency **Airfare Price Index Suite**, augmenting official statistical measures (such as the Consumer Price Index compiled by MoSPI) and providing civil aviation authorities (DGCA, MoCA) with auditable market intelligence, fare dispersion analytics, and heuristic surveillance signals.

---

## 🏛️ Core Principles & Data Transparency

1. **Absolute Data Honesty**: PUSHPAK visibly and programmatically categorizes all data layers. Demonstration data is **never** presented as live market transactions:
   - 🔵 **Demonstration Acquisition Dataset**: Controlled deterministic multi-cycle connector demonstrating validation, schema normalization, and SHA-256 deduplication without fake scraping claims.
   - 🟢 **Audited Analytical Dataset**: Verified baseline corridor observations powering Laspeyres/Jevons deterministic mathematical calculations.
   - 🟣 **Live Public Aviation Data**: Real-time open civil aviation telemetry (OpenSky Network ADS-B) for operational aircraft presence.
2. **Ethical Acquisition Architecture**: Zero evasive scraping, zero CAPTCHA bypassing, and zero bot evasion. The platform relies on open public developer APIs, permitted sandbox connectors, structured flight registries, and mathematical yield modeling.
3. **No Fabricated Backtests**: PUSHPAK is architecturally ready for continuous daily backtesting as observations accumulate over time, but explicitly disclaims any completed 30-day historical backtest claim.
4. **Government-Ready Design System**: Built using an official, data-dense design system prioritizing clarity, accessibility, auditable single-instance workspaces, and bilingual support (English ↔ Hindi).

---

## 📊 High-Level Architecture & Pipeline Flow

```
1. ACQUIRE FARE DATA      Multi-source acquisition adapter (Sandbox / Open Telemetry)
         ↓
2. VALIDATE & CLEAN       9-stage validation: schema checks, positive fares, date logic
         ↓
3. DEDUPLICATE & STORE    SHA-256 fingerprinting & SQLite WAL journal persistence
         ↓
4. FARE ANALYTICS         Mean, median, CV dispersion, advance booking yield curves
         ↓
5. PRICE INDEX SUITE      Headline Index, Core Index, and Walk-Up Surge Spread
         ↓
6. POLICY SIGNALS         Surveillance priority classification & heuristic triggers
         ↓
7. INSTITUTIONAL API      FastAPI REST endpoints for statistical & regulatory ingestion
```

---

## 🚀 Quickstart

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Virtual environment (recommended)

### 2. Install Dependencies
```bash
# Backend dependencies
pip install -r backend/requirements.txt

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Run Automated Backend Tests
```bash
python -m pytest -v
```

### 4. Execute Ingestion Pipelines (If Re-initializing)
```bash
# Ingest deterministic airfare observations (M0A)
python -m backend.ingestion.pipeline

# Ingest domestic flight registry records (M0B)
python -m backend.ingestion.pdf_registry_parser
```

### 5. Launch the FastAPI Backend Server
```bash
uvicorn backend.main:app --reload --port 8000
```

Access the interactive API documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 6. Launch the React + Vite Frontend Dashboard
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to access the interactive dashboard and click **▶ Run End-to-End Demonstration**.

---

## 🗺️ Milestone Roadmap

| Milestone | Scope / Module | Status | Description |
| :--- | :--- | :---: | :--- |
| **M0A** | **Data Acquisition Foundation** | **COMPLETE** | Pluggable connectors, Pydantic schema, SQLite WAL persistence, provenance audit trail. |
| **M0B** | **Flight Registry & Network** | **COMPLETE** | Ingested domestic flight registry (50,000 active sample of 300,153 records), route network view. |
| **M1** | **Backend API Layer** | **COMPLETE** | FastAPI `/api/v1/` endpoints for health, flights, routes, analytics, fares, provenance, CORS, and Swagger docs. |
| **M2** | **Intelligence & Fare Analytics** | **COMPLETE** | Volatility classification ($CV$), lead-time yield curves ($T+1$ to $T+45$), inter-carrier comparison, deterministic insights. |
| **M3** | **Decision Support & Policy Intelligence** | **COMPLETE** | Quantitative priority classification (`HIGH_ATTENTION`, `MONITOR`, `LOW_ATTENTION`), traceable policy flags. |
| **M4** | **PUSHPAK Price Index Engine** | **COMPLETE** | PUSHPAK Headline Index, PUSHPAK Core Index, Walk-Up Surge Spread, corridor price-relatives, Laspeyres weighting. |
| **M5** | **Frontend Dashboard & Decision Interface** | **COMPLETE** | React + Vite dashboard: 7 core modules, bilingual English ↔ Hindi toggle, Recharts visualizations. |
| **M6** | **Transparency & Knowledge Center** | **COMPLETE** | Single-instance contextual information windows, formula inspector, FAQ directory. |
| **M7** | **Live Data Lab & Telemetry** | **COMPLETE** | OpenSky ADS-B live flight tracker, METAR weather, ethical acquisition pipeline visualizer. |
| **M8** | **Acquisition Demonstration & Government API** | **COMPLETE** | 5 rotating deterministic acquisition scenarios, SHA-256 deduplication, MoSPI/RBI institutional API export. |
| **M9** | **Final System Integration & Reliability** | **COMPLETE** | Interactive Data-to-Decision pipeline flow, 6-stage Guided Demo mode, reliability guards, presentation readiness. |

---

## 📚 Documentation Index

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Technology Stack](docs/TECH_STACK.md)
- [API Developer Guide](docs/API_GUIDE.md)
- [Government API Specification](docs/GOVERNMENT_API.md)
- [Live Data Acquisition Architecture](docs/LIVE_DATA_ACQUISITION.md)
- [Historical Backtest Framework & Readiness](docs/BACKTEST_FRAMEWORK.md)
- [Fare Intelligence & Volatility Engine](docs/FARE_INTELLIGENCE.md)
- [Policy Intelligence & Decision Support](docs/POLICY_INTELLIGENCE.md)
- [Airfare Price Index Engine Architecture](docs/PRICE_INDEX.md)
- [Technical Architecture & Evaluation Defense Guide](docs/JURY_PREPARATION.md)
