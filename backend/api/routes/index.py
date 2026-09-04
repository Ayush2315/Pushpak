from typing import Optional
from fastapi import APIRouter, Query
from backend.api.schemas import (
    PriceIndexResponse,
    PriceIndexSummaryResponse,
    PriceIndexMethodologyResponse,
)
from backend.analytics.price_index import (
    get_headline_index,
    get_core_index,
    get_index_summary,
    get_index_methodology,
)

router = APIRouter(prefix="/index", tags=["Airfare Price Index Engine"])


@router.get(
    "/headline",
    response_model=PriceIndexResponse,
    summary="PUSHPAK Headline Airfare Price Index",
    description=(
        "Returns the PUSHPAK Headline Price Index (Base = 100.00), tracking overall domestic airfare "
        "movement across all representative corridors and all advance booking horizons (T+1 to T+45). "
        "Captures full dynamic yield management, walk-up surge pricing, and seasonal shifts.\n\n"
        "**Transparency Notice**: Prototype analytical index; not an official MoSPI/Government of India CPI series."
    )
)
def get_headline_index_endpoint(
    weighting_method: str = Query(
        "observed_records",
        description="Weighting methodology: 'observed_records' (registry volume) or 'equal_weights'"
    )
) -> PriceIndexResponse:
    method = weighting_method.lower().strip()
    if method not in ["observed_records", "equal_weights"]:
        method = "observed_records"
    data = get_headline_index(weighting_method=method)
    return PriceIndexResponse(**data)


@router.get(
    "/core",
    response_model=PriceIndexResponse,
    summary="PUSHPAK Core Airfare Price Index",
    description=(
        "Returns the PUSHPAK Core Price Index (Base = 100.00), which isolates underlying structural airfare "
        "capacity pricing by measuring medium-to-long advance horizons (T+15, T+30, T+45) and explicitly "
        "filtering out high-volatility short-term walk-up surge pricing (T+1 and T+7). "
        "Directly analogous to Core CPI excluding volatile food and energy items.\n\n"
        "**Transparency Notice**: Prototype analytical index; not an official MoSPI/Government of India CPI series."
    )
)
def get_core_index_endpoint(
    weighting_method: str = Query(
        "observed_records",
        description="Weighting methodology: 'observed_records' (registry volume) or 'equal_weights'"
    )
) -> PriceIndexResponse:
    method = weighting_method.lower().strip()
    if method not in ["observed_records", "equal_weights"]:
        method = "observed_records"
    data = get_core_index(weighting_method=method)
    return PriceIndexResponse(**data)


@router.get(
    "/summary",
    response_model=PriceIndexSummaryResponse,
    summary="Comprehensive Price Index Suite Summary & Surge Spread",
    description=(
        "Provides a side-by-side executive comparison of PUSHPAK Headline vs PUSHPAK Core indices, "
        "quantifying the Walk-Up Surge Spread (index point premium and percentage markup) with "
        "economic interpretation and data provenance."
    )
)
def get_index_summary_endpoint(
    weighting_method: str = Query(
        "observed_records",
        description="Weighting methodology: 'observed_records' or 'equal_weights'"
    )
) -> PriceIndexSummaryResponse:
    method = weighting_method.lower().strip()
    if method not in ["observed_records", "equal_weights"]:
        method = "observed_records"
    data = get_index_summary(weighting_method=method)
    return PriceIndexSummaryResponse(**data)


@router.get(
    "/methodology",
    response_model=PriceIndexMethodologyResponse,
    summary="Transparent Index Calculation Methodology & CPI Alignment",
    description=(
        "Returns complete, auditable methodology specifications for the PUSHPAK Price Index Suite: "
        "base period convention, formulas, weighting strategies, limitations, and statutory non-regulatory disclaimers."
    )
)
def get_index_methodology_endpoint() -> PriceIndexMethodologyResponse:
    data = get_index_methodology()
    return PriceIndexMethodologyResponse(**data)
