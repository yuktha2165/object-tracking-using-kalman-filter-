import os
import torch
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from ultralytics import YOLO
from app.config import settings

logger = logging.getLogger("traffic_app")

# Standard COCO Vehicle Class IDs
VEHICLE_CLASS_MAP = {
    1: "bicycle",
    2: "car",
    3: "motorcycle",
    5: "bus",
    7: "truck"
}

# Adaptive class confidence thresholds for optimal accuracy
CLASS_CONFIDENCE_OFFSETS = {
    "bicycle": -0.05,    # Slightly lower for small vehicle features
    "motorcycle": -0.05,
    "car": 0.0,
    "bus": 0.0,
    "truck": 0.0
}

class YOLODetector:
    def __init__(
        self, 
        model_name: str = settings.YOLO_MODEL, 
        confidence_threshold: float = settings.CONFIDENCE_THRESHOLD, 
        iou_threshold: float = settings.IOU_THRESHOLD,
        device: str = settings.DEVICE,
        imgsz: int = settings.INFERENCE_IMGSZ,
        half_precision: bool = settings.HALF_PRECISION
    ):
        self.model_name = model_name
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.imgsz = imgsz
        self.device = self._resolve_device(device)
        self.use_half = half_precision and (self.device != "cpu")
        self.model: Optional[YOLO] = None

        if self.device == "cpu":
            num_threads = min(8, os.cpu_count() or 4)
            torch.set_num_threads(num_threads)
            logger.info(f"PyTorch CPU inference threads configured to {num_threads}")

        self._load_model()

    def _resolve_device(self, req_device: str) -> str:
        """Determines best compute hardware device (cuda > mps > cpu)."""
        if req_device and req_device != "auto":
            return req_device
        if torch.cuda.is_available():
            return "cuda:0"
        elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
            return "mps"
        return "cpu"

    def _load_model(self):
        # 1. Check for custom fine-tuned model first
        custom_weights_path = settings.CUSTOM_MODEL_PATH
        target_model = custom_weights_path if (custom_weights_path and os.path.exists(custom_weights_path)) else self.model_name

        try:
            logger.info(f"Loading YOLO model '{target_model}' on device '{self.device}'...")
            self.model = YOLO(target_model)
            logger.info(f"YOLO model '{target_model}' loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load target model '{target_model}': {e}")
            if target_model != "yolov8n.pt":
                logger.info("Attempting fallback to 'yolov8n.pt'...")
                try:
                    self.model = YOLO("yolov8n.pt")
                    logger.info("yolov8n.pt loaded as fallback.")
                except Exception as ex:
                    logger.error(f"Fallback model loading failed: {ex}")

        # Build dynamic class map from model's actual class names
        self.class_map = {}
        if self.model and hasattr(self.model, "names") and isinstance(self.model.names, dict):
            target_vehicles = ["car", "bus", "truck", "motorcycle", "bicycle", "motorbike", "vehicle"]
            for cid, name in self.model.names.items():
                name_lower = str(name).lower()
                for target in target_vehicles:
                    if target in name_lower:
                        norm_name = "motorcycle" if "bike" in name_lower else ("car" if target == "vehicle" else name_lower)
                        self.class_map[int(cid)] = norm_name
                        break
        if not self.class_map:
            self.class_map = VEHICLE_CLASS_MAP

    def get_device_label(self) -> str:
        """Returns human-readable processing device label for UI display."""
        if "cuda" in str(self.device).lower():
            return "NVIDIA GPU"
        elif "mps" in str(self.device).lower():
            return "Apple Silicon (MPS)"
        return "CPU"

    def _apply_roi(self, frame: np.ndarray, roi: Optional[Dict[str, int]] = None) -> tuple:
        """Crops frame to road ROI if configured, returning (cropped_frame, offset_x, offset_y)."""
        if not roi:
            return frame, 0, 0
        h, w = frame.shape[:2]
        x1 = max(0, min(w - 1, int(roi.get("x1", 0))))
        y1 = max(0, min(h - 1, int(roi.get("y1", 0))))
        x2 = max(x1 + 1, min(w, int(roi.get("x2", w))))
        y2 = max(y1 + 1, min(h, int(roi.get("y2", h))))
        return frame[y1:y2, x1:x2], x1, y1

    def detect(self, frame: np.ndarray, confidence: Optional[float] = None, roi: Optional[Dict[str, int]] = None) -> List[Dict[str, Any]]:
        """
        Runs accelerated YOLO detection on an OpenCV BGR frame (with optional ROI).
        """
        if self.model is None:
            return []

        cropped_frame, offset_x, offset_y = self._apply_roi(frame, roi)
        base_conf = confidence if confidence is not None else self.confidence_threshold
        target_classes = list(self.class_map.keys()) if self.class_map else None
        
        with torch.inference_mode():
            try:
                results = self.model.predict(
                    source=cropped_frame,
                    conf=base_conf * 0.8,
                    iou=self.iou_threshold,
                    classes=target_classes,
                    imgsz=self.imgsz,
                    device=self.device,
                    verbose=False
                )
            except Exception as e:
                logger.warning(f"Prediction fallback to CPU: {e}")
                results = self.model.predict(
                    source=cropped_frame,
                    conf=base_conf * 0.8,
                    iou=self.iou_threshold,
                    classes=target_classes,
                    imgsz=self.imgsz,
                    device="cpu",
                    verbose=False
                )

        detections = []
        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                cls_id = int(box.cls[0].cpu().numpy())
                conf = float(box.conf[0].cpu().numpy())
                xyxy = box.xyxy[0].cpu().numpy()

                class_name = self.class_map.get(cls_id, "car")
                conf_offset = CLASS_CONFIDENCE_OFFSETS.get(class_name, 0.0)
                effective_thresh = max(0.1, base_conf + conf_offset)

                if conf < effective_thresh:
                    continue

                x1, y1, x2, y2 = [float(v) for v in xyxy]
                # Adjust for ROI offset
                x1 += offset_x
                x2 += offset_x
                y1 += offset_y
                y2 += offset_y

                cx = (x1 + x2) / 2.0
                cy = (y1 + y2) / 2.0

                detections.append({
                    "class_name": class_name,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2],
                    "centroid": (cx, cy)
                })

        return detections

    def detect_batch(
        self, 
        frames: List[np.ndarray], 
        confidence: Optional[float] = None, 
        roi: Optional[Dict[str, int]] = None
    ) -> List[List[Dict[str, Any]]]:
        """
        Runs parallel batch YOLO inference over a list of OpenCV BGR frames.
        Automatically handles ROI cropping and CUDA/MPS OOM fallback.
        """
        if self.model is None or not frames:
            return [[] for _ in frames]

        cropped_frames = []
        offsets = []
        for f in frames:
            cr, ox, oy = self._apply_roi(f, roi)
            cropped_frames.append(cr)
            offsets.append((ox, oy))

        base_conf = confidence if confidence is not None else self.confidence_threshold
        target_classes = list(self.class_map.keys()) if self.class_map else None

        with torch.inference_mode():
            try:
                results = self.model.predict(
                    source=cropped_frames,
                    batch=len(cropped_frames),
                    conf=base_conf * 0.8,
                    iou=self.iou_threshold,
                    classes=target_classes,
                    imgsz=self.imgsz,
                    device=self.device,
                    verbose=False
                )
            except Exception as e:
                logger.warning(f"OOM batch prediction warning ({e}), falling back to CPU...")
                results = self.model.predict(
                    source=cropped_frames,
                    batch=len(cropped_frames),
                    conf=base_conf * 0.8,
                    iou=self.iou_threshold,
                    classes=target_classes,
                    imgsz=self.imgsz,
                    device="cpu",
                    verbose=False
                )

        batch_detections = []
        for res, (ox, oy) in zip(results, offsets):
            dets = []
            if res.boxes is not None:
                for box in res.boxes:
                    cls_id = int(box.cls[0].cpu().numpy())
                    conf = float(box.conf[0].cpu().numpy())
                    xyxy = box.xyxy[0].cpu().numpy()

                    class_name = self.class_map.get(cls_id, "car")
                    conf_offset = CLASS_CONFIDENCE_OFFSETS.get(class_name, 0.0)
                    effective_thresh = max(0.1, base_conf + conf_offset)

                    if conf < effective_thresh:
                        continue

                    x1, y1, x2, y2 = [float(v) for v in xyxy]
                    x1 += ox
                    x2 += ox
                    y1 += oy
                    y2 += oy

                    cx = (x1 + x2) / 2.0
                    cy = (y1 + y2) / 2.0

                    dets.append({
                        "class_name": class_name,
                        "confidence": conf,
                        "bbox": [x1, y1, x2, y2],
                        "centroid": (cx, cy)
                    })
            batch_detections.append(dets)

        return batch_detections



