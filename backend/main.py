from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.database import init_db
from backend.core.logger import logger
from backend.api.routes import api_v1_router
from backend.api.routes.health import router as root_health_router
from backend.api.schemas import ErrorResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQLite database and tables upon server startup."""
    logger.info("Starting PUSHPAK Civil Aviation Intelligence Platform API...")
    init_db()
    yield
    logger.info("Shutting down PUSHPAK API.")

app = FastAPI(
    title="PUSHPAK Civil Aviation Intelligence API",
    description=(
        "Government-oriented Civil Aviation Intelligence and Airfare Transparency Platform for India. "
        "Engineered for high-frequency domestic airfare price index computation, route network analysis, "
        "lead-time pricing intelligence, and seamless integration with MoSPI / DGCA statistical frameworks.\n\n"
        "**Strict Data Honesty Policy**: Simulated data is never labeled as live market data, "
        "and historical flight records represent dataset observations rather than active ATC schedules."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS configuration for React/Vite local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"  # Open during hackathon prototype development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global custom error handler for standardized government error payloads
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    error_payload = ErrorResponse(
        error=exc.__class__.__name__,
        message=str(exc.detail),
        status_code=exc.status_code,
        timestamp=datetime.now(timezone.utc)
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=error_payload.model_dump(mode="json")
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_messages = []
    for err in exc.errors():
        loc = ".".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "Validation error")
        error_messages.append(f"{loc}: {msg}" if loc else msg)
    
    error_payload = ErrorResponse(
        error="ValidationError",
        message="; ".join(error_messages),
        status_code=422,
        timestamp=datetime.now(timezone.utc)
    )
    return JSONResponse(
        status_code=422,
        content=error_payload.model_dump(mode="json")
    )

# Root level health endpoint (convenience alias for load balancers)
app.include_router(root_health_router)

# Versioned API Router (/api/v1)
app.include_router(api_v1_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
