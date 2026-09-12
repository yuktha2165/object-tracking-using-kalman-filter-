import asyncio
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from app.database.repository import BaseRepository
from app.config import settings

class MongoDBRepository(BaseRepository):
    def __init__(self, uri: str, db_name: str):
        self.client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=2000)
        self.db = self.client[db_name]
        self.sessions = self.db["analysis_sessions"]
        self.vehicles = self.db["vehicles"]
        self.events = self.db["events"]
        self.analytics = self.db["traffic_metrics"]

    async def ping(self) -> bool:
        try:
            await self.client.admin.command('ping')
            return True
        except Exception:
            return False

    async def create_session(self, session_data: Dict[str, Any]) -> str:
        session_id = session_data.get("id") or session_data.get("session_id")
        session_data["_id"] = session_id
        session_data["id"] = session_id
        await self.sessions.replace_one({"_id": session_id}, session_data, upsert=True)
        return session_id

    async def update_session(self, session_id: str, update_data: Dict[str, Any]) -> bool:
        res = await self.sessions.update_one({"_id": session_id}, {"$set": update_data})
        return res.modified_count > 0 or res.matched_count > 0

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.sessions.find_one({"_id": session_id})
        if doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        return doc

    async def list_sessions(self) -> List[Dict[str, Any]]:
        cursor = self.sessions.find().sort("created_at", -1)
        results = []
        async for doc in cursor:
            doc["id"] = str(doc.get("_id", doc.get("id")))
            if "_id" in doc:
                del doc["_id"]
            results.append(doc)
        return results

    async def save_vehicles(self, session_id: str, vehicles: List[Dict[str, Any]]) -> bool:
        await self.vehicles.replace_one(
            {"_id": session_id},
            {"_id": session_id, "session_id": session_id, "items": vehicles},
            upsert=True
        )
        return True

    async def get_vehicles(self, session_id: str) -> List[Dict[str, Any]]:
        doc = await self.vehicles.find_one({"_id": session_id})
        return doc.get("items", []) if doc else []

    async def save_events(self, session_id: str, events: List[Dict[str, Any]]) -> bool:
        await self.events.replace_one(
            {"_id": session_id},
            {"_id": session_id, "session_id": session_id, "items": events},
            upsert=True
        )
        return True

    async def get_events(self, session_id: str) -> List[Dict[str, Any]]:
        doc = await self.events.find_one({"_id": session_id})
        return doc.get("items", []) if doc else []

    async def save_analytics(self, session_id: str, analytics: Dict[str, Any]) -> bool:
        await self.analytics.replace_one(
            {"_id": session_id},
            {"_id": session_id, "session_id": session_id, "data": analytics},
            upsert=True
        )
        return True

    async def get_analytics(self, session_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.analytics.find_one({"_id": session_id})
        return doc.get("data") if doc else None

    async def delete_session(self, session_id: str) -> bool:
        await self.sessions.delete_one({"_id": session_id})
        await self.vehicles.delete_one({"_id": session_id})
        await self.events.delete_one({"_id": session_id})
        await self.analytics.delete_one({"_id": session_id})
        return True
