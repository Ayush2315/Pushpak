import hashlib
from typing import List, Dict, Any
import httpx
from backend.ingestion.base import BaseConnector
from backend.models.observation import DataMode, Environment, CabinClass
from backend.core.config import SANDBOX_API_BASE_URL, SANDBOX_API_KEY
from backend.core.logger import logger

class SandboxApiConnector(BaseConnector):
    """
    OPTIONAL BONUS Connector.
    Connects to a permitted public/sandbox travel API when configured.
    Gracefully yields empty results if credentials, internet, or endpoints are unavailable.
    NEVER blocks pipeline execution.
    """

    def __init__(self):
        super().__init__(
            connector_name="sandbox_travel_api",
            data_mode=DataMode.EXTERNAL_CONNECTOR,
            environment=Environment.SANDBOX,
        )
        self.api_key = SANDBOX_API_KEY
        self.base_url = SANDBOX_API_BASE_URL

    def health_check(self) -> bool:
        """Checks if sandbox credentials and base URL are configured."""
        if not self.api_key or not self.base_url:
            logger.info("SandboxApiConnector: No API credentials configured. Skipping optional external connector.")
            return False
        try:
            with httpx.Client(timeout=3.0) as client:
                res = client.get(f"{self.base_url}/health", headers={"Authorization": f"Bearer {self.api_key}"})
                return res.status_code == 200
        except Exception as e:
            logger.info(f"SandboxApiConnector health check failed ({e}). Operating in offline-safe mode.")
            return False

    def fetch_fares(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        lead_time_bucket: str,
        lead_time_days: int
    ) -> List[Dict[str, Any]]:
        if not self.api_key or not self.base_url:
            return []

        route_code = f"{origin.upper()}-{destination.upper()}"
        params = {
            "origin": origin,
            "destination": destination,
            "departureDate": departure_date,
            "currency": "INR",
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}

        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(f"{self.base_url}/v1/fares", params=params, headers=headers)
                if response.status_code != 200:
                    logger.warning(f"Sandbox API returned HTTP {response.status_code}. Yielding empty list.")
                    return []
                
                raw_data = response.json()
                results: List[Dict[str, Any]] = []

                for item in raw_data.get("fares", []):
                    obs_id = f"EXT-{hashlib.sha256(str(item).encode()).hexdigest()[:12].upper()}"
                    base = float(item.get("baseFare", 0.0))
                    taxes = float(item.get("taxes", 0.0))
                    total = float(item.get("totalFare", base + taxes))

                    results.append({
                        "observation_id": obs_id,
                        "source_connector": self.connector_name,
                        "data_mode": self.data_mode.value,
                        "environment": self.environment.value,
                        "origin": origin.upper(),
                        "destination": destination.upper(),
                        "route_code": route_code,
                        "airline_code": item.get("airlineCode", "XX"),
                        "airline_name": item.get("airlineName", "Airline"),
                        "flight_number": item.get("flightNumber"),
                        "departure_date": departure_date,
                        "lead_time_days": lead_time_days,
                        "lead_time_bucket": lead_time_bucket,
                        "cabin_class": CabinClass.ECONOMY.value,
                        "base_fare": base,
                        "taxes_fees": taxes,
                        "total_fare": total,
                        "source_hash": self.generate_source_hash(item),
                        "confidence_score": 0.95,
                    })
                return results
        except Exception as e:
            logger.warning(f"SandboxApiConnector encountered error ({e}). Gracefully continuing.")
            return []
