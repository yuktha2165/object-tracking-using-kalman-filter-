import math
from typing import Tuple
from app.tracking.track import Track

def estimate_direction(track: Track, min_displacement: float = 15.0) -> str:
    """
    Determines vehicle movement direction from its trajectory.
    Returns cardinal direction string: NORTH, SOUTH, EAST, WEST, NORTH_EAST, NORTH_WEST, SOUTH_EAST, SOUTH_WEST, or UNKNOWN.
    """
    if len(track.trajectory) < 3:
        return track.direction

    first_pt = track.trajectory[0]
    last_pt = track.trajectory[-1]

    dx = last_pt[0] - first_pt[0]
    dy = last_pt[1] - first_pt[1]

    dist = math.sqrt(dx * dx + dy * dy)
    if dist < min_displacement:
        return track.direction

    # Image coordinates: +x is RIGHT (EAST), +y is DOWN (SOUTH)
    angle_rad = math.atan2(-dy, dx) # Invert y so +y is UP (NORTH)
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

    track.direction = dir_str
    return dir_str
