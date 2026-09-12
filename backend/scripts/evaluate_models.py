import os
import sys
import time
import logging
import cv2
import torch
from ultralytics import YOLO, RTDETR

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("evaluate_models")

def evaluate_model_on_val(model_path: str, dataset_yaml: str):
    """Evaluates a detector model on the validation dataset split."""
    if not os.path.exists(model_path):
        logger.warning(f"Model file not found: {model_path}")
        return None

    logger.info(f"--- Evaluating Model: {os.path.basename(model_path)} ---")
    is_rtdetr = "rtdetr" in os.path.basename(model_path).lower()
    model = RTDETR(model_path) if is_rtdetr else YOLO(model_path)

    # Use CPU for RT-DETR val to avoid PyTorch MPS tensor mismatch during evaluation
    device = "cpu" if is_rtdetr else ("mps" if (hasattr(torch.backends, "mps") and torch.backends.mps.is_available()) else ("cuda:0" if torch.cuda.is_available() else "cpu"))

    try:
        metrics = model.val(data=dataset_yaml, split="val", device=device, verbose=False)
        precision = metrics.box.map50 # mAP50 metric
        map50_95 = metrics.box.map    # mAP50-95 metric
        mp = metrics.box.mp          # Mean Precision
        mr = metrics.box.mr          # Mean Recall
        speed = metrics.speed        # dict with preprocess, inference, loss, postprocess

        logger.info(f"Model: {os.path.basename(model_path)}")
        logger.info(f"  mAP@50    : {precision:.4f}")
        logger.info(f"  mAP@50-95 : {map50_95:.4f}")
        logger.info(f"  Precision : {mp:.4f}")
        logger.info(f"  Recall    : {mr:.4f}")
        logger.info(f"  Inference Speed: {speed.get('inference', 0.0):.2f} ms/frame")

        return {
            "model": os.path.basename(model_path),
            "map50": precision,
            "map50_95": map50_95,
            "precision": mp,
            "recall": mr,
            "inference_ms": speed.get('inference', 0.0)
        }
    except Exception as e:
        logger.error(f"Error evaluating {model_path}: {e}")
        return None

def test_inference_on_sample_video(model_path: str, video_path: str, max_frames: int = 30):
    """Measures live inference performance and tracking detection output on a sample traffic video."""
    if not os.path.exists(model_path) or not os.path.exists(video_path):
        return None

    logger.info(f"Testing live inference performance on: {os.path.basename(video_path)} with {os.path.basename(model_path)}")
    is_rtdetr = "rtdetr" in os.path.basename(model_path).lower()
    model = RTDETR(model_path) if is_rtdetr else YOLO(model_path)
    device = "cpu" if is_rtdetr else ("mps" if (hasattr(torch.backends, "mps") and torch.backends.mps.is_available()) else "cpu")

    cap = cv2.VideoCapture(video_path)
    frames_processed = 0
    total_vehicles_detected = 0
    start_time = time.time()

    while cap.isOpened() and frames_processed < max_frames:
        ret, frame = cap.read()
        if not ret or frame is None:
            break

        results = model.predict(source=frame, conf=0.35, device=device, verbose=False)
        if len(results) > 0 and results[0].boxes is not None:
            total_vehicles_detected += len(results[0].boxes)

        frames_processed += 1

    cap.release()
    elapsed = time.time() - start_time
    fps = frames_processed / elapsed if elapsed > 0 else 0.0
    avg_det_per_frame = total_vehicles_detected / frames_processed if frames_processed > 0 else 0.0

    logger.info(f"  Frames Processed : {frames_processed}")
    logger.info(f"  Average FPS      : {fps:.2f} FPS")
    logger.info(f"  Avg Vehicles/Frame: {avg_det_per_frame:.2f}")

    return {
        "fps": fps,
        "avg_vehicles": avg_det_per_frame
    }

def run_evaluation_suite():
    dataset_yaml = os.path.join(BASE_DIR, "data", "dataset", "data.yaml")
    sample_video = os.path.join(BASE_DIR, "sample_videos", "sample_traffic.mp4")

    models_to_test = [
        os.path.join(BASE_DIR, "rtdetr-l.pt"),
        os.path.join(BASE_DIR, "yolo26n.pt"),
        os.path.join(settings.MODELS_DIR, "traffic_yolo_best.pt"),
        os.path.join(settings.MODELS_DIR, "traffic_rtdetr_best.pt")
    ]

    results = []
    for m_path in models_to_test:
        if os.path.exists(m_path):
            res = evaluate_model_on_val(m_path, dataset_yaml)
            if res and os.path.exists(sample_video):
                vid_res = test_inference_on_sample_video(m_path, sample_video)
                if vid_res:
                    res.update(vid_res)
            if res:
                results.append(res)

    print("\n" + "="*85)
    print(f"{'MODEL':<28} | {'mAP@50':<8} | {'mAP@50-95':<10} | {'PRECISION':<10} | {'RECALL':<8} | {'FPS':<6}")
    print("="*85)
    for r in results:
        print(f"{r['model']:<28} | {r['map50']:<8.4f} | {r['map50_95']:<10.4f} | {r['precision']:<10.4f} | {r['recall']:<8.4f} | {r.get('fps', 0.0):<6.1f}")
    print("="*85 + "\n")

if __name__ == "__main__":
    run_evaluation_suite()
