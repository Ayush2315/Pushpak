from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.api.schemas import (
    RoutePolicyAssessment,
    NetworkPolicyOverview,
    PolicyFlagsResponse,
    ErrorResponse,
)
from backend.analytics.policy_intelligence import (
    get_route_policy_assessment,
    get_network_policy_overview,
    get_all_policy_flags,
)

router = APIRouter(prefix="/policy", tags=["Decision Support & Policy Intelligence"])

@router.get(
    "/routes/{route_code}",
    response_model=RoutePolicyAssessment,
    responses={
        404: {"model": ErrorResponse, "description": "No fare observations or policy data for route"}
    },
    summary="Corridor Policy Assessment & Priority Classification",
    description=(
        "Returns comprehensive decision-support dossier for an air corridor, including explainable "
        "priority classification (HIGH_ATTENTION, MONITOR, LOW_ATTENTION), volatility metrics, "
        "advance walk-up premiums, competition indicators, and quantitative policy flags.\n\n"
        "**Legal Notice**: Classifications are analytical evaluation heuristics, not statutory government regulations."
    )
)
def get_route_policy_assessment_endpoint(route_code: str) -> RoutePolicyAssessment:
    norm_route = route_code.upper().strip()
    result = get_route_policy_assessment(norm_route)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Route policy assessment for '{norm_route}' was not found in the platform. "
                   f"Corridors currently possessing recorded fare data: DEL-BOM, DEL-BLR, BOM-BLR."
        )
    return RoutePolicyAssessment(**result)


@router.get(
    "/network",
    response_model=NetworkPolicyOverview,
    summary="Network-Wide Policy Decision-Support Overview",
    description=(
        "Returns macro-level policy indicators across all monitored corridors: priority distribution, "
        "highest volatility corridors, severe advance purchase surge corridors, and active flag totals."
    )
)
def get_network_policy_overview_endpoint() -> NetworkPolicyOverview:
    overview = get_network_policy_overview()
    return NetworkPolicyOverview(**overview)


@router.get(
    "/flags",
    response_model=PolicyFlagsResponse,
    summary="Query Active Policy Flags Across Network",
    description=(
        "Returns quantitative, numbers-traceable policy flags (e.g. HIGH_VOLATILITY, HIGH_WALKUP_PREMIUM, "
        "LIMITED_OBSERVED_COMPETITION, SIGNIFICANT_PRICE_SPREAD). Supports filtering by severity (HIGH, MEDIUM) "
        "and route code."
    )
)
def get_policy_flags_endpoint(
    severity: Optional[str] = Query(None, description="Filter by severity: HIGH, MEDIUM, LOW, INFO"),
    route_code: Optional[str] = Query(None, description="Filter by IATA route corridor (e.g. DEL-BOM)")
) -> PolicyFlagsResponse:
    norm_route = route_code.upper().strip() if route_code else None
    norm_sev = severity.upper().strip() if severity else None
    flags = get_all_policy_flags(severity=norm_sev, route_code=norm_route)

    return PolicyFlagsResponse(
        total_flags=len(flags),
        filters_applied={
            "severity": norm_sev,
            "route_code": norm_route
        },
        flags=flags
    )
