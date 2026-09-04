from fastapi import APIRouter
from backend.api.routes.health import router as health_router
from backend.api.routes.flights import router as flights_router
from backend.api.routes.routes import router as routes_router
from backend.api.routes.analytics import router as analytics_router
from backend.api.routes.fares import router as fares_router
from backend.api.routes.provenance import router as provenance_router
from backend.api.routes.intelligence import router as intelligence_router
from backend.api.routes.policy import router as policy_router
from backend.api.routes.index import router as index_router

api_v1_router = APIRouter(prefix="/api/v1")

# Include sub-routers under /api/v1
api_v1_router.include_router(health_router)
api_v1_router.include_router(flights_router)
api_v1_router.include_router(routes_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(fares_router)
api_v1_router.include_router(provenance_router)
api_v1_router.include_router(intelligence_router)
api_v1_router.include_router(policy_router)
api_v1_router.include_router(index_router)

__all__ = ["api_v1_router"]

