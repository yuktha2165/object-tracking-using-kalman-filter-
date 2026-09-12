import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.api.endpoints import router as api_router
from app.api.websocket import ws_router
from app.database.db_factory import get_repository

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("traffic_app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Intelligent Traffic Monitoring Backend...")
    # Initialize repository connection
    await get_repository()
    yield
    logger.info("Shutting down backend...")

app = FastAPI(
    title="Intelligent Traffic Monitoring System API",
    description="Production-grade AI Video Processing, Kalman Filter Tracking, and Traffic Analytics API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static output files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/outputs", StaticFiles(directory=settings.OUTPUT_DIR), name="outputs")

# Include Routers
app.include_router(api_router, prefix="/api")
app.include_router(ws_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
