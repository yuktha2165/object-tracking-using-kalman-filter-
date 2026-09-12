from collections import deque
from typing import List, Tuple, Optional, Dict, Any
from app.tracking.kalman_filter import KalmanFilter2D

class Track:
    _id_counter = 1

    def __init__(self, class_name: str, bbox: List[float], confidence: float, frame_idx: int, max_trajectory_points: int = 50):
        self.track_id: int = int(Track._id_counter)
        Track._id_counter += 1

        self.class_name: str = str(class_name)
        self.bbox: List[float] = [float(b) for b in bbox] # [x1, y1, x2, y2]
        self.confidence: float = float(confidence)

        x1, y1, x2, y2 = self.bbox
        cx = float((x1 + x2) / 2.0)
        cy = float((y1 + y2) / 2.0)
        self.centroid: Tuple[float, float] = (cx, cy)
        self.velocity: Tuple[float, float] = (0.0, 0.0)

        self.kalman = KalmanFilter2D(init_x=cx, init_y=cy)

        self.age: int = 1
        self.missed_frames: int = 0
        self.max_trajectory_points: int = int(max_trajectory_points)
        self.trajectory: deque = deque(maxlen=max_trajectory_points)
        self.trajectory.append((cx, cy, int(frame_idx)))

        self.first_seen_frame: int = int(frame_idx)
        self.last_seen_frame: int = int(frame_idx)

        self.lane: Optional[str] = None
        self.direction: str = "UNKNOWN"
        self.speed: Optional[float] = None
        self.lane: Optional[str] = None
        self.direction: str = "UNKNOWN"
        self.speed: Optional[float] = None
        self.status: str = "NEW"  # NEW -> CONFIRMED -> TRACKING -> TEMPORARILY_LOST -> REMOVED
        self.hits: int = 1

    @classmethod
    def reset_id_counter(cls):
        cls._id_counter = 1

    def predict(self) -> Tuple[float, float]:
        """Predict track position using Kalman Filter."""
        pred_cx, pred_cy = self.kalman.predict()
        pred_cx, pred_cy = float(pred_cx), float(pred_cy)

        curr_cx, curr_cy = self.centroid
        dx = pred_cx - curr_cx
        dy = pred_cy - curr_cy

        x1, y1, x2, y2 = self.bbox
        self.bbox = [float(x1 + dx), float(y1 + dy), float(x2 + dx), float(y2 + dy)]
        self.centroid = (pred_cx, pred_cy)

        self.age += 1
        return (pred_cx, pred_cy)

    def update(self, bbox: List[float], class_name: str, confidence: float, frame_idx: int):
        """Update track with new YOLO detection measurement."""
        self.class_name = str(class_name)
        self.confidence = float(confidence)

        x1, y1, x2, y2 = [float(b) for b in bbox]
        w = max(1.0, x2 - x1)
        h = max(1.0, y2 - y1)
        det_cx = (x1 + x2) / 2.0
        det_cy = (y1 + y2) / 2.0

        upd_cx, upd_cy = self.kalman.update(det_cx, det_cy)
        upd_cx, upd_cy = float(upd_cx), float(upd_cy)
        self.centroid = (upd_cx, upd_cy)
        self.bbox = [
            round(upd_cx - w / 2.0, 2),
            round(upd_cy - h / 2.0, 2),
            round(upd_cx + w / 2.0, 2),
            round(upd_cy + h / 2.0, 2)
        ]

        vx, vy = self.kalman.get_velocity()
        self.velocity = (float(vx), float(vy))

        self.trajectory.append((upd_cx, upd_cy, int(frame_idx)))
        self.missed_frames = 0
        self.last_seen_frame = int(frame_idx)
        self.hits += 1

        if self.hits >= 3:
            self.status = "TRACKING"
        elif self.hits >= 2:
            self.status = "CONFIRMED"
        else:
            self.status = "NEW"

    def mark_missed(self, max_missed: int):
        """Mark detection missed for current frame."""
        self.missed_frames += 1
        if self.status != "REMOVED":
            self.status = "TEMPORARILY_LOST"
        if self.missed_frames >= max_missed:
            self.status = "REMOVED"

    def propagate_skipped_frame(self, frame_idx: int):
        """Propagate track position across a frame where YOLO inference was skipped."""
        pred_cx, pred_cy = self.predict()
        self.trajectory.append((pred_cx, pred_cy, int(frame_idx)))
        self.last_seen_frame = int(frame_idx)



    def to_dict(self) -> Dict[str, Any]:
        return {
            "track_id": int(self.track_id),
            "class_name": str(self.class_name),
            "bbox": [round(float(v), 2) for v in self.bbox],
            "centroid": (round(float(self.centroid[0]), 2), round(float(self.centroid[1]), 2)),
            "velocity": (round(float(self.velocity[0]), 2), round(float(self.velocity[1]), 2)),
            "confidence": round(float(self.confidence), 3),
            "age": int(self.age),
            "missed_frames": int(self.missed_frames),
            "trajectory": [(round(float(x), 1), round(float(y), 1), int(f)) for x, y, f in self.trajectory],
            "first_seen_frame": int(self.first_seen_frame),
            "last_seen_frame": int(self.last_seen_frame),
            "lane": str(self.lane or "N/A"),
            "direction": str(self.direction),
            "speed": round(float(self.speed), 1) if self.speed is not None else None,
            "status": str(self.status)
        }
