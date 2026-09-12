import os
import cv2
import math
import subprocess
import logging
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from app.tracking.track import Track

logger = logging.getLogger("traffic_app")

COLOR_MAP = {
    "car": (255, 128, 0),        # Vibrant Blue/Cyan (BGR: (255, 128, 0))
    "bus": (0, 215, 255),       # Gold/Amber
    "truck": (0, 165, 255),     # Orange
    "motorcycle": (147, 20, 255),# Violet/Magenta
    "bicycle": (50, 205, 50)    # Lime Green
}

DEFAULT_COLOR = (0, 255, 127)

def extract_video_metadata(video_path: str) -> Dict[str, Any]:
    """Extracts duration, FPS, resolution, total frames, and file size for a video file."""
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found at {video_path}")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video file {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if math.isnan(fps) or fps <= 0:
        fps = 30.0

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()

    duration = total_frames / fps if fps > 0 else 0.0
    size_bytes = os.path.getsize(video_path)

    return {
        "filename": os.path.basename(video_path),
        "duration": round(duration, 2),
        "fps": round(fps, 2),
        "resolution": f"{width}x{height}",
        "width": width,
        "height": height,
        "total_frames": total_frames,
        "size_bytes": size_bytes,
        "size_mb": round(size_bytes / (1024 * 1024), 2)
    }

def draw_frame_overlays(
    frame: np.ndarray,
    active_tracks: List[Track],
    counting_line: List[Tuple[float, float]],
    lane_polygons: Dict[str, List[Tuple[float, float]]],
    density_status: str,
    congestion_level: str,
    total_counted: int,
    current_fps: float,
    frame_idx: int,
    speed_calibrated: bool = True
) -> np.ndarray:
    """
    Renders professional dark control-room overlays on OpenCV video frame.
    """
    img = frame.copy()
    h, w, _ = img.shape

    # 1. Draw Lane Polygons
    for lane_name, poly in lane_polygons.items():
        if len(poly) >= 3:
            pts = np.array(poly, np.int32).reshape((-1, 1, 2))
            cv2.polylines(img, [pts], isClosed=True, color=(100, 100, 100), thickness=1, lineType=cv2.LINE_AA)
            cv2.putText(img, lane_name, (int(poly[0][0]) + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (180, 180, 180), 1, cv2.LINE_AA)

    # 2. Draw Virtual Counting Line
    if len(counting_line) == 2:
        pt1 = (int(counting_line[0][0]), int(counting_line[0][1]))
        pt2 = (int(counting_line[1][0]), int(counting_line[1][1]))
        cv2.line(img, pt1, pt2, (0, 0, 255), 2, cv2.LINE_AA)
        cv2.putText(img, "COUNTING LINE", (pt1[0] + 10, pt1[1] - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2, cv2.LINE_AA)

    # 3. Draw Vehicle Bounding Boxes, Trajectories, and ID Badges
    for track in active_tracks:
        x1, y1, x2, y2 = [int(v) for v in track.bbox]
        cls = track.class_name.lower()
        if cls in ["van", "pickup", "lorry"]:
            cls = "truck"
        elif cls in ["coach", "minibus"]:
            cls = "bus"
        elif cls in ["motorbike", "scooter"]:
            cls = "motorcycle"
        elif cls in ["bike", "cyclist"]:
            cls = "bicycle"
        color = COLOR_MAP.get(cls, DEFAULT_COLOR)

        # Draw trajectory tail
        if len(track.trajectory) > 1:
            pts = [(int(pt[0]), int(pt[1])) for pt in track.trajectory]
            for i in range(1, len(pts)):
                dx = pts[i][0] - pts[i - 1][0]
                dy = pts[i][1] - pts[i - 1][1]
                if math.hypot(dx, dy) <= settings.MAX_ASSOCIATION_DISTANCE:
                    thickness = int(np.sqrt(float(i + 1)) * 0.8) + 1
                    cv2.line(img, pts[i - 1], pts[i], color, thickness, cv2.LINE_AA)

        # Draw Bounding Box
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)

        # Vehicle ID badge label string
        speed_str = f"{int(track.speed)}km/h" if (speed_calibrated and track.speed is not None) else "N/A"
        label = f"#{track.track_id} {cls.upper()} ({speed_str})"

        # Label background
        (w_txt, h_txt), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        lbl_y1 = max(0, y1 - h_txt - 8)
        cv2.rectangle(img, (x1, lbl_y1), (x1 + w_txt + 8, y1), color, -1)
        cv2.putText(img, label, (x1 + 4, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1, cv2.LINE_AA)

    # 4. Top Heads-Up Display (HUD) Banner Overlay
    hud_h = 42
    overlay = img.copy()
    cv2.rectangle(overlay, (0, 0), (w, hud_h), (15, 23, 42), -1) # Dark Slate
    cv2.addWeighted(overlay, 0.75, img, 0.25, 0, img)
    cv2.line(img, (0, hud_h), (w, hud_h), (51, 65, 85), 1)

    # HUD Text Telemetry
    hud_txt = f"FRAME: {frame_idx} | FPS: {current_fps:.1f} | ACTIVE: {len(active_tracks)} | TOTAL COUNT: {total_counted} | DENSITY: {density_status} | CONGESTION: {congestion_level}"
    
    # Congestion color badge
    cong_color = (50, 205, 50) if congestion_level == "NORMAL" else ((0, 215, 255) if congestion_level == "MODERATE" else (0, 0, 255))
    
    cv2.putText(img, hud_txt, (16, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (241, 245, 249), 1, cv2.LINE_AA)
    cv2.circle(img, (w - 24, 21), 8, cong_color, -1, cv2.LINE_AA)

    return img

def remux_to_web_mp4(input_path: str, output_path: str) -> bool:
    """
    Uses ffmpeg to remux/encode output video into web H.264 MP4 format so standard HTML5 video tag can stream it.
    """
    try:
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-c:v", "libx264",
            "-preset", "fast",
            "-pix_fmt", "yuv420p",
            output_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0 and os.path.exists(output_path):
            os.remove(input_path)
            return True
        else:
            logger.warning(f"ffmpeg remux warning: {res.stderr}")
            if os.path.exists(input_path):
                os.rename(input_path, output_path)
            return False
    except Exception as e:
        logger.error(f"Error executing ffmpeg remux: {e}")
        if os.path.exists(input_path):
            os.rename(input_path, output_path)
        return False
