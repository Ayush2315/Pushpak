from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from backend.core.database import get_connection
from backend.api.schemas import HealthResponse

router = APIRouter(tags=["System Health"])

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="System Health & Database Connectivity",
    description="Returns real-time service health, active environment, and SQLite WAL database connectivity status."
)
def get_health() -> HealthResponse:
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1;")
        wal_status = cursor.execute("PRAGMA journal_mode;").fetchone()[0]
        conn.close()
        db_status = "connected"
        db_mode = f"{wal_status.upper()} Mode Active"
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connectivity check failed: {str(e)}"
        )

    return HealthResponse(
        status="healthy",
        service="PUSHPAK Civil Aviation Intelligence Platform",
        database=db_status,
        database_mode=db_mode,
        environment="development",
        timestamp=datetime.now(timezone.utc)
    )
