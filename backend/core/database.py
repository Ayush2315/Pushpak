import sqlite3
from typing import Generator
from contextlib import contextmanager
from backend.core.config import DB_PATH
from backend.core.logger import logger

DDL_FARE_OBSERVATIONS = """
CREATE TABLE IF NOT EXISTS fare_observations (
    observation_id TEXT PRIMARY KEY,
    source_connector TEXT NOT NULL,
    data_mode TEXT NOT NULL,
    environment TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    route_code TEXT NOT NULL,
    airline_code TEXT NOT NULL,
    airline_name TEXT NOT NULL,
    flight_number TEXT,
    query_timestamp TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    lead_time_days INTEGER NOT NULL,
    lead_time_bucket TEXT NOT NULL,
    cabin_class TEXT NOT NULL,
    base_fare REAL NOT NULL,
    taxes_fees REAL NOT NULL,
    total_fare REAL NOT NULL,
    source_hash TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    CHECK (data_mode IN ('official', 'historical', 'external_connector', 'demo_simulation')),
    CHECK (environment IN ('production', 'sandbox', 'offline')),
    CHECK (base_fare >= 0),
    CHECK (total_fare >= 0)
);

CREATE INDEX IF NOT EXISTS idx_fare_lookup 
ON fare_observations(route_code, departure_date, lead_time_bucket);

CREATE INDEX IF NOT EXISTS idx_fare_provenance 
ON fare_observations(data_mode, environment);

CREATE TABLE IF NOT EXISTS flight_registry (
    flight_id TEXT PRIMARY KEY,
    row_index INTEGER,
    airline TEXT NOT NULL,
    flight_number TEXT NOT NULL,
    source_city TEXT NOT NULL,
    origin_code TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    destination_code TEXT NOT NULL,
    route_code TEXT NOT NULL,
    departure_time TEXT NOT NULL,
    stops TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    class_type TEXT NOT NULL,
    duration_hours REAL NOT NULL,
    data_mode TEXT NOT NULL,
    environment TEXT NOT NULL,
    source_type TEXT NOT NULL,
    CHECK (data_mode IN ('official', 'historical', 'external_connector', 'demo_simulation')),
    CHECK (environment IN ('production', 'sandbox', 'offline')),
    CHECK (duration_hours >= 0)
);

CREATE INDEX IF NOT EXISTS idx_reg_route ON flight_registry(route_code);
CREATE INDEX IF NOT EXISTS idx_reg_airline ON flight_registry(airline);
CREATE INDEX IF NOT EXISTS idx_reg_origin ON flight_registry(origin_code);
CREATE INDEX IF NOT EXISTS idx_reg_mode ON flight_registry(data_mode, source_type);

-- Route Network Summary View (aggregating observed records, not assuming daily frequency)
CREATE VIEW IF NOT EXISTS v_route_network AS
SELECT 
    route_code,
    origin_code,
    destination_code,
    source_city,
    destination_city,
    COUNT(*) AS observed_flight_records,
    COUNT(DISTINCT airline) AS active_airlines_count,
    ROUND(AVG(duration_hours), 2) AS avg_duration_hours,
    ROUND(MIN(duration_hours), 2) AS min_duration_hours,
    SUM(CASE WHEN LOWER(stops) = 'zero' THEN 1 ELSE 0 END) AS non_stop_records
FROM flight_registry
GROUP BY route_code;

CREATE TABLE IF NOT EXISTS live_acquisition_runs (
    run_id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    route_code TEXT NOT NULL,
    advance_purchase_window INTEGER NOT NULL,
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL,
    status TEXT NOT NULL,
    records_retrieved INTEGER NOT NULL,
    invalid_records INTEGER NOT NULL,
    duplicates_removed INTEGER NOT NULL,
    accepted_records INTEGER NOT NULL,
    integrity_hash TEXT NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS live_fare_observations (
    observation_id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    source_connector TEXT NOT NULL,
    data_mode TEXT NOT NULL,
    environment TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    route_code TEXT NOT NULL,
    carrier TEXT NOT NULL,
    airline_name TEXT NOT NULL,
    flight_number TEXT,
    advance_purchase_window INTEGER NOT NULL,
    fare_class TEXT NOT NULL,
    base_fare REAL NOT NULL,
    taxes REAL NOT NULL,
    total_fare REAL NOT NULL,
    observation_timestamp TEXT NOT NULL,
    source TEXT NOT NULL,
    source_hash TEXT NOT NULL,
    confidence_score REAL NOT NULL,
    FOREIGN KEY(run_id) REFERENCES live_acquisition_runs(run_id)
);

CREATE INDEX IF NOT EXISTS idx_live_runs_route ON live_acquisition_runs(route_code, timestamp);
CREATE INDEX IF NOT EXISTS idx_live_obs_run ON live_fare_observations(run_id);

CREATE TABLE IF NOT EXISTS airfare_acquisition_runs (
    run_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    source_name TEXT NOT NULL,
    route_code TEXT NOT NULL,
    advance_purchase_window INTEGER NOT NULL,
    observation_timestamp TEXT NOT NULL,
    records_retrieved INTEGER NOT NULL,
    records_validated INTEGER NOT NULL,
    duplicates_detected INTEGER NOT NULL,
    records_accepted INTEGER NOT NULL,
    records_rejected INTEGER NOT NULL,
    validation_status TEXT NOT NULL,
    provenance_hash TEXT NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS airfare_observations (
    observation_id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    route_code TEXT NOT NULL,
    carrier TEXT NOT NULL,
    flight_identifier TEXT NOT NULL,
    departure_date TEXT NOT NULL,
    observation_timestamp TEXT NOT NULL,
    advance_purchase_window INTEGER NOT NULL,
    fare_class TEXT NOT NULL,
    base_fare REAL NOT NULL,
    taxes REAL NOT NULL,
    total_fare REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    source TEXT NOT NULL,
    source_type TEXT NOT NULL,
    raw_record_identifier TEXT NOT NULL,
    validation_status TEXT NOT NULL,
    duplicate_status TEXT NOT NULL,
    provenance_hash TEXT NOT NULL,
    FOREIGN KEY(run_id) REFERENCES airfare_acquisition_runs(run_id)
);

CREATE INDEX IF NOT EXISTS idx_airfare_obs_run ON airfare_observations(run_id);
CREATE INDEX IF NOT EXISTS idx_airfare_obs_route ON airfare_observations(route_code, departure_date);
CREATE INDEX IF NOT EXISTS idx_airfare_obs_hash ON airfare_observations(provenance_hash);
"""

def get_connection(db_path=DB_PATH) -> sqlite3.Connection:
    """Returns an SQLite connection configured with WAL journal mode."""
    conn = sqlite3.connect(str(db_path), timeout=30.0)
    conn.row_factory = sqlite3.Row
    # Enforce WAL mode for fast concurrent read/write
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db_cursor(db_path=DB_PATH) -> Generator[sqlite3.Cursor, None, None]:
    """Context manager for SQLite database cursor with automatic commit/rollback."""
    conn = get_connection(db_path)
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error during transaction: {e}")
        raise
    finally:
        conn.close()

def init_db(db_path=DB_PATH) -> None:
    """Initializes database tables, indices, and views if not already present."""
    with get_db_cursor(db_path) as cursor:
        cursor.executescript(DDL_FARE_OBSERVATIONS)
    logger.info(f"Database initialized successfully at {db_path} with WAL mode.")

