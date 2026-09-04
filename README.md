# PUSHPAK: Civil Aviation Intelligence Platform

[![Status](https://img.shields.io/badge/SIH_2024-PUSHPAK-orange.svg)]()
[![Milestone](https://img.shields.io/badge/Milestone-0A_Complete-green.svg)]()
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
      PUSHPAK ANALYTICS ENGINE (Jevons Formula)
                    ↓
          VERSIONED REST API (FastAPI /api/v1)
                    ↓
      GOVERNMENT DASHBOARD (React + Dynamic Sidebar)
```

---

## 🚀 Quickstart (Milestone 0A)

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

### 4. Execute the Airfare Data Ingestion Pipeline
```bash
python -m backend.ingestion.pipeline
```

Upon execution, the pipeline:
- Initializes SQLite in high-performance **WAL (Write-Ahead Logging)** mode (`backend/data/pushpak.db`).
- Ingests **135 validated airfare observations** across India's top 3 trunk routes: `DEL-BOM`, `DEL-BLR`, and `BOM-BLR`.
- Captures standard advance booking windows: `T+1`, `T+7`, `T+15`, `T+30`, and `T+45`.
- Tags all records transparently with `data_mode = demo_simulation` and `environment = offline`.

---

## 🗺️ Milestone Roadmap

| Milestone | Scope / Module | Status | Description |
| :--- | :--- | :---: | :--- |
| **M0A** | **Data Acquisition Foundation** | **COMPLETE** | Pluggable connectors, Pydantic schema, SQLite WAL persistence, provenance audit trail. |
| **M0B** | **Flight Registry & Network** | *Next* | Parsing 47k domestic records from `flightsdata.pdf` into route network registry. |
| **M1** | **Backend API Layer** | *Planned* | FastAPI `/api/v1/` endpoints for health, routes, observations, and swagger docs. |
| **M2** | **Government Navigation Shell** | *Planned* | Two-tier layout: Top navigation controlling dynamic, context-aware sidebars. |
| **M3** | **PUSHPAK Index Engine** | *Planned* | Jevons Geometric Mean calculation, Core Index, and Z-score spike alerts. |
| **M4** | **Market Intelligence** | *Planned* | Lead-time yield curves, airline price dispersion, and monopoly index. |
| **M5** | **Policy Lab & CPI Sandbox** | *Planned* | Interactive MoSPI CPI Transport sensitivity simulator. |
| **M6** | **Governance & API Explorer** | *Planned* | Provenance inspector and live API test console. |
| **M7** | **Jury Readiness & Localization** | *Planned* | Bilingual English ↔ Hindi support and offline presentation fail-safes. |

---

## 📚 Documentation Index

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Technology Stack](docs/TECH_STACK.md)
- [Data Strategy & Taxonomy](docs/DATA_STRATEGY.md)
- [Data Provenance & Audit Trail](docs/DATA_PROVENANCE.md)
- [Team Learning & Defense Guide](docs/TEAM_LEARNING_GUIDE.md)
- [Jury Preparation & FAQ](docs/JURY_PREPARATION.md)
- [Milestone 0A Completion Report](docs/milestones/MILESTONE_00A.md)
