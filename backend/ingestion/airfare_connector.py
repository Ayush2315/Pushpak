"""
PUSHPAK Ethical Airfare Acquisition Architecture
=================================================
Demonstrates the complete end-to-end pipeline required by the Problem Statement:
  1. Source Connector Initialization (Ethical policies, rate-limits)
  2. Request / Observation Retrieval
  3. Parsing Raw Fare Payloads
  4. Strict Schema & Financial Validation
  5. Currency & Metadata Normalization
  6. Deterministic Deduplication Detection
  7. Clean Airfare Database Persistence
  8. Cryptographic SHA-256 Provenance Hashing
  9. Price Index Pipeline Hand-off

STRICT DATA HONESTY:
  - Demonstration observations are explicitly flagged as 'demonstration_connector'.
  - Never masquerades as fabricated live market prices.
  - Connector abstraction allows future real airline NDC/GDS providers to be plugged in.

MULTI-CYCLE DEMONSTRATION:
  - DemoAirlineConnector rotates through 5 deterministic acquisition scenarios.
  - Each scenario produces different retrieved/invalid/duplicate/accepted counts and
    different fare levels (controlled fare_multiplier), making consecutive runs visibly
    distinct and meaningful.
  - The active scenario index is persisted in SQLite so the cycle survives server restarts.
  - No uncontrolled randomness: all variation is scenario-driven and fully deterministic.
"""

import abc
import hashlib
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple

from backend.core.database import get_connection, get_db_cursor
from backend.core.logger import logger


# ---------------------------------------------------------------------------
# DEMO SCENARIO TABLE
# ---------------------------------------------------------------------------
# Each scenario is internally consistent:  accepted = retrieved - invalid - duplicates
# We lay them out explicitly so tests can assert exact counts per cycle.
# ---------------------------------------------------------------------------
DEMO_SCENARIOS = [
    {
        "index": 0,
        "label": "Baseline Market Snapshot",
        "retrieved": 12,
        "invalid": 1,
        "duplicates": 1,
        "accepted": 10,
        "fare_multiplier": 1.000,  # Baseline reference
        "note": "Standard cross-carrier acquisition with 1 schema defect and 1 duplicate.",
    },
    {
        "index": 1,
        "label": "Moderate Fare Uptick Cycle",
        "retrieved": 15,
        "invalid": 2,
        "duplicates": 1,
        "accepted": 12,
        "fare_multiplier": 1.035,  # +3.5% fare movement
        "note": "Higher retrieval batch; 2 schema defects, 1 duplicate; fares up ~3.5%.",
    },
    {
        "index": 2,
        "label": "Market Correction Cycle",
        "retrieved": 11,
        "invalid": 1,
        "duplicates": 2,
        "accepted": 8,
        "fare_multiplier": 0.972,  # -2.8% fare softening
        "note": "Smaller batch; 2 duplicates detected; fares down ~2.8% (market correction).",
    },
    {
        "index": 3,
        "label": "Strong Demand Surge Cycle",
        "retrieved": 14,
        "invalid": 0,
        "duplicates": 1,
        "accepted": 13,
        "fare_multiplier": 1.061,  # +6.1% fare surge
        "note": "High quality batch; no schema defects; significant fare surge +6.1%.",
    },
    {
        "index": 4,
        "label": "High Volume Mixed Quality Cycle",
        "retrieved": 16,
        "invalid": 2,
        "duplicates": 2,
        "accepted": 12,
        "fare_multiplier": 1.028,  # +2.8% fare increase
        "note": "Largest retrieval batch; 2 schema defects + 2 duplicates; fares up ~2.8%.",
    },
]

# Route base fares (T+45 advance purchase reference fares in INR)
ROUTE_BASE_FARES: Dict[str, float] = {
    "DEL-BOM": 6200.0,
    "DEL-BLR": 6700.0,
    "BOM-BLR": 5900.0,
    "DEL-MAA": 7100.0,
    "BOM-CCU": 6500.0,
    # Fallback for any other route
    "DEFAULT": 6000.0,
}

# Advance purchase window multipliers: nearer booking = higher surge pricing
WINDOW_MULTIPLIERS: Dict[int, float] = {
    1:  1.75,   # T+1: walk-up surge
    7:  1.35,   # T+7: weekly horizon
    15: 1.18,   # T+15: mid-range horizon
    30: 1.08,   # T+30: planned horizon
    45: 1.00,   # T+45: base reference
}

# Carrier fare adjustments relative to route base fare
CARRIER_SPECS = [
    {"carrier": "IndiGo",    "code": "6E", "flight_tpl": "6E-{num}", "fare_factor": 0.78, "fare_class": "Economy"},
    {"carrier": "IndiGo",    "code": "6E", "flight_tpl": "6E-{num}", "fare_factor": 0.83, "fare_class": "Economy"},
    {"carrier": "Air India", "code": "AI", "flight_tpl": "AI-{num}", "fare_factor": 0.92, "fare_class": "Economy"},
    {"carrier": "Air India", "code": "AI", "flight_tpl": "AI-{num}", "fare_factor": 2.45, "fare_class": "Business"},
    {"carrier": "Vistara",   "code": "UK", "flight_tpl": "UK-{num}", "fare_factor": 0.87, "fare_class": "Economy"},
    {"carrier": "Vistara",   "code": "UK", "flight_tpl": "UK-{num}", "fare_factor": 1.32, "fare_class": "Premium Economy"},
    {"carrier": "SpiceJet",  "code": "SG", "flight_tpl": "SG-{num}", "fare_factor": 0.71, "fare_class": "Economy"},
    {"carrier": "Akasa Air", "code": "QP", "flight_tpl": "QP-{num}", "fare_factor": 0.69, "fare_class": "Economy"},
]

# ── Per-carrier flight number seeds (deterministic, based on route hash) ──────
_FLIGHT_NUM_OFFSETS = [100, 200, 300, 800, 400, 500, 600, 700]


class BaseAirfareConnector(abc.ABC):
    """
    Abstract Base Connector for Airline Fare Ingestion.
    Provides extensible architecture for airline direct APIs, GDS bridges,
    and demonstration connectors.
    """

    def __init__(
        self,
        source_id: str,
        source_name: str,
        source_type: str,
        status: str = "active",
        description: str = "",
        rate_limit_per_minute: int = 30,
        respects_robots_txt: bool = True
    ):
        self.source_id = source_id
        self.source_name = source_name
        self.source_type = source_type
        self.status = status
        self.description = description
        self.rate_limit_per_minute = rate_limit_per_minute
        self.respects_robots_txt = respects_robots_txt

    @abc.abstractmethod
    def retrieve_raw_records(
        self,
        route_code: str,
        advance_purchase_window: int,
        departure_date: str
    ) -> List[Dict[str, Any]]:
        """Fetch raw fare observation records from the airline source."""
        pass

    def parse_record(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """Parse raw record into a structured intermediate observation dictionary."""
        return {
            "origin": str(raw_record.get("origin", "")).upper().strip(),
            "destination": str(raw_record.get("destination", "")).upper().strip(),
            "route_code": str(raw_record.get("route_code", "")).upper().strip(),
            "carrier": str(raw_record.get("carrier", "")).strip(),
            "flight_identifier": str(raw_record.get("flight_identifier", "")).strip(),
            "departure_date": str(raw_record.get("departure_date", "")).strip(),
            "advance_purchase_window": int(raw_record.get("advance_purchase_window", 15)),
            "fare_class": str(raw_record.get("fare_class", "Economy")).strip(),
            "base_fare": float(raw_record.get("base_fare", 0.0)),
            "taxes": float(raw_record.get("taxes", 0.0)),
            "total_fare": float(raw_record.get("total_fare", 0.0)),
            "currency": str(raw_record.get("currency", "INR")).strip().upper(),
            "source": self.source_name,
            "source_type": self.source_type,
            "raw_record_identifier": str(raw_record.get("raw_id", uuid.uuid4().hex[:12])),
            "observation_timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def validate_record(self, record: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Stage 4: Validation Engine
        Validates required fields, route structure, positive financial values,
        and mathematical consistency (base_fare + taxes == total_fare).
        """
        required_fields = [
            "origin", "destination", "route_code", "carrier",
            "flight_identifier", "departure_date", "fare_class"
        ]
        for field in required_fields:
            val = record.get(field)
            if not val or str(val).strip() == "":
                return False, f"Missing required field: '{field}'"

        if len(record["origin"]) != 3 or len(record["destination"]) != 3:
            return False, f"Invalid IATA city code: {record['origin']}-{record['destination']}"

        expected_route = f"{record['origin']}-{record['destination']}"
        if record["route_code"] != expected_route:
            return False, f"Route mismatch: expected {expected_route}, got {record['route_code']}"

        if record["base_fare"] <= 0:
            return False, f"Non-positive base fare: {record['base_fare']}"
        if record["taxes"] < 0:
            return False, f"Negative taxes/fees: {record['taxes']}"
        if record["total_fare"] <= 0:
            return False, f"Non-positive total fare: {record['total_fare']}"

        # Allow 1 INR rounding tolerance
        computed_total = record["base_fare"] + record["taxes"]
        if abs(computed_total - record["total_fare"]) > 1.5:
            return False, f"Fare breakdown arithmetic mismatch: {record['base_fare']} + {record['taxes']} != {record['total_fare']}"

        return True, "VALID"

    def normalize_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Stage 5: Normalization Engine
        Normalizes currency to standard INR, standardizes cabin classes,
        and enforces uniform casing and decimal precision.
        """
        norm = dict(record)
        norm["currency"] = "INR"
        norm["origin"] = norm["origin"].upper()
        norm["destination"] = norm["destination"].upper()
        norm["route_code"] = f"{norm['origin']}-{norm['destination']}"
        norm["base_fare"] = round(float(norm["base_fare"]), 2)
        norm["taxes"] = round(float(norm["taxes"]), 2)
        norm["total_fare"] = round(float(norm["total_fare"]), 2)

        # Standardize cabin classes to canonical set: Economy, Premium Economy, Business
        raw_class = norm.get("fare_class", "Economy").lower()
        if "prem" in raw_class:
            norm["fare_class"] = "Premium Economy"
        elif "biz" in raw_class or "business" in raw_class:
            norm["fare_class"] = "Business"
        else:
            norm["fare_class"] = "Economy"

        return norm

    def compute_deduplication_key(self, record: Dict[str, Any]) -> str:
        """
        Stage 6: Deterministic Deduplication Key
        Constructs a deterministic composite signature:
        carrier | origin | destination | departure_date | advance_purchase_window | fare_class | total_fare
        """
        key_parts = [
            str(record["carrier"]).strip().upper(),
            str(record["origin"]).strip().upper(),
            str(record["destination"]).strip().upper(),
            str(record["departure_date"]).strip(),
            str(record["advance_purchase_window"]),
            str(record["fare_class"]).strip().upper(),
            f"{float(record['total_fare']):.2f}"
        ]
        return "|".join(key_parts)

    def generate_provenance_hash(self, run_id: str, clean_observations: List[Dict[str, Any]]) -> str:
        """
        Stage 8: Cryptographic Provenance Hash
        Calculates SHA-256 digest across the sorted observation payloads and run metadata.
        Different observations, scenarios, or fare values produce a different hash.
        """
        canonical_payload = {
            "run_id": run_id,
            "source_id": self.source_id,
            "record_count": len(clean_observations),
            "observations": sorted([
                f"{o['carrier']}:{o['flight_identifier']}:{o['total_fare']}:{o.get('raw_record_identifier','')}"
                for o in clean_observations
            ])
        }
        raw_json = json.dumps(canonical_payload, sort_keys=True)
        return hashlib.sha256(raw_json.encode("utf-8")).hexdigest()

    def execute_pipeline(
        self,
        route_code: str,
        advance_purchase_window: int = 15,
        departure_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes the full 9-stage airfare acquisition and cleaning pipeline.
        """
        run_id = f"RUN-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        if not departure_date:
            target_date = datetime.now(timezone.utc) + timedelta(days=advance_purchase_window)
            departure_date = target_date.strftime("%Y-%m-%d")

        stages_log = []

        # Stage 1: Initializing Source Connector
        stages_log.append({
            "stage_number": 1,
            "stage_name": "Initializing Source Connector",
            "status": "COMPLETED",
            "details": f"Initialized {self.source_name} (Type: {self.source_type}, Rate limit: {self.rate_limit_per_minute}/min)"
        })

        # Stage 2: Retrieving Fare Observations
        raw_records = self.retrieve_raw_records(route_code, advance_purchase_window, departure_date)
        records_retrieved = len(raw_records)
        stages_log.append({
            "stage_number": 2,
            "stage_name": "Retrieving Fare Observations",
            "status": "COMPLETED",
            "details": f"Retrieved {records_retrieved} raw flight fare quote(s) for route {route_code}"
        })

        # Stage 3: Parsing Fare Records
        parsed_records = [self.parse_record(r) for r in raw_records]
        stages_log.append({
            "stage_number": 3,
            "stage_name": "Parsing Fare Records",
            "status": "COMPLETED",
            "details": f"Parsed {len(parsed_records)} records into structured schema representation"
        })

        # Stage 4: Validating Required Fields
        valid_records = []
        rejected_records = []
        for prec in parsed_records:
            is_valid, reason = self.validate_record(prec)
            if is_valid:
                prec["validation_status"] = "VALID"
                valid_records.append(prec)
            else:
                prec["validation_status"] = "INVALID"
                prec["rejection_reason"] = reason
                rejected_records.append(prec)

        records_validated = len(valid_records)
        stages_log.append({
            "stage_number": 4,
            "stage_name": "Validating Required Fields",
            "status": "COMPLETED",
            "details": f"Validated {records_validated} record(s); {len(rejected_records)} failed schema/financial rules"
        })

        # Stage 5: Normalizing Currency and Metadata
        normalized_records = [self.normalize_record(r) for r in valid_records]
        stages_log.append({
            "stage_number": 5,
            "stage_name": "Normalizing Currency and Metadata",
            "status": "COMPLETED",
            "details": f"Normalized currency to INR, standard cabin classes, and verified uppercase IATA codes"
        })

        # Stage 6: Detecting Duplicate Observations
        seen_keys = set()
        clean_records = []
        duplicate_records = []
        for nrec in normalized_records:
            dedup_key = self.compute_deduplication_key(nrec)
            nrec["deduplication_key"] = dedup_key
            if dedup_key in seen_keys:
                nrec["duplicate_status"] = "DUPLICATE"
                nrec["rejection_reason"] = f"Duplicate observation detected for key: {dedup_key}"
                duplicate_records.append(nrec)
            else:
                seen_keys.add(dedup_key)
                nrec["duplicate_status"] = "UNIQUE"
                clean_records.append(nrec)

        duplicates_detected = len(duplicate_records)
        stages_log.append({
            "stage_number": 6,
            "stage_name": "Detecting Duplicate Observations",
            "status": "COMPLETED",
            "details": f"Detected {duplicates_detected} duplicate record(s); retained {len(clean_records)} unique observation(s)"
        })

        # Stage 7: Recording Clean Observations
        records_accepted = len(clean_records)
        records_rejected = len(rejected_records) + duplicates_detected
        stages_log.append({
            "stage_number": 7,
            "stage_name": "Recording Clean Observations",
            "status": "COMPLETED",
            "details": f"Accepted {records_accepted} clean record(s); total rejected/discarded: {records_rejected}"
        })

        # Stage 8: Generating Provenance Hash
        provenance_hash = self.generate_provenance_hash(run_id, clean_records)
        for rec in clean_records:
            rec["provenance_hash"] = provenance_hash
            rec["run_id"] = run_id
            rec["observation_id"] = f"OBS-{run_id}-{rec['flight_identifier']}-{uuid.uuid4().hex[:4]}"

        stages_log.append({
            "stage_number": 8,
            "stage_name": "Generating Provenance Hash",
            "status": "COMPLETED",
            "details": f"Generated SHA-256 cryptographic audit hash: {provenance_hash[:16]}..."
        })

        scenario_note = f"Scenario {self._current_scenario['index']}: {self._current_scenario['label']}" if self._current_scenario else f"Acquisition demonstration run for route {route_code}"
        self._persist_run(
            run_id=run_id,
            route_code=route_code,
            advance_purchase_window=advance_purchase_window,
            observation_timestamp=now_iso,
            records_retrieved=records_retrieved,
            records_validated=records_validated,
            duplicates_detected=duplicates_detected,
            records_accepted=records_accepted,
            records_rejected=records_rejected,
            provenance_hash=provenance_hash,
            clean_records=clean_records,
            notes=scenario_note
        )

        stages_log.append({
            "stage_number": 9,
            "stage_name": "Ready for Index Processing",
            "status": "COMPLETED",
            "details": f"Observations stored in database and queued for Price Relatives (R_i) calculation"
        })

        return {
            "run_id": run_id,
            "source_id": self.source_id,
            "source_name": self.source_name,
            "source_type": self.source_type,
            "data_mode": "demonstration_acquisition",
            "route_code": route_code,
            "advance_purchase_window": advance_purchase_window,
            "departure_date": departure_date,
            "observation_timestamp": now_iso,
            "records_retrieved": records_retrieved,
            "records_validated": records_validated,
            "duplicates_detected": duplicates_detected,
            "records_accepted": records_accepted,
            "records_rejected": records_rejected,
            "validation_status": "PASSED" if records_accepted > 0 else "WARNING",
            "provenance_hash": provenance_hash,
            "scenario": self._current_scenario,
            "stages": stages_log,
            "accepted_observations": clean_records,
            "rejected_observations": rejected_records + duplicate_records
        }

    def _persist_run(
        self,
        run_id: str,
        route_code: str,
        advance_purchase_window: int,
        observation_timestamp: str,
        records_retrieved: int,
        records_validated: int,
        duplicates_detected: int,
        records_accepted: int,
        records_rejected: int,
        provenance_hash: str,
        clean_records: List[Dict[str, Any]],
        notes: str = ""
    ):
        """Persists run metadata and clean observations to SQLite."""
        try:
            with get_db_cursor() as cursor:
                cursor.execute("""
                    INSERT INTO airfare_acquisition_runs (
                        run_id, source_id, source_name, route_code,
                        advance_purchase_window, observation_timestamp,
                        records_retrieved, records_validated, duplicates_detected,
                        records_accepted, records_rejected, validation_status,
                        provenance_hash, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    run_id, self.source_id, self.source_name, route_code,
                    advance_purchase_window, observation_timestamp,
                    records_retrieved, records_validated, duplicates_detected,
                    records_accepted, records_rejected, "PASSED",
                    provenance_hash, notes or f"Acquisition demonstration run for route {route_code}"
                ))

                for obs in clean_records:
                    cursor.execute("""
                        INSERT INTO airfare_observations (
                            observation_id, run_id, origin, destination,
                            route_code, carrier, flight_identifier, departure_date,
                            observation_timestamp, advance_purchase_window,
                            fare_class, base_fare, taxes, total_fare,
                            currency, source, source_type, raw_record_identifier,
                            validation_status, duplicate_status, provenance_hash
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        obs["observation_id"], obs["run_id"], obs["origin"], obs["destination"],
                        obs["route_code"], obs["carrier"], obs["flight_identifier"], obs["departure_date"],
                        obs["observation_timestamp"], obs["advance_purchase_window"],
                        obs["fare_class"], obs["base_fare"], obs["taxes"], obs["total_fare"],
                        obs.get("currency", "INR"), obs["source"], obs["source_type"], obs["raw_record_identifier"],
                        obs["validation_status"], obs["duplicate_status"], obs["provenance_hash"]
                    ))
        except Exception as e:
            logger.error(f"Error persisting airfare acquisition run {run_id}: {e}")
            raise


# ---------------------------------------------------------------------------
# SCENARIO CYCLE COUNTER — persisted in SQLite meta table
# ---------------------------------------------------------------------------

def _ensure_meta_table():
    """Creates the lightweight meta table used to persist the scenario cycle counter."""
    with get_db_cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS acquisition_meta (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)


def _get_next_scenario_index() -> int:
    """
    Reads the current scenario index from DB, increments it (mod 5),
    persists it back, and returns the scenario index to use for THIS run.
    Thread-safe via the WAL-mode SQLite write serialization.
    """
    _ensure_meta_table()
    with get_db_cursor() as cursor:
        cursor.execute(
            "SELECT value FROM acquisition_meta WHERE key = 'demo_scenario_index'"
        )
        row = cursor.fetchone()
        current = int(row["value"]) if row else 0
        next_idx = (current + 1) % len(DEMO_SCENARIOS)
        cursor.execute(
            """INSERT INTO acquisition_meta (key, value) VALUES ('demo_scenario_index', ?)
               ON CONFLICT(key) DO UPDATE SET value = excluded.value""",
            (str(next_idx),)
        )
    return current


def _peek_scenario_index() -> int:
    """Returns the current (last-used) scenario index without incrementing."""
    _ensure_meta_table()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT value FROM acquisition_meta WHERE key = 'demo_scenario_index'"
    )
    row = cursor.fetchone()
    conn.close()
    return int(row["value"]) if row else 0


# ---------------------------------------------------------------------------
# DEMO CONNECTOR
# ---------------------------------------------------------------------------

class DemoAirlineConnector(BaseAirfareConnector):
    """
    Demonstration Airfare Connector for Indian Domestic Routes.

    Rotates through DEMO_SCENARIOS on each call, producing genuinely different:
      - Retrieved / invalid / duplicate / accepted counts
      - Fare levels (controlled via fare_multiplier × route base fare × window multiplier)

    Data honesty labels:
      source_type  = 'demonstration_connector'
      data_mode    = 'demonstration_acquisition'

    The UI must NEVER display 'LIVE FETCHED DATA' for this connector.
    """

    def __init__(self):
        super().__init__(
            source_id="demo_airfare_connector",
            source_name="Domestic Multi-Carrier Demonstration Engine",
            source_type="demonstration_connector",
            status="active",
            description=(
                "Controlled multi-scenario acquisition demonstration. "
                "Rotates through 5 deterministic market cycles to show genuine "
                "pipeline variation without uncontrolled randomness."
            ),
            rate_limit_per_minute=60,
            respects_robots_txt=True
        )
        self._current_scenario: Optional[Dict[str, Any]] = None

    def _get_route_base_fare(self, route_code: str) -> float:
        return ROUTE_BASE_FARES.get(route_code.upper(), ROUTE_BASE_FARES["DEFAULT"])

    def _compute_fare(
        self,
        route_code: str,
        advance_purchase_window: int,
        fare_factor: float,
        cycle_multiplier: float
    ) -> Tuple[float, float, float]:
        """
        Returns (base_fare, taxes, total_fare) using the deterministic pricing model:

          Final Demo Fare = Route Base Fare
                          × Advance Purchase Window Multiplier
                          × Acquisition Cycle Multiplier
                          × Carrier Fare Factor
        """
        route_base = self._get_route_base_fare(route_code)
        window_mult = WINDOW_MULTIPLIERS.get(advance_purchase_window, 1.18)
        base = round(route_base * window_mult * cycle_multiplier * fare_factor, 2)
        # Indian domestic GST: 5% economy, 12% business; + airport/UDF levy ₹480
        gst_rate = 0.12 if fare_factor >= 2.0 else 0.05  # business = high fare_factor
        taxes = round(base * gst_rate + 480.0, 2)
        total = round(base + taxes, 2)
        return base, taxes, total

    def retrieve_raw_records(
        self,
        route_code: str,
        advance_purchase_window: int,
        departure_date: str
    ) -> List[Dict[str, Any]]:
        """
        Builds the raw fare record set for this acquisition cycle.

        The scenario (scenario_index driven) determines:
          - How many core carrier records to include
          - How many invalid records to inject
          - How many duplicate records to inject
          - The fare_multiplier applied to all fares
        """
        # Consume the next scenario from the rotation counter
        scenario_index = _get_next_scenario_index()
        scenario = DEMO_SCENARIOS[scenario_index]
        # Store on self so execute_pipeline can attach scenario metadata to result
        self._current_scenario = scenario

        parts = route_code.split("-")
        origin = parts[0].upper() if len(parts) > 0 else "DEL"
        dest   = parts[1].upper() if len(parts) > 1 else "BOM"

        # Derive flight number seeds deterministically from route string
        route_hash = abs(hash(route_code))
        records: List[Dict[str, Any]] = []

        # --- Core carrier records ------------------------------------------
        # We always produce exactly 8 carrier records; the scenario then
        # specifies how many extra invalid and duplicate records to add on top.
        #
        # accepted = retrieved - invalid - duplicates
        # => core_records = accepted + duplicates   (before invalid injection)
        # => retrieved    = core_records + invalid  (total raw batch)
        #
        # We inject invalid records after core records, then inject duplicates
        # by repeating an existing core record.
        #
        # Core records produced = scenario["accepted"] (each with distinct flight & fare)
        n_core = scenario["accepted"]
        for i in range(n_core):
            spec = CARRIER_SPECS[i % len(CARRIER_SPECS)]
            num_offset = _FLIGHT_NUM_OFFSETS[i % len(_FLIGHT_NUM_OFFSETS)]
            flight_num = num_offset + (route_hash % 800) + (i * 10)
            flight_id  = spec["flight_tpl"].format(num=flight_num)

            # Individualize fare factor slightly per slot so each core record is unique
            varied_fare_factor = round(spec["fare_factor"] + (i * 0.018), 4)

            base, taxes, total = self._compute_fare(
                route_code, advance_purchase_window,
                varied_fare_factor, scenario["fare_multiplier"]
            )

            records.append({
                "origin":                  origin,
                "destination":             dest,
                "route_code":              route_code,
                "carrier":                 spec["carrier"],
                "flight_identifier":       flight_id,
                "departure_date":          departure_date,
                "advance_purchase_window": advance_purchase_window,
                "fare_class":              spec["fare_class"],
                "base_fare":               base,
                "taxes":                   taxes,
                "total_fare":              total,
                "currency":                "INR",
                "raw_id":                  f"raw_{uuid.uuid4().hex[:8]}",
                "_scenario_cycle":         scenario_index,
            })

        # --- Inject duplicates (exact copies of existing records) -----------
        n_dup = scenario["duplicates"]
        for d in range(n_dup):
            target = records[d % len(records)]
            dup = dict(target)
            dup["raw_id"] = f"raw_dup_{uuid.uuid4().hex[:8]}"
            records.append(dup)

        # --- Inject invalid records ------------------------------------------
        n_inv = scenario["invalid"]
        for k in range(n_inv):
            if k == 0:
                # Classic schema defect: missing flight_identifier + negative base fare
                records.append({
                    "origin":                  origin,
                    "destination":             dest,
                    "route_code":              route_code,
                    "carrier":                 "TestCarrier",
                    "flight_identifier":       "",        # Missing (violates validation)
                    "departure_date":          departure_date,
                    "advance_purchase_window": advance_purchase_window,
                    "fare_class":              "Economy",
                    "base_fare":               -1500.0,   # Negative fare (violates rule)
                    "taxes":                   300.0,
                    "total_fare":              -1200.0,
                    "currency":                "INR",
                    "raw_id":                  f"raw_inv_{uuid.uuid4().hex[:8]}",
                })
            else:
                # Secondary invalid: fare arithmetic mismatch
                records.append({
                    "origin":                  origin,
                    "destination":             dest,
                    "route_code":              route_code,
                    "carrier":                 "TestCarrier2",
                    "flight_identifier":       f"XX-{9000 + k}",
                    "departure_date":          departure_date,
                    "advance_purchase_window": advance_purchase_window,
                    "fare_class":              "Economy",
                    "base_fare":               2000.0,
                    "taxes":                   500.0,
                    "total_fare":              9999.0,    # Arithmetic mismatch
                    "currency":                "INR",
                    "raw_id":                  f"raw_inv2_{uuid.uuid4().hex[:8]}",
                })

        return records

    def execute_pipeline(
        self,
        route_code: str,
        advance_purchase_window: int = 15,
        departure_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Extends base execute_pipeline to attach scenario metadata."""
        result = super().execute_pipeline(
            route_code=route_code,
            advance_purchase_window=advance_purchase_window,
            departure_date=departure_date
        )
        # Attach current scenario info for UI display
        if self._current_scenario:
            result["scenario_index"] = self._current_scenario["index"]
            result["scenario_label"] = self._current_scenario["label"]
            result["scenario_note"] = self._current_scenario["note"]
            result["fare_multiplier"] = self._current_scenario["fare_multiplier"]
        return result


class PlannedIndiGoNDCConnector(BaseAirfareConnector):
    """Architecture stub for future direct IndiGo NDC API integration."""
    def __init__(self):
        super().__init__(
            source_id="indigo_direct_api",
            source_name="IndiGo Direct NDC API Feed",
            source_type="airline_direct_api",
            status="architecture_ready",
            description="IATA NDC XML/JSON feed integration for 6E corporate inventory.",
            rate_limit_per_minute=120,
            respects_robots_txt=True
        )

    def retrieve_raw_records(self, route_code: str, advance_purchase_window: int, departure_date: str) -> List[Dict[str, Any]]:
        raise NotImplementedError("IndiGo Direct NDC API requires institutional production API credentials.")


class PlannedAirIndiaAmadeusConnector(BaseAirfareConnector):
    """Architecture stub for future Air India Amadeus GDS Bridge."""
    def __init__(self):
        super().__init__(
            source_id="airindia_amadeus_ndc",
            source_name="Air India Amadeus GDS Bridge",
            source_type="gds_ndc_bridge",
            status="planned",
            description="Enterprise GDS integration adhering to IATA NDC 21.3 standard.",
            rate_limit_per_minute=200,
            respects_robots_txt=True
        )

    def retrieve_raw_records(self, route_code: str, advance_purchase_window: int, departure_date: str) -> List[Dict[str, Any]]:
        raise NotImplementedError("Air India Amadeus GDS Bridge is a planned connector.")


# Connector Registry
CONNECTOR_REGISTRY: Dict[str, BaseAirfareConnector] = {
    "demo_airfare_connector": DemoAirlineConnector(),
    "indigo_direct_api": PlannedIndiGoNDCConnector(),
    "airindia_amadeus_ndc": PlannedAirIndiaAmadeusConnector()
}


def get_available_connectors() -> List[Dict[str, Any]]:
    """Returns metadata for all available and planned airfare connectors."""
    return [
        {
            "source_id": conn.source_id,
            "source_name": conn.source_name,
            "source_type": conn.source_type,
            "status": conn.status,
            "description": conn.description,
            "rate_limit_per_minute": conn.rate_limit_per_minute,
            "respects_robots_txt": conn.respects_robots_txt
        }
        for conn in CONNECTOR_REGISTRY.values()
    ]


def run_airfare_pipeline(
    source_id: str = "demo_airfare_connector",
    route_code: str = "DEL-BOM",
    advance_purchase_window: int = 15,
    departure_date: Optional[str] = None
) -> Dict[str, Any]:
    """Runs the 9-stage acquisition pipeline using the selected connector."""
    connector = CONNECTOR_REGISTRY.get(source_id)
    if not connector:
        raise ValueError(f"Unknown connector source_id: '{source_id}'")
    if connector.status != "active":
        raise ValueError(f"Connector '{source_id}' is not currently active (status: {connector.status}).")

    return connector.execute_pipeline(
        route_code=route_code,
        advance_purchase_window=advance_purchase_window,
        departure_date=departure_date
    )


def get_acquisition_history(limit: int = 20) -> List[Dict[str, Any]]:
    """Fetches recent acquisition runs from SQLite database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT run_id, source_id, source_name, route_code,
               advance_purchase_window, observation_timestamp,
               records_retrieved, records_validated, duplicates_detected,
               records_accepted, records_rejected, validation_status,
               provenance_hash, notes
        FROM airfare_acquisition_runs
        ORDER BY observation_timestamp DESC
        LIMIT ?
    """, (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def get_clean_observations(
    route_code: Optional[str] = None,
    run_id: Optional[str] = None,
    carrier: Optional[str] = None,
    limit: int = 50
) -> List[Dict[str, Any]]:
    """Fetches clean, accepted observations from SQLite database."""
    conn = get_connection()
    cursor = conn.cursor()

    query = """
        SELECT observation_id, run_id, origin, destination, route_code,
               carrier, flight_identifier, departure_date, observation_timestamp,
               advance_purchase_window, fare_class, base_fare, taxes,
               total_fare, currency, source, source_type,
               validation_status, duplicate_status, provenance_hash
        FROM airfare_observations
        WHERE 1=1
    """
    params = []
    if route_code:
        query += " AND route_code = ?"
        params.append(route_code.upper())
    if run_id:
        query += " AND run_id = ?"
        params.append(run_id)
    if carrier:
        query += " AND carrier = ?"
        params.append(carrier)

    query += " ORDER BY observation_timestamp DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def compute_fare_summary(observations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes descriptive fare statistics for a list of clean observations.
    Used by the Previous vs Current Fetch Audit.
    """
    fares = [o["total_fare"] for o in observations if o.get("total_fare", 0) > 0]
    if not fares:
        return {"count": 0, "mean": None, "median": None, "min": None, "max": None}
    fares_sorted = sorted(fares)
    n = len(fares_sorted)
    mean_fare = round(sum(fares_sorted) / n, 2)
    if n % 2 == 1:
        median_fare = fares_sorted[n // 2]
    else:
        median_fare = round((fares_sorted[n // 2 - 1] + fares_sorted[n // 2]) / 2, 2)
    return {
        "count": n,
        "mean": mean_fare,
        "median": median_fare,
        "min": fares_sorted[0],
        "max": fares_sorted[-1],
    }


def get_previous_vs_current_audit(current_run_id: str) -> Dict[str, Any]:
    """
    Retrieves the previous acquisition run (the one immediately before current_run_id
    in the same database) and computes a meaningful comparison across pipeline metrics
    and fare statistics.

    Returns a structured audit dict for display in the Previous vs Current section.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Get current run metadata
    cursor.execute("""
        SELECT * FROM airfare_acquisition_runs WHERE run_id = ?
    """, (current_run_id,))
    current_run = cursor.fetchone()
    if not current_run:
        conn.close()
        return {"status": "no_current_run", "current_run_id": current_run_id}

    current_run = dict(current_run)

    # Get observations for current run
    cursor.execute(
        "SELECT total_fare FROM airfare_observations WHERE run_id = ?",
        (current_run_id,)
    )
    current_obs = [dict(r) for r in cursor.fetchall()]

    # Find the previous run (closest earlier timestamp, same route or any)
    cursor.execute("""
        SELECT * FROM airfare_acquisition_runs
        WHERE observation_timestamp < ?
        ORDER BY observation_timestamp DESC
        LIMIT 1
    """, (current_run["observation_timestamp"],))
    prev_run = cursor.fetchone()

    if not prev_run:
        conn.close()
        return {
            "status": "first_run",
            "has_previous": False,
            "current_run_id": current_run["run_id"],
            "previous_run_id": None,
            "status_label": "FIRST RUN",
            "overall_label": "FIRST RUN",
            "delta_records_retrieved": 0,
            "delta_records_accepted": 0,
            "delta_duplicates_detected": 0,
            "delta_records_rejected": 0,
            "pct_mean_fare_movement": 0.0,
            "message": "This is the first acquisition run. No previous run to compare against.",
            "current": _build_run_summary(current_run, current_obs),
            "current_stats": compute_fare_summary(current_obs),
            "previous_stats": None,
        }

    prev_run = dict(prev_run)

    # Get observations for previous run
    cursor.execute(
        "SELECT total_fare FROM airfare_observations WHERE run_id = ?",
        (prev_run["run_id"],)
    )
    prev_obs = [dict(r) for r in cursor.fetchall()]
    conn.close()

    # Compute fare summaries
    curr_summary = compute_fare_summary(current_obs)
    prev_summary = compute_fare_summary(prev_obs)

    # Build metric deltas
    def _delta(curr_val, prev_val, is_fare=False):
        if curr_val is None or prev_val is None:
            return {"change": None, "pct_change": None, "direction": "UNCHANGED"}
        diff = curr_val - prev_val
        pct = round((diff / prev_val * 100), 2) if prev_val != 0 else None
        if abs(diff) < (1.0 if is_fare else 0.5):
            direction = "UNCHANGED"
        elif diff > 0:
            direction = "INCREASED"
        else:
            direction = "DECREASED"
        return {
            "previous": prev_val,
            "current": curr_val,
            "change": round(diff, 2),
            "pct_change": pct,
            "direction": direction
        }

    # Pipeline metric comparisons
    pipeline_audit = {
        "records_retrieved":  _delta(current_run["records_retrieved"], prev_run["records_retrieved"]),
        "records_validated":  _delta(current_run["records_validated"], prev_run["records_validated"]),
        "duplicates_detected": _delta(current_run["duplicates_detected"], prev_run["duplicates_detected"]),
        "records_accepted":   _delta(current_run["records_accepted"], prev_run["records_accepted"]),
        "records_rejected":   _delta(current_run["records_rejected"], prev_run["records_rejected"]),
    }

    # Fare metric comparisons
    fare_audit = {
        "mean_fare":   _delta(curr_summary["mean"], prev_summary["mean"], is_fare=True),
        "median_fare": _delta(curr_summary["median"], prev_summary["median"], is_fare=True),
        "min_fare":    _delta(curr_summary["min"], prev_summary["min"], is_fare=True),
        "max_fare":    _delta(curr_summary["max"], prev_summary["max"], is_fare=True),
    }

    # Determine high-level label
    mean_dir = fare_audit["mean_fare"]["direction"]
    accepted_dir = pipeline_audit["records_accepted"]["direction"]
    if mean_dir == "INCREASED":
        overall_label = "FARE LEVEL INCREASED"
    elif mean_dir == "DECREASED":
        overall_label = "FARE LEVEL DECREASED"
    elif accepted_dir != "UNCHANGED":
        overall_label = "PIPELINE QUALITY CHANGED"
    else:
        overall_label = "NO MATERIAL CHANGE"

    return {
        "status": "comparison_available",
        "has_previous": True,
        "current_run_id": current_run["run_id"],
        "previous_run_id": prev_run["run_id"],
        "status_label": overall_label,
        "overall_label": overall_label,
        "delta_records_retrieved": pipeline_audit["records_retrieved"]["change"],
        "delta_records_accepted": pipeline_audit["records_accepted"]["change"],
        "delta_duplicates_detected": pipeline_audit["duplicates_detected"]["change"],
        "delta_records_rejected": pipeline_audit["records_rejected"]["change"],
        "pct_mean_fare_movement": fare_audit["mean_fare"]["pct_change"],
        "current_stats": curr_summary,
        "previous_stats": prev_summary,
        "previous_run": {
            "run_id": prev_run["run_id"],
            "observation_timestamp": prev_run["observation_timestamp"],
            "provenance_hash": prev_run["provenance_hash"],
        },
        "current_run": {
            "run_id": current_run["run_id"],
            "observation_timestamp": current_run["observation_timestamp"],
            "provenance_hash": current_run["provenance_hash"],
        },
        "pipeline_audit": pipeline_audit,
        "fare_audit": fare_audit,
        "current_fare_summary": curr_summary,
        "previous_fare_summary": prev_summary,
    }


def _build_run_summary(run: Dict[str, Any], observations: List[Dict[str, Any]]) -> Dict[str, Any]:
    fare_summary = compute_fare_summary(observations)
    return {
        "run_id": run["run_id"],
        "observation_timestamp": run["observation_timestamp"],
        "records_retrieved": run["records_retrieved"],
        "records_accepted": run["records_accepted"],
        "duplicates_detected": run["duplicates_detected"],
        "fare_summary": fare_summary,
        "provenance_hash": run["provenance_hash"],
    }
