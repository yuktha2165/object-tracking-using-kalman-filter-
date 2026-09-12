import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    ENV: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "traffic_monitoring"
    
    # Object Detection Model Hardware & Optimizations
    RTDETR_MODEL: str = "rtdetr-l.pt"
    YOLO_MODEL: str = "rtdetr-l.pt"
    CONFIDENCE_THRESHOLD: float = 0.45
    IOU_THRESHOLD: float = 0.45
    DEVICE: str = "auto"  # "auto", "cuda", "mps", "cpu"
    HALF_PRECISION: bool = True
    INFERENCE_IMGSZ: int = 640
    CUSTOM_MODEL_PATH: Optional[str] = None

    # Tracking
    MAX_MISSED_FRAMES: int = 15
    MAX_ASSOCIATION_DISTANCE: float = 90.0
    MAX_TRAJECTORY_POINTS: int = 30
    
    # Fast Processing & Keyframe Batching
    DETECTION_INTERVAL: int = 1  # Configurable: 1, 2, 3, 5
    YOLO_BATCH_SIZE: int = 8
    INFERENCE_WIDTH: int = 960
    INFERENCE_HEIGHT: int = 540
    ROI_CONFIG: Optional[dict] = None  # e.g., {"x1": 0, "y1": 150, "x2": 1280, "y2": 720}

    PROCESSING_MODE: str = "fast"  # "fast" (direct analytics) or "detailed"
    TARGET_SAMPLING_FPS: float = 5.0
    BATCH_SIZE: int = 8

    # Calibration & Analytics
    PIXELS_PER_METER: Optional[float] = 15.0
    EXPECTED_DIRECTION: str = "EAST"
    FRAME_SKIP: int = 1


    
    # Storage Paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    UPLOAD_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
    OUTPUT_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "outputs"))
    SAMPLE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_videos"))
    MODELS_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
    DATASET_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "dataset"))

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_DIR, exist_ok=True)
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs(settings.DATASET_DIR, exist_ok=True)

