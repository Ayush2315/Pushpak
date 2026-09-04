import hashlib
import random
from typing import List, Dict, Any
from backend.ingestion.base import BaseConnector
from backend.models.observation import DataMode, Environment, CabinClass
from backend.core.config import OPERATING_AIRLINES

# Baseline route distance factors (approximate nautical/km scaling)
ROUTE_BASELINES = {
    "DEL-BOM": {"base_min": 4200.0, "base_max": 5200.0, "flight_prefix": "10"},
    "DEL-BLR": {"base_min": 5100.0, "base_max": 6400.0, "flight_prefix": "20"},
    "BOM-BLR": {"base_min": 3800.0, "base_max": 4800.0, "flight_prefix": "30"},
}

# Empirical Indian domestic yield surge curve relative to lead time
LEAD_TIME_SURGE = {
    "T+45": 0.95,   # Early bird promotional tier
    "T+30": 1.00,   # Baseline advance fare
    "T+15": 1.20,   # Moderate demand tier
    "T+7":  1.45,   # High demand business booking tier
    "T+1":  1.90,   # Last-minute walk-up surge
}

class MockDemoConnector(BaseConnector):
    """
    REQUIRED Primary Source for the prototype.
    Generates deterministic, mathematically grounded domestic airfare observations
    reflecting real Indian airline yield curves across advance booking windows.
    Zero network dependencies, 100% offline-ready.
    """

    def __init__(self):
        super().__init__(
            connector_name="mock_demo_engine",
            data_mode=DataMode.DEMO_SIMULATION,
            environment=Environment.OFFLINE,
        )

    def health_check(self) -> bool:
        """Always healthy since it requires no network or credentials."""
        return True

    def fetch_fares(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        lead_time_bucket: str,
        lead_time_days: int
    ) -> List[Dict[str, Any]]:
        route_code = f"{origin.upper()}-{destination.upper()}"
        baseline = ROUTE_BASELINES.get(route_code, {"base_min": 4500.0, "base_max": 5500.0, "flight_prefix": "90"})
        surge_multiplier = LEAD_TIME_SURGE.get(lead_time_bucket, 1.0)

        observations: List[Dict[str, Any]] = []

        # Generate observations for each major operating airline
        for idx, airline in enumerate(OPERATING_AIRLINES):
            # Seed PRNG deterministically per (route, date, airline, bucket)
            seed_string = f"{route_code}-{departure_date}-{airline['code']}-{lead_time_bucket}"
            seed_val = int(hashlib.md5(seed_string.encode("utf-8")).hexdigest(), 16) % 1000000
            rng = random.Random(seed_val)

            # Airline pricing variation (e.g. Full-service AI vs LCC 6E/SG)
            carrier_factor = 1.08 if airline["code"] == "AI" else (0.98 if airline["code"] == "SG" else 1.00)
            
            raw_base = rng.uniform(baseline["base_min"], baseline["base_max"])
            base_fare = round(raw_base * surge_multiplier * carrier_factor, 2)
            
            # Realistic taxes and fees (UDF + ASF + GST in India)
            taxes_fees = round(rng.uniform(850.0, 1250.0), 2)
            total_fare = round(base_fare + taxes_fees, 2)

            flight_num = f"{airline['code']}-{baseline['flight_prefix']}{idx + 1}"
            obs_id = f"OBS-{hashlib.sha256(seed_string.encode('utf-8')).hexdigest()[:12].upper()}"

            raw_payload = {
                "source": "deterministic_yield_model",
                "route": route_code,
                "airline": airline["code"],
                "departure_date": departure_date,
                "lead_bucket": lead_time_bucket,
                "lead_days": lead_time_days,
                "base_fare": base_fare,
                "taxes": taxes_fees,
            }

            observation = {
                "observation_id": obs_id,
                "source_connector": self.connector_name,
                "data_mode": self.data_mode.value,
                "environment": self.environment.value,
                "origin": origin.upper(),
                "destination": destination.upper(),
                "route_code": route_code,
                "airline_code": airline["code"],
                "airline_name": airline["name"],
                "flight_number": flight_num,
                "departure_date": departure_date,
                "lead_time_days": lead_time_days,
                "lead_time_bucket": lead_time_bucket,
                "cabin_class": CabinClass.ECONOMY.value,
                "base_fare": base_fare,
                "taxes_fees": taxes_fees,
                "total_fare": total_fare,
                "source_hash": self.generate_source_hash(raw_payload),
                "confidence_score": 0.85,  # Transparent confidence score for simulation
            }
            observations.append(observation)

        return observations
