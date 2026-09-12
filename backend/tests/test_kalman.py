import pytest
import numpy as np
from app.tracking.kalman_filter import KalmanFilter2D
from app.tracking.track import Track
from app.tracking.association import associate_detections_to_tracks

def test_kalman_filter_predict_update():
    kf = KalmanFilter2D(init_x=100.0, init_y=200.0)
    
    # Initial position check
    pos = kf.get_position()
    assert abs(pos[0] - 100.0) < 1e-3
    assert abs(pos[1] - 200.0) < 1e-3

    # Predict step
    pred_pos = kf.predict()
    assert pred_pos is not None

    # Update step with measurement (105, 205)
    upd_pos = kf.update(105.0, 205.0)
    assert upd_pos[0] > 100.0
    assert upd_pos[1] > 200.0

def test_track_lifecycle():
    track = Track(class_name="car", bbox=[10.0, 10.0, 50.0, 50.0], confidence=0.9, frame_idx=0)
    assert track.track_id > 0
    assert track.status == "NEW"
    assert len(track.trajectory) == 1

    # Predict & update
    track.predict()
    track.update(bbox=[15.0, 15.0, 55.0, 55.0], class_name="car", confidence=0.92, frame_idx=1)
    assert len(track.trajectory) == 2
    assert track.missed_frames == 0
    assert track.status in ("CONFIRMED", "TRACKING")

    # Missed detection
    track.mark_missed(max_missed=3)
    assert track.status == "TEMPORARILY_LOST"
    assert track.missed_frames == 1

    track.mark_missed(max_missed=3)
    track.mark_missed(max_missed=3)
    assert track.status == "REMOVED"

def test_hungarian_association():
    t1 = Track(class_name="car", bbox=[10.0, 10.0, 50.0, 50.0], confidence=0.9, frame_idx=0)
    t2 = Track(class_name="bus", bbox=[300.0, 300.0, 400.0, 400.0], confidence=0.85, frame_idx=0)
    
    tracks = [t1, t2]
    
    detections = [
        {"class_name": "car", "bbox": [12.0, 12.0, 52.0, 52.0], "centroid": (32.0, 32.0), "confidence": 0.95},
        {"class_name": "bus", "bbox": [305.0, 305.0, 405.0, 405.0], "centroid": (355.0, 355.0), "confidence": 0.88}
    ]

    matches, unmatched_tracks, unmatched_dets = associate_detections_to_tracks(tracks, detections, max_distance=100.0)
    assert len(matches) == 2
    assert len(unmatched_tracks) == 0
    assert len(unmatched_dets) == 0

def test_hungarian_distance_gating():
    # Track at (30, 30)
    t1 = Track(class_name="car", bbox=[10.0, 10.0, 50.0, 50.0], confidence=0.9, frame_idx=0)
    tracks = [t1]

    # Detection absurdly far away at (800, 800)
    distant_detection = [
        {"class_name": "car", "bbox": [780.0, 780.0, 820.0, 820.0], "centroid": (800.0, 800.0), "confidence": 0.9}
    ]

    matches, unmatched_tracks, unmatched_dets = associate_detections_to_tracks(tracks, distant_detection, max_distance=90.0)
    # Match MUST be rejected due to MAX_ASSOCIATION_DISTANCE gate
    assert len(matches) == 0
    assert 0 in unmatched_tracks
    assert 0 in unmatched_dets

def test_track_confidence_decay_and_removal():
    track = Track(class_name="car", bbox=[10.0, 10.0, 50.0, 50.0], confidence=0.22, frame_idx=0)
    # Missed frame decays confidence below 0.20 threshold (0.22 * 0.85 = 0.187) and marks track REMOVED
    track.mark_missed(max_missed=15)
    assert track.confidence < 0.20
    assert track.status == "REMOVED"

