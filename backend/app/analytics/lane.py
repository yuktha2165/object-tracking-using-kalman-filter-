import cv2
import numpy as np
from typing import List, Tuple, Dict, Optional
from app.tracking.track import Track

class LaneDetector:
    """
    Polygon-based lane region manager.
    Assigns vehicle centroids to user-configured or auto-default lane polygons.
    """
    def __init__(self, lane_polygons: Optional[Dict[str, List[Tuple[float, float]]]] = None):
        self.lane_polygons = lane_polygons or {}

    def set_default_lanes_for_resolution(self, width: int, height: int, num_lanes: int = 3):
        """Generates default vertical strip lanes based on frame resolution."""
        self.lane_polygons = {}
        lane_width = width / num_lanes
        for i in range(num_lanes):
            x1 = i * lane_width
            x2 = (i + 1) * lane_width
            lane_name = f"Lane {i + 1}"
            poly = [(x1, 0.0), (x2, 0.0), (x2, float(height)), (x1, float(height))]
            self.lane_polygons[lane_name] = poly

    def assign_lane(self, track: Track) -> Optional[str]:
        """Checks vehicle centroid against registered lane polygons."""
        if not self.lane_polygons:
            return None

        cx, cy = track.centroid
        point = (float(cx), float(cy))

        for lane_name, polygon in self.lane_polygons.items():
            np_poly = np.array(polygon, dtype=np.int32)
            # pointPolygonTest returns >= 0 if point is inside or on edge
            res = cv2.pointPolygonTest(np_poly, point, measureDist=False)
            if res >= 0:
                track.lane = lane_name
                return lane_name

        track.lane = "Unassigned"
        return "Unassigned"

    def get_lane_counts(self, active_tracks: List[Track]) -> Dict[str, int]:
        """Calculates current vehicle count per lane."""
        counts = {lane: 0 for lane in self.lane_polygons.keys()}
        counts["Unassigned"] = 0

        for track in active_tracks:
            lane = self.assign_lane(track) or "Unassigned"
            if lane in counts:
                counts[lane] += 1
            else:
                counts[lane] = 1

        return counts
