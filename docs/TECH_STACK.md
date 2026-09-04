# PUSHPAK: Technology Stack Specification

This document provides a comprehensive technical breakdown of every technology in the PUSHPAK platform.

---

## 1. Python 3.10+
- **Category**: Programming Language / Runtime
- **Why Selected**: Universal standard in data engineering, statistics, and rapid API development. Clean syntax, rich standard library, and robust typing support.
- **Problem It Solves**: Provides a single unified language for ingestion, normalization, index mathematics, and backend serving.
- **Where Used in PUSHPAK**: Entire backend codebase (`backend/core/`, `backend/models/`, `backend/ingestion/`, `backend/tests/`).
- **How It Interacts**: Executes Pydantic schemas, runs SQLite database drivers, powers pytest suites, and will serve the FastAPI application.
- **Key Concepts to Understand**: Type annotations, abstract base classes (`abc`), context managers (`@contextmanager`), generators.
- **Basic Implementation**: Entry points invoked via standard modules: `python -m backend.ingestion.pipeline`.
- **Limitations**: Global Interpreter Lock (GIL) limits multi-threaded CPU-bound speed, mitigated by process-level isolation and SQLite asynchronous WAL read pooling.

---

## 2. Pydantic v2
- **Category**: Data Validation & Serialization
- **Why Selected**: Sub-millisecond parsing powered by a Rust core (`pydantic-core`), declarative data models, and strict type enforcement.
- **Problem It Solves**: Ingestion pipelines receive dirty external data (e.g. negative numbers, missing taxes, stringified dates). Pydantic guarantees that no corrupt record can enter the database.
- **Where Used in PUSHPAK**: `backend/models/observation.py` (`FareObservation`, `DataMode`, `Environment`).
- **How It Interacts**: Connectors feed raw dictionaries to `FareObservation.model_validate(raw_dict)`. Validated instances serialize cleanly to SQLite-ready dictionaries.
- **Key Concepts to Understand**: `BaseModel`, `Field` validation constraints, `@field_validator`, enum serialization.
- **Basic Implementation**:
  ```python
  obs = FareObservation.model_validate(raw_dict)
  cursor.execute(SQL, obs.to_sqlite_dict())
  ```
- **Limitations**: Strict validation causes rejection on schema mismatch; requires robust fallback and error logging.

---

## 3. SQLite with WAL Mode
- **Category**: Relational Database Engine
- **Why Selected**: Zero-configuration, zero-dependency, serverless embedded database engine stored in a single cross-platform file.
- **Problem It Solves**: Eliminates database daemon setups (PostgreSQL/MySQL) for the hackathon prototype while delivering microsecond read latencies.
- **Where Used in PUSHPAK**: `backend/core/database.py`, storing `backend/data/pushpak.db`.
- **How It Interacts**: Receives batch inserts from the ingestion pipeline; provides indexed queries for analytics calculations and API endpoints.
- **Key Concepts to Understand**: 
  - **WAL (Write-Ahead Logging)**: In default rollback journal mode, writes block reads. In WAL mode (`PRAGMA journal_mode = WAL;`), SQLite permits concurrent readers while a write transaction is executing.
  - **Synchronous Normal**: Balances ACID safety with maximum write throughput.
- **Basic Implementation**:
  ```python
  conn = sqlite3.connect("pushpak.db")
  conn.execute("PRAGMA journal_mode = WAL;")
  ```
- **Limitations**: Not distributed across multiple server nodes. (Completely sufficient for 100k+ rows on local SSD).

---

## 4. HTTPX
- **Category**: HTTP Client Library
- **Why Selected**: Modern HTTP client for Python supporting HTTP/1.1 and HTTP/2, strict timeouts, and synchronous/asynchronous interfaces.
- **Problem It Solves**: Replaces outdated `requests` with native connection pooling, granular timeout management, and seamless test mocking.
- **Where Used in PUSHPAK**: `backend/ingestion/sandbox_adapter.py` (Optional bonus connector).
- **How It Interacts**: Connects to public sandbox travel APIs, issuing GET requests and receiving JSON responses.
- **Key Concepts to Understand**: Client session reuse, explicit timeout configs (`httpx.Client(timeout=3.0)`), exception handling (`HTTPError`, `ConnectTimeout`).
- **Limitations**: External API rate limits and network latency.

---

## 5. Pytest
- **Category**: Automated Testing Framework
- **Why Selected**: Standard testing framework in Python, zero boilerplate, powerful fixture system, concise assertion syntax.
- **Problem It Solves**: Guarantees regressions are caught immediately before milestone sign-off.
- **Where Used in PUSHPAK**: `backend/tests/` (`test_schema.py`, `test_ingestion.py`).
- **How It Interacts**: Discovers test files matching `test_*.py`, executes assertions, and validates SQLite state.
- **Key Concepts to Understand**: Assertions, test discovery, pytest fixtures (`tmp_path`).
- **Basic Implementation**: Run via `python -m pytest -v`.
- **Limitations**: Requires test fixtures for network isolation.

---

## 6. Upcoming Stack Components (Milestones 1–3)
- **FastAPI**: Asynchronous REST API framework with native OpenAPI/Swagger auto-documentation (`/docs`).
- **Pandas / NumPy**: Vectorized price index mathematics (Jevons Geometric Mean, rolling Z-score anomaly detection).
- **React + Vite + TypeScript**: High-performance UI shell with strict component contracts.
- **Vanilla CSS Tokens**: Clean government visual theme (white canvas + subtle muted orange) adhering to official UI guidelines.
- **i18next**: Frictionless English ↔ Hindi localization without page reloads.
