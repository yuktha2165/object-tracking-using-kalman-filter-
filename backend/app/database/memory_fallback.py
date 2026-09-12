import json
import os
import asyncio
from typing import Dict, Any, List, Optional
from app.database.repository import BaseRepository
from app.config import settings

class MemoryFallbackRepository(BaseRepository):
    def __init__(self, storage_file: Optional[str] = None):
        self.storage_file = storage_file or os.path.join(settings.BASE_DIR, "data_store.json")
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._vehicles: Dict[str, List[Dict[str, Any]]] = {}
        self._events: Dict[str, List[Dict[str, Any]]] = {}
        self._analytics: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        self._load_from_disk()

    def _load_from_disk(self):
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, "r") as f:
                    data = json.load(f)
                    self._sessions = data.get("sessions", {})
                    self._vehicles = data.get("vehicles", {})
                    self._events = data.get("events", {})
                    self._analytics = data.get("analytics", {})
            except Exception as e:
                print(f"[MemoryFallbackRepository] Warning: Could not load data_store.json: {e}")

    def _save_to_disk(self):
        try:
            with open(self.storage_file, "w") as f:
                json.dump({
                    "sessions": self._sessions,
                    "vehicles": self._vehicles,
                    "events": self._events,
                    "analytics": self._analytics
                }, f, indent=2, default=str)
        except Exception as e:
            print(f"[MemoryFallbackRepository] Warning: Could not write data_store.json: {e}")

    async def create_session(self, session_data: Dict[str, Any]) -> str:
        async with self._lock:
            session_id = session_data.get("id") or session_data.get("session_id")
            if not session_id:
                raise ValueError("session_data must contain an 'id' or 'session_id'")
            session_data["id"] = session_id
            self._sessions[session_id] = session_data
            self._save_to_disk()
            return session_id

    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> bool:
        async with self._lock:
            if session_id in self._sessions:
                self._sessions[session_id].update(update_data)
                self._save_to_disk()
                return True
            return False

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            return self._sessions.get(session_id)

    async def list_sessions(self) -> List[Dict[str, Any]]:
        async with self._lock:
            sessions = list(self._sessions.values())
            # Sort newest first
            sessions.sort(key=lambda x: x.get("created_at", ""), reverse=True)
            return sessions

    async def save_vehicles(self, session_id: str, vehicles: List[Dict[str, Any]]) -> bool:
        async with self._lock:
            self._vehicles[session_id] = vehicles
            self._save_to_disk()
            return True

    async def get_vehicles(self, session_id: str) -> List[Dict[str, Any]]:
        async with self._lock:
            return self._vehicles.get(session_id, [])

    async def save_events(self, session_id: str, events: List[Dict[str, Any]]) -> bool:
        async with self._lock:
            self._events[session_id] = events
            self._save_to_disk()
            return True

    async def get_events(self, session_id: str) -> List[Dict[str, Any]]:
        async with self._lock:
            return self._events.get(session_id, [])

    async def save_analytics(self, session_id: str, analytics: Dict[str, Any]) -> bool:
        async with self._lock:
            self._analytics[session_id] = analytics
            self._save_to_disk()
            return True

    async def get_analytics(self, session_id: str) -> Optional[Dict[str, Any]]:
        async with self._lock:
            return self._analytics.get(session_id)

    async def delete_session(self, session_id: str) -> bool:
        async with self._lock:
            deleted = False
            if session_id in self._sessions:
                del self._sessions[session_id]
                deleted = True
            self._vehicles.pop(session_id, None)
            self._events.pop(session_id, None)
            self._analytics.pop(session_id, None)
            self._save_to_disk()
            return deleted
