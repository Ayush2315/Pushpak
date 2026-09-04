import hashlib
import json
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from backend.models.observation import DataMode, Environment

class BaseConnector(ABC):
    """Abstract base connector for all PUSHPAK airfare data sources."""

    def __init__(self, connector_name: str, data_mode: DataMode, environment: Environment):
        self.connector_name = connector_name
        self.data_mode = data_mode
        self.environment = environment

    @abstractmethod
    def health_check(self) -> bool:
        """Returns True if the connector is operational and credentials are valid."""
        pass

    @abstractmethod
    def fetch_fares(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        lead_time_bucket: str,
        lead_time_days: int
    ) -> List[Dict[str, Any]]:
        """
        Fetches raw airfare observations for the given route and lead time.
        Must return a list of dictionaries compatible with FareObservation.
        """
        pass

    @staticmethod
    def generate_source_hash(payload: Any) -> str:
        """Computes a deterministic SHA-256 hash prefix of the input payload."""
        if isinstance(payload, (dict, list)):
            raw_str = json.dumps(payload, sort_keys=True)
        else:
            raw_str = str(payload)
        return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()[:16]
