import logging
from app.config import settings
from app.database.repository import BaseRepository
from app.database.mongodb import MongoDBRepository
from app.database.memory_fallback import MemoryFallbackRepository

logger = logging.getLogger("traffic_app")

_repo_instance: BaseRepository = None
_db_mode: str = "UNKNOWN"

async def get_repository() -> BaseRepository:
    global _repo_instance, _db_mode
    if _repo_instance is not None:
        return _repo_instance

    try:
        mongo_repo = MongoDBRepository(settings.MONGODB_URI, settings.DATABASE_NAME)
        if await mongo_repo.ping():
            _repo_instance = mongo_repo
            _db_mode = "MONGODB"
            logger.info("Connected to MongoDB successfully.")
            return _repo_instance
        else:
            logger.warning("MongoDB ping failed. Falling back to local in-memory storage.")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB ({e}). Falling back to local in-memory storage.")

    _repo_instance = MemoryFallbackRepository()
    _db_mode = "LOCAL_FALLBACK"
    return _repo_instance

def get_db_mode() -> str:
    return _db_mode
