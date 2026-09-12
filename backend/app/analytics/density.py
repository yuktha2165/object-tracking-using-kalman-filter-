from typing import List, Dict, Any, Tuple
from app.tracking.track import Track

class DensityEstimator:
    """
    Traffic density calculator.
    Estimates road area occupancy percentage and classifies traffic density into LOW, MEDIUM, or HIGH.
    """
    def __init__(self, roi_area: float = 1280 * 720, low_thresh: float = 0.12, high_thresh: float = 0.28):
        self.roi_area = roi_area if roi_area > 0 else 1280 * 720
        self.low_thresh = low_thresh
        self.high_thresh = high_thresh

    def calculate_density(self, active_tracks: List[Track]) -> Dict[str, Any]:
        """
        Calculates occupancy ratio and returns density stats.
        """
        total_bbox_area = 0.0
        for track in active_tracks:
            x1, y1, x2, y2 = track.bbox
            w = max(0.0, x2 - x1)
            h = max(0.0, y2 - y1)
            total_bbox_area += (w * h)

        occupancy = min(1.0, total_bbox_area / self.roi_area)

        if occupancy < self.low_thresh:
            status = "LOW"
        elif occupancy < self.high_thresh:
            status = "MEDIUM"
        else:
            status = "HIGH"

        return {
            "vehicle_count": len(active_tracks),
            "occupancy_percentage": round(occupancy * 100, 1),
            "status": status
        }
