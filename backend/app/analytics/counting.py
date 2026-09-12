from typing import List, Tuple, Dict, Set, Any
from app.tracking.track import Track

class VehicleCounter:
    """
    Virtual counting line implementation.
    Determines line crossing by calculating sign changes of cross products over vehicle centroid movement vectors.
    """
    def __init__(self, line: List[Tuple[float, float]]):
        # Line specified as [(x1, y1), (x2, y2)]
        self.line = line if line and len(line) == 2 else [(0.0, 360.0), (1280.0, 360.0)]
        self.counted_ids: Set[int] = set()
        
        self.total_count: int = 0
        self.class_counts: Dict[str, int] = {
            "car": 0,
            "bus": 0,
            "truck": 0,
            "motorcycle": 0,
            "bicycle": 0
        }
        self.direction_counts: Dict[str, int] = {
            "IN": 0,
            "OUT": 0
        }

    def _cross_product(self, p1: Tuple[float, float], p2: Tuple[float, float], p3: Tuple[float, float]) -> float:
        """Computes cross product of vector (p1 -> p2) and (p1 -> p3)."""
        return (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0])

    def _intersects(self, a: Tuple[float, float], b: Tuple[float, float], c: Tuple[float, float], d: Tuple[float, float]) -> bool:
        """Determines if line segment ab intersects line segment cd."""
        cp1 = self._cross_product(a, b, c)
        cp2 = self._cross_product(a, b, d)
        cp3 = self._cross_product(c, d, a)
        cp4 = self._cross_product(c, d, b)

        return ((cp1 * cp2) < 0) and ((cp3 * cp4) < 0)

    def process_tracks(self, active_tracks: List[Track]):
        """
        Checks if any track's recent movement vector intersects the virtual counting line.
        Prevents duplicate counting using self.counted_ids.
        """
        l1, l2 = self.line[0], self.line[1]

        for track in active_tracks:
            if track.track_id in self.counted_ids:
                continue

            if len(track.trajectory) < 2:
                continue

            # Check recent trajectory points
            prev_pt = (track.trajectory[-2][0], track.trajectory[-2][1])
            curr_pt = (track.trajectory[-1][0], track.trajectory[-1][1])

            if self._intersects(prev_pt, curr_pt, l1, l2):
                self.counted_ids.add(track.track_id)
                self.total_count += 1

                # Class breakdown
                cls = track.class_name.lower()
                if cls in ["van", "pickup", "lorry"]:
                    cls = "truck"
                elif cls in ["coach", "minibus"]:
                    cls = "bus"
                elif cls in ["motorbike", "scooter"]:
                    cls = "motorcycle"
                elif cls in ["bike", "cyclist"]:
                    cls = "bicycle"

                if cls in self.class_counts:
                    self.class_counts[cls] += 1
                else:
                    self.class_counts[cls] = 1

                # Determine IN vs OUT relative to line normal vector
                dx = curr_pt[0] - prev_pt[0]
                dy = curr_pt[1] - prev_pt[1]
                
                # Cross product with line vector to determine side crossing
                side = (l2[0] - l1[0]) * dy - (l2[1] - l1[1]) * dx
                if side > 0:
                    self.direction_counts["IN"] += 1
                else:
                    self.direction_counts["OUT"] += 1

    def get_summary(self) -> Dict[str, Any]:
        return {
            "total_vehicles": self.total_count,
            "class_counts": self.class_counts,
            "direction_counts": self.direction_counts,
            "line": self.line
        }
