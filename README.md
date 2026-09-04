# PUSHPAK: Civil Aviation Intelligence Platform

[![Status](https://img.shields.io/badge/SIH_2024-PUSHPAK-orange.svg)]()
[![Milestone](https://img.shields.io/badge/Milestone-02_Complete-green.svg)]()
[![License](https://img.shields.io/badge/License-Government_Open_Access-blue.svg)]()

PUSHPAK is a government-oriented Civil Aviation Intelligence Platform engineered for the Smart India Hackathon (SIH). It delivers India's first high-frequency **Real-Time Airfare Price Index**, augmenting official statistical measures (such as the Consumer Price Index compiled by MoSPI) and providing civil aviation authorities (DGCA, MoCA) with actionable market and route intelligence.

---

## 🏛️ Core Principles

1. **Absolute Technical Honesty**: PUSHPAK visibly distinguishes between data sources. Synthetic data is **never** presented as live market data. Every single observation carries explicit provenance tags (`data_mode` and `environment`).
2. **Ethical Data Acquisition**: Zero evasive scraping, zero CAPTCHA breaking, and zero bot evasion. The platform relies on permitted developer sandbox connectors, official publications, structured flight registries, and mathematical yield modeling.
3. **Government Aesthetic**: Built using an official, data-dense design system (white canvas with subtle muted ochre/orange accents) prioritizing clarity, accessibility, and bilingual support (English ↔ Hindi).

---

## 📊 High-Level Architecture

```
DATA SOURCES (Permitted APIs / Registry / Math Yield Engine)
                    ↓
        CONNECTOR ADAPTER LAYER (BaseConnector)
                    ↓
     NORMALIZATION & VALIDATION (Pydantic v2)
                    ↓
          PROVENANCE & AUDIT TAGGING (SHA-256)
                    ↓
        PERSISTENCE (SQLite with WAL Journaling)
                    ↓
       PUSHPAK ANALYTICS ENGINE (Jevons Formula & Volatility CV)
                    ↓
           VERSIONED REST API (FastAPI /api/v1)
                    ↓
       GOVERNMENT DASHBOARD (React + Dynamic Sidebar)
```

---

## 🚀 Quickstart

### 1. Prerequisites
- Python 3.10+
- Virtual environment (recommended)

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Run Automated Tests
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

---

## 🗺️ Milestone Roadmap

| Milestone | Scope / Module | Status | Description |
| :--- | :--- | :---: | :--- |
| **M0A** | **Data Acquisition Foundation** | **COMPLETE** | Pluggable connectors, Pydantic schema, SQLite WAL persistence, provenance audit trail. |
| **M0B** | **Flight Registry & Network** | **COMPLETE** | Ingested domestic flight registry (50,000 active sample of 300,153 records in `flightsdata.pdf`), route network view, carrier analytics. |
| **M1** | **Backend API Layer** | **COMPLETE** | FastAPI `/api/v1/` endpoints for health, flights, routes, analytics, fares, provenance, CORS, and Swagger docs. |
| **M2** | **Intelligence & Fare Analytics** | **COMPLETE** | Volatility classification ($CV$), lead-time yield curves ($T+1$ to $T+45$), inter-carrier comparison, deterministic insights. |
| **M3** | **Decision Support & Policy Intelligence** | **COMPLETE** | Quantitative priority classification (`HIGH_ATTENTION`, `MONITOR`, `LOW_ATTENTION`), numbers-traceable policy flags, macro network overview. |
| **M4** | **Government Navigation Shell & UI** | *Next* | Two-tier layout: Top navigation controlling dynamic, context-aware sidebars. |
| **M5** | **PUSHPAK Index Engine** | *Planned* | Jevons Geometric Mean calculation, Core Index, and Z-score spike alerts. |
| **M6** | **Policy Lab & CPI Sandbox** | *Planned* | Interactive MoSPI CPI Transport sensitivity simulator. |
| **M7** | **Jury Readiness & Localization** | *Planned* | Bilingual English ↔ Hindi support and offline presentation fail-safes. |

---

## 📚 Documentation Index

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Technology Stack](docs/TECH_STACK.md)
- [API Developer Guide](docs/API_GUIDE.md)
- [Fare Intelligence & Volatility Engine](docs/FARE_INTELLIGENCE.md)
- [Policy Intelligence & Decision Support](docs/POLICY_INTELLIGENCE.md)
- [Data Strategy & Taxonomy](docs/DATA_STRATEGY.md)
- [Data Provenance & Audit Trail](docs/DATA_PROVENANCE.md)
- [Flight Registry Architecture](docs/FLIGHT_REGISTRY.md)
- [Team Learning & Defense Guide](docs/TEAM_LEARNING_GUIDE.md)
- [Jury Preparation & FAQ](docs/JURY_PREPARATION.md)
- [Milestone 0A Completion Report](docs/milestones/MILESTONE_00A.md)
- [Milestone 0B Completion Report](docs/milestones/MILESTONE_00B.md)
- [Milestone 1 Completion Report](docs/milestones/MILESTONE_01.md)
- [Milestone 2 Completion Report](docs/milestones/MILESTONE_02.md)
- [Milestone 3 Completion Report](docs/milestones/MILESTONE_03.md)
