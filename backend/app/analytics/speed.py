import math
from typing import Optional, List, Tuple
from app.tracking.track import Track

class SpeedEstimator:
    """
    Speed estimation using trajectory displacement, frame rate, and pixel-to-meter calibration scale.
    """
    def __init__(self, pixels_per_meter: Optional[float] = 15.0, fps: float = 30.0):
        self.pixels_per_meter = pixels_per_meter if (pixels_per_meter and pixels_per_meter > 0) else None
        self.fps = fps if fps > 0 else 30.0

    def estimate_speed(self, track: Track) -> Optional[float]:
        """
        Estimates vehicle speed in km/h.
        Returns None if calibration pixels_per_meter is unavailable or track trajectory is insufficient.
        """
        if self.pixels_per_meter is None:
            track.speed = None
            return None

        if len(track.trajectory) < 4:
            return track.speed

        # Calculate average displacement over recent trajectory window (up to last 10 points)
        pts = list(track.trajectory)[-10:]
        total_dist_px = 0.0
        for i in range(1, len(pts)):
            dx = pts[i][0] - pts[i-1][0]
            dy = pts[i][1] - pts[i-1][1]
            total_dist_px += math.sqrt(dx * dx + dy * dy)

        frame_delta = pts[-1][2] - pts[0][2]
        if frame_delta <= 0:
            return track.speed

        time_seconds = frame_delta / self.fps
        if time_seconds <= 0:
            return track.speed

        distance_meters = total_dist_px / self.pixels_per_meter
        speed_m_s = distance_meters / time_seconds
        speed_km_h = speed_m_s * 3.6

        # Apply exponential moving average to smooth speed estimates
        if track.speed is not None:
            speed_km_h = 0.7 * track.speed + 0.3 * speed_km_h

        # Cap realistic speed bounds (0 - 200 km/h)
        speed_km_h = max(0.0, min(200.0, speed_km_h))
        track.speed = speed_km_h
        return speed_km_h

def estimate_speed_kmh(trajectory: list, fps: float = 30.0, pixels_per_meter: float = 15.0) -> Optional[float]:
    """Standalone helper function to calculate speed from trajectory."""
    if not pixels_per_meter or pixels_per_meter <= 0:
        return None
    if not trajectory or len(trajectory) < 4:
        return None
    pts = list(trajectory)[-10:]
    total_dist_px = 0.0
    for i in range(1, len(pts)):
        dx = pts[i][0] - pts[i-1][0]
        dy = pts[i][1] - pts[i-1][1]
        total_dist_px += math.sqrt(dx * dx + dy * dy)
    frame_delta = pts[-1][2] - pts[0][2]
    if frame_delta <= 0 or fps <= 0:
        return None
    time_seconds = frame_delta / fps
    if time_seconds <= 0:
        return None
    distance_meters = total_dist_px / pixels_per_meter
    speed_m_s = distance_meters / time_seconds
    speed_km_h = speed_m_s * 3.6
    return max(0.0, min(200.0, speed_km_h))

def assign_lane_and_direction(centroid: Tuple[float, float], trajectory: list, frame_width: int = 1280, frame_height: int = 720) -> dict:
    """Helper to assign lane and motion direction from centroid & trajectory."""
    cx, cy = centroid
    num_lanes = 3
    lane_width = (frame_width / num_lanes) if frame_width > 0 else 1
    lane_idx = int(cx // lane_width) + 1
    lane_idx = max(1, min(num_lanes, lane_idx))
    lane_str = f"Lane {lane_idx}"

    dir_str = "UNKNOWN"
    if trajectory and len(trajectory) >= 3:
        first_pt = trajectory[0]
        last_pt = trajectory[-1]
        dx = last_pt[0] - first_pt[0]
        dy = last_pt[1] - first_pt[1]
        dist = math.sqrt(dx * dx + dy * dy)
        if dist >= 15.0:
            angle_rad = math.atan2(-dy, dx)
            angle_deg = math.degrees(angle_rad) % 360
            if 337.5 <= angle_deg or angle_deg < 22.5:
                dir_str = "EAST"
            elif 22.5 <= angle_deg < 67.5:
                dir_str = "NORTH_EAST"
            elif 67.5 <= angle_deg < 112.5:
                dir_str = "NORTH"
            elif 112.5 <= angle_deg < 157.5:
                dir_str = "NORTH_WEST"
            elif 157.5 <= angle_deg < 202.5:
                dir_str = "WEST"
            elif 202.5 <= angle_deg < 247.5:
                dir_str = "SOUTH_WEST"
            elif 247.5 <= angle_deg < 292.5:
                dir_str = "SOUTH"
            else:
                dir_str = "SOUTH_EAST"

    return {"lane": lane_str, "direction": dir_str}

