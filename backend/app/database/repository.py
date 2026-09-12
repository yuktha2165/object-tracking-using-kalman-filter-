from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseRepository(ABC):
    @abstractmethod
    async def create_session(self, session_data: Dict[str, Any]) -> str:
        """Store a new analysis session."""
        pass

    @abstractmethod
    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> bool:
        """Update an existing analysis session."""
        pass

    @abstractmethod
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a single session by session_id."""
        pass

    @abstractmethod
    async def list_sessions(self) -> List[Dict[str, Any]]:
        """List all completed/active analysis sessions."""
        pass

    @abstractmethod
    async def save_vehicles(self, session_id: str, vehicles: List[Dict[str, Any]]) -> bool:
        """Save tracked vehicles for a session."""
        pass

    @abstractmethod
    async def get_vehicles(self, session_id: str) -> List[Dict[str, Any]]:
        """Retrieve tracked vehicles for a session."""
        pass

    @abstractmethod
    async def save_events(self, session_id: str, events: List[Dict[str, Any]]) -> bool:
        """Save traffic alerts/events for a session."""
        pass

    @abstractmethod
    async def get_events(self, session_id: str) -> List[Dict[str, Any]]:
        """Retrieve traffic events for a session."""
        pass

    @abstractmethod
    async def save_analytics(self, session_id: str, analytics: Dict[str, Any]) -> bool:
        """Save time-series analytics for a session."""
        pass

    @abstractmethod
    async def get_analytics(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve time-series analytics for a session."""
        pass

    @abstractmethod
    async def delete_session(self, session_id: str) -> bool:
        """Delete session and associated data."""
        pass
