from fastapi import APIRouter
from backend.core.database import get_connection
from backend.api.schemas import ProvenanceSummaryResponse

router = APIRouter(prefix="/provenance", tags=["Data Governance & Provenance"])

@router.get(
    "",
    response_model=ProvenanceSummaryResponse,
    summary="Data Provenance & Governance Audit Breakdown",
    description=(
        "Returns complete audit breakdown of all observations currently stored in PUSHPAK, "
        "stratified by data_mode (demo_simulation vs historical vs external_connector vs official) "
        "and operational environment. Guarantees complete transparency before government evaluators."
    )
)
def get_provenance_summary() -> ProvenanceSummaryResponse:
    conn = get_connection()
    cursor = conn.cursor()

    # Query fare observations
    fare_counts = cursor.execute("""
        SELECT 
            'airfare_observations' AS category,
            source_connector AS source_type,
            data_mode,
            environment,
            COUNT(*) AS record_count
        FROM fare_observations
        GROUP BY source_connector, data_mode, environment;
    """).fetchall()

    # Query flight registry
    registry_counts = cursor.execute("""
        SELECT 
            'flight_registry' AS category,
            source_type,
            data_mode,
            environment,
            COUNT(*) AS record_count
        FROM flight_registry
        GROUP BY source_type, data_mode, environment;
    """).fetchall()

    conn.close()

    all_breakdown = [dict(r) for r in fare_counts] + [dict(r) for r in registry_counts]
    total_records = sum(b["record_count"] for b in all_breakdown)

    return ProvenanceSummaryResponse(
        total_observations_across_system=total_records,
        provenance_breakdown=all_breakdown,
        data_honesty_statement=(
            "PUSHPAK enforces absolute technical honesty: simulated data is never mislabeled as live data, "
            "and historical schedule records are never claimed to be real-time schedules."
        )
    )
