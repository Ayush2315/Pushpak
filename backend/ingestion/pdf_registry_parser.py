import argparse
import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

from pypdf import PdfReader
from backend.core.config import DATA_DIR, DB_PATH
from backend.core.database import init_db, get_db_cursor
from backend.core.logger import logger
from backend.models.registry import FlightRecord

DEFAULT_PDF_PATH = DATA_DIR / "flightsdata.pdf"
SEED_FALLBACK_PATH = DATA_DIR / "seeds" / "flight_registry_seed.json"

INSERT_REGISTRY_SQL = """
INSERT OR REPLACE INTO flight_registry (
    flight_id, row_index, airline, flight_number, source_city, origin_code,
    destination_city, destination_code, route_code, departure_time,
    stops, arrival_time, class_type, duration_hours,
    data_mode, environment, source_type
) VALUES (
    :flight_id, :row_index, :airline, :flight_number, :source_city, :origin_code,
    :destination_city, :destination_code, :route_code, :departure_time,
    :stops, :arrival_time, :class_type, :duration_hours,
    :data_mode, :environment, :source_type
);
"""

# High-precision regex matching dataset tokens (Group 1 = row index)
LINE_REGEX = re.compile(
    r'^\s*(\d+)\s+([A-Za-z_]+)\s+([A-Z0-9_-]+)\s+([A-Za-z]+)\s*(Early_Morning|Morning|Afternoon|Evening|Night|Late_Night)\s*(zero|one|two_or_more)\s*(Early_Morning|Morning|Afternoon|Evening|Night|Late_Night)\s*([A-Za-z]+)\s+(Economy|Business)\s+(\d+\.?\d*)'
)

def parse_pdf_records(pdf_path: Path, max_records: int = 50000) -> List[Dict[str, Any]]:
    """
    Parses structured tabular domestic flight records from flightsdata.pdf using regex.
    Preserves original categorical time slots (Early_Morning, Morning, etc.) without fabricating timestamps.
    Stops when target count (~47,000 - 50,000) is reached.
    """
    logger.info(f"Opening PDF document: {pdf_path}")
    reader = PdfReader(str(pdf_path))
    total_pages = len(reader.pages)
    logger.info(f"Total pages in PDF: {total_pages}. Target records: ~{max_records}.")

    raw_records: List[Dict[str, Any]] = []

    for page_idx, page in enumerate(reader.pages):
        if len(raw_records) >= max_records:
            logger.info(f"Reached target threshold ({len(raw_records)} records). Halting extraction.")
            break

        text = page.extract_text()
        if not text:
            continue

        for line in text.splitlines():
            m = LINE_REGEX.search(line)
            if m:
                row_idx_str, airline_val, flight_val, source_val, dep_val, stops_val, arr_val, dest_val, class_val, duration_val = m.groups()
                raw_records.append({
                    "row_index": int(row_idx_str),
                    "airline": airline_val,
                    "flight": flight_val,
                    "source_city": source_val,
                    "departure_time": dep_val,
                    "stops": stops_val,
                    "arrival_time": arr_val,
                    "destination_city": dest_val,
                    "class": class_val,
                    "duration": float(duration_val),
                })
                if len(raw_records) >= max_records:
                    break

        if (page_idx + 1) % 100 == 0 or (page_idx + 1) == total_pages:
            logger.info(f"Progress: Processed {page_idx + 1} pages | Extracted {len(raw_records)} records...")

    logger.info(f"Finished PDF extraction. Extracted {len(raw_records)} structured records from {pdf_path}.")
    return raw_records

def load_seed_fallback(seed_path: Path) -> List[Dict[str, Any]]:
    """Loads deterministic offline fallback flight registry dataset."""
    logger.info(f"Loading deterministic seed fallback dataset from {seed_path}...")
    with open(seed_path, "r", encoding="utf-8") as f:
        records = json.load(f)
    logger.info(f"Loaded {len(records)} seed fallback records.")
    return records

def ingest_flight_registry(
    pdf_path: Optional[Path] = None,
    force_fallback: bool = False,
    reset_registry: bool = False,
    max_records: int = 50000
) -> Dict[str, Any]:
    """
    Ingests and indexes flight records into SQLite pushpak.db.
    Real PDF records are tagged as 'historical' / 'pdf_dataset'.
    Fallback seed records are tagged as 'demo_simulation' / 'seed_fallback'.
    """
    init_db()

    target_pdf = pdf_path or DEFAULT_PDF_PATH
    is_real_pdf = False
    raw_data: List[Dict[str, Any]] = []

    if reset_registry:
        logger.info("Resetting flight_registry table as requested (--reset)...")
        with get_db_cursor() as cursor:
            cursor.execute("DELETE FROM flight_registry;")

    if not force_fallback and target_pdf.exists():
        try:
            logger.info(f"Detected flightsdata.pdf at {target_pdf}. Processing real dataset...")
            raw_data = parse_pdf_records(target_pdf, max_records=max_records)
            if raw_data:
                is_real_pdf = True
            else:
                logger.warning("PDF extraction returned 0 records. Switching to seed fallback.")
        except Exception as e:
            logger.error(f"Error reading PDF ({e}). Engaging deterministic seed fallback.")

    if not is_real_pdf:
        logger.info("Operating with deterministic seed fallback (Real PDF unavailable or bypassed).")
        raw_data = load_seed_fallback(SEED_FALLBACK_PATH)

    # Validate and normalize through Pydantic
    source_type = "pdf_dataset" if is_real_pdf else "seed_fallback"
    logger.info(f"Validating {len(raw_data)} records into FlightRecord models (source: {source_type})...")

    # Batch insert in chunks of 5000 records
    chunk_size = 5000
    total_inserted = 0

    for i in range(0, len(raw_data), chunk_size):
        chunk = raw_data[i : i + chunk_size]
        validated_chunk: List[Dict[str, Any]] = []
        for idx_in_chunk, item in enumerate(chunk):
            r_idx = item.get("row_index", i + idx_in_chunk)
            record = FlightRecord.create_from_raw(
                airline=item["airline"],
                flight=item["flight"],
                source_city=item["source_city"],
                departure_time=item["departure_time"],
                stops=item["stops"],
                arrival_time=item["arrival_time"],
                destination_city=item["destination_city"],
                class_name=item["class"],
                duration=float(item["duration"]),
                row_index=r_idx,
                is_real_pdf=is_real_pdf
            )
            validated_chunk.append(record.to_sqlite_dict())

        with get_db_cursor() as cursor:
            cursor.executemany(INSERT_REGISTRY_SQL, validated_chunk)
        total_inserted += len(validated_chunk)

    logger.info(f"Successfully persisted {total_inserted} records into SQLite flight_registry.")

    # Query metrics from database
    with get_db_cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM flight_registry;")
        total_records = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT route_code) FROM flight_registry;")
        total_routes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT airline) FROM flight_registry;")
        total_airlines = cursor.fetchone()[0]

        cursor.execute("SELECT source_type, data_mode, COUNT(*) FROM flight_registry GROUP BY source_type, data_mode;")
        mode_counts = cursor.fetchall()

    summary = {
        "status": "SUCCESS",
        "source_type": source_type,
        "is_real_pdf": is_real_pdf,
        "records_ingested_this_run": total_inserted,
        "total_records_in_db": total_records,
        "distinct_routes_indexed": total_routes,
        "distinct_airlines_indexed": total_airlines,
        "provenance_breakdown": [dict(r) for r in mode_counts],
    }

    print("\n" + "=" * 68)
    print("            PUSHPAK CIVIL AVIATION INTELLIGENCE PLATFORM            ")
    print("             MILESTONE 0B FLIGHT REGISTRY INGESTION REPORT          ")
    print("=" * 68)
    print(f" Status:                     {summary['status']}")
    print(f" Source Type:                {summary['source_type']} ({'Real PDF Dataset' if is_real_pdf else 'Deterministic Seed Fallback'})")
    print(f" Records Ingested:           {summary['records_ingested_this_run']}")
    print(f" Total Records in Registry:  {summary['total_records_in_db']}")
    print(f" Distinct Routes Indexed:    {summary['distinct_routes_indexed']}")
    print(f" Operating Airlines Indexed: {summary['distinct_airlines_indexed']}")
    print("-" * 68)
    print(" Metric Clarification:")
    print("  • Counts represent OBSERVED DATASET RECORDS, NOT confirmed daily flight frequencies.")
    print("  • Departure/arrival times are preserved as CATEGORICAL SLOTS (no exact times fabricated).")
    print("-" * 68)
    print(" Provenance Breakdown:")
    for row in summary["provenance_breakdown"]:
        print(f"  • Source: {row['source_type']:<15} | Mode: {row['data_mode']:<16} | Count: {row['COUNT(*)']}")
    print("=" * 68 + "\n")

    return summary

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PUSHPAK Flight Registry Ingestion Runner")
    parser.add_argument("--pdf", type=str, help="Path to flightsdata.pdf")
    parser.add_argument("--seed-only", action="store_true", help="Force fallback to seed dataset")
    parser.add_argument("--reset", action="store_true", help="Clear flight_registry before ingesting")
    parser.add_argument("--max-records", type=int, default=50000, help="Maximum records to parse from PDF (default: 50000)")
    args = parser.parse_args()

    custom_pdf = Path(args.pdf) if args.pdf else None
    ingest_flight_registry(
        pdf_path=custom_pdf,
        force_fallback=args.seed_only,
        reset_registry=args.reset,
        max_records=args.max_records
    )
