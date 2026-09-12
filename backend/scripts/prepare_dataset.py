import os
import yaml
import glob
import cv2
import zipfile
import logging
from typing import Optional
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("prepare_dataset")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_DIR = os.path.join(BASE_DIR, "data", "dataset")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
SAMPLE_DIR = os.path.join(BASE_DIR, "sample_videos")

VEHICLE_CLASSES = ["bicycle", "car", "motorcycle", "bus", "truck"]
CLASS_ID_MAP = {1: 0, 2: 1, 3: 2, 5: 3, 7: 4}

def create_dataset_structure():
    """Creates standard YOLO dataset directory structure and data.yaml file."""
    dirs = [
        os.path.join(DATASET_DIR, "images", "train"),
        os.path.join(DATASET_DIR, "images", "val"),
        os.path.join(DATASET_DIR, "labels", "train"),
        os.path.join(DATASET_DIR, "labels", "val")
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    yaml_path = os.path.join(DATASET_DIR, "data.yaml")
    dataset_yaml = {
        "path": DATASET_DIR,
        "train": "images/train",
        "val": "images/val",
        "names": {i: name for i, name in enumerate(VEHICLE_CLASSES)}
    }
    with open(yaml_path, "w") as f:
        yaml.dump(dataset_yaml, f, default_flow_style=False)
    logger.info(f"Generated dataset configuration at: {yaml_path}")
    return yaml_path

def extract_frames_and_auto_annotate(video_path: str, max_frames: int = 50, val_ratio: float = 0.2):
    """
    Extracts frames from sample videos and generates auto-annotations using YOLO teacher model.
    This creates a functional YOLO dataset out of the box for fine-tuning.
    """
    if not os.path.exists(video_path):
        return

    logger.info(f"Extracting & auto-annotating training frames from: {os.path.basename(video_path)}")
    model = YOLO("yolo26n.pt")
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 100
    step = max(1, total_frames // max_frames)

    video_name = os.path.splitext(os.path.basename(video_path))[0]
    count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret or frame is None:
            break

        count += 1
        if count % step != 0:
            continue

        split = "val" if (count % 5 == 0) else "train"
        img_name = f"{video_name}_frame_{count:05d}.jpg"
        lbl_name = f"{video_name}_frame_{count:05d}.txt"

        img_path = os.path.join(DATASET_DIR, "images", split, img_name)
        lbl_path = os.path.join(DATASET_DIR, "labels", split, lbl_name)

        # Save frame image
        cv2.imwrite(img_path, frame)

        # Generate YOLO format labels
        h, w = frame.shape[:2]
        results = model.predict(source=frame, conf=0.35, verbose=False)
        lines = []

        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                cls_id = int(box.cls[0].cpu().numpy())
                if cls_id in CLASS_ID_MAP:
                    mapped_cls = CLASS_ID_MAP[cls_id]
                    xywhn = box.xywhn[0].cpu().numpy() # [x_center, y_center, width, height] normalized
                    lines.append(f"{mapped_cls} {xywhn[0]:.6f} {xywhn[1]:.6f} {xywhn[2]:.6f} {xywhn[3]:.6f}\n")

        with open(lbl_path, "w") as f:
            f.writelines(lines)

    cap.release()
    logger.info(f"Extraction complete for {video_name}.")

def prepare_dataset():
    """Extract archives and prepare train/val sets."""
    create_dataset_structure()

    # Extract zip files if available
    zip_files = glob.glob(os.path.join(DATASET_DIR, "*.zip"))
    for zip_path in zip_files:
        try:
            logger.info(f"Extracting dataset archive: {os.path.basename(zip_path)}")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(DATASET_DIR)
            logger.info(f"Extracted {os.path.basename(zip_path)}")
        except Exception as e:
            logger.error(f"Error extracting {zip_path}: {e}")

    # Search for sample videos to build initial fine-tuning dataset
    video_files = glob.glob(os.path.join(SAMPLE_DIR, "*.mp4")) + glob.glob(os.path.join(UPLOADS_DIR, "*.mp4"))
    train_images = glob.glob(os.path.join(DATASET_DIR, "images", "train", "*.jpg"))

    if len(train_images) == 0 and len(video_files) > 0:
        logger.info("Dataset empty. Auto-generating training set from available sample videos...")
        for vid in video_files:
            extract_frames_and_auto_annotate(vid)

    logger.info("Dataset preparation finished.")

if __name__ == "__main__":
    prepare_dataset()

