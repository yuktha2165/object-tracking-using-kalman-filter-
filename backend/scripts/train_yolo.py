import os
import sys
import shutil
import argparse
import logging
import torch
from ultralytics import YOLO

# Add backend directory to sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.config import settings
from scripts.prepare_dataset import prepare_dataset, DATASET_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("train_yolo")

def get_best_device() -> str:
    if torch.cuda.is_available():
        return "cuda:0"
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return "mps"
    return "cpu"

def train_yolo_model(
    base_model: str = "yolo26n.pt",
    epochs: int = 15,
    batch_size: int = 8,
    imgsz: int = 640,
    lr0: float = 0.01,
    device: str = "auto",
    export_name: str = "traffic_yolo_best.pt"
):
    """
    Fine-tunes YOLO model on traffic vehicle dataset and exports best weights.
    """
    logger.info("Initializing YOLO Traffic Model Fine-Tuning Pipeline...")

    # 1. Ensure dataset layout and data.yaml exist
    data_yaml_path = os.path.join(DATASET_DIR, "data.yaml")
    if not os.path.exists(data_yaml_path):
        logger.info("Dataset configuration missing. Running prepare_dataset()...")
        prepare_dataset()

    # 2. Determine target hardware device
    target_device = device if device != "auto" else get_best_device()
    logger.info(f"Target Compute Device: {target_device}")

    # 3. Load Base Model
    logger.info(f"Loading Base Model: {base_model}")
    model = YOLO(base_model)

    # 4. Run Training
    logger.info(f"Starting fine-tuning for {epochs} epochs (batch={batch_size}, imgsz={imgsz})...")
    
    runs_dir = os.path.join(BASE_DIR, "runs", "train")
    os.makedirs(runs_dir, exist_ok=True)

    results = model.train(
        data=data_yaml_path,
        epochs=epochs,
        batch=batch_size,
        imgsz=imgsz,
        lr0=lr0,
        device=target_device,
        workers=2,
        project=runs_dir,
        name="traffic_yolo_run",
        exist_ok=True,
        verbose=True
    )

    # 5. Export Best Weights to models directory
    best_weights_src = os.path.join(runs_dir, "traffic_yolo_run", "weights", "best.pt")
    dest_models_dir = settings.MODELS_DIR
    os.makedirs(dest_models_dir, exist_ok=True)

    final_export_path = os.path.join(dest_models_dir, export_name)

    if os.path.exists(best_weights_src):
        shutil.copy(best_weights_src, final_export_path)
        logger.info(f"Training completed successfully!")
        logger.info(f"Fine-tuned best model exported to: {final_export_path}")
    else:
        logger.warning(f"Best weights file not found at {best_weights_src}. Checking last.pt...")
        last_weights_src = os.path.join(runs_dir, "traffic_yolo_run", "weights", "last.pt")
        if os.path.exists(last_weights_src):
            shutil.copy(last_weights_src, final_export_path)
            logger.info(f"Exported last weights to: {final_export_path}")

    return final_export_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train / Fine-tune YOLO on Traffic Vehicle Dataset")
    parser.add_argument("--model", type=str, default="yolo26n.pt", help="Base model (e.g. yolo26n.pt, yolo11n.pt, yolov8n.pt)")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch", type=int, default=8, help="Batch size")
    parser.add_argument("--imgsz", type=int, default=640, help="Image resolution for training")
    parser.add_argument("--lr0", type=float, default=0.01, help="Initial learning rate")
    parser.add_argument("--device", type=str, default="auto", help="Device: auto, cuda:0, mps, or cpu")
    parser.add_argument("--export-name", type=str, default="traffic_yolo_best.pt", help="Export filename in backend/models/")

    args = parser.parse_args()

    train_yolo_model(
        base_model=args.model,
        epochs=args.epochs,
        batch_size=args.batch,
        imgsz=args.imgsz,
        lr0=args.lr0,
        device=args.device,
        export_name=args.export_name
    )
