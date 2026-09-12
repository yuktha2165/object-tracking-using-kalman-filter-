import pytest
from app.tracking.track import Track
from app.analytics.counting import VehicleCounter
from app.analytics.direction import estimate_direction
from app.analytics.speed import SpeedEstimator
from app.analytics.density import DensityEstimator
from app.analytics.congestion import CongestionEngine

def test_vehicle_counter():
    line = [(100.0, 0.0), (100.0, 500.0)] # Vertical line at x = 100
    counter = VehicleCounter(line=line)

    track = Track(class_name="car", bbox=[80.0, 10.0, 95.0, 30.0], confidence=0.9, frame_idx=0)
    track.trajectory.append((87.5, 20.0, 0))
    track.trajectory.append((115.0, 20.0, 1)) # Crossed line x = 100

    counter.process_tracks([track])
    assert counter.total_count == 1
    assert counter.class_counts["car"] == 1

def test_direction_estimation():
    track = Track(class_name="truck", bbox=[10.0, 10.0, 50.0, 50.0], confidence=0.9, frame_idx=0)
    track.trajectory.clear()
    track.trajectory.append((10.0, 100.0, 0))
    track.trajectory.append((50.0, 100.0, 2))
    track.trajectory.append((100.0, 100.0, 5)) # Moving EAST

    direction = estimate_direction(track)
    assert direction == "EAST"

def test_speed_estimator():
    # Calibrated 10 pixels per meter, 30 fps
    estimator = SpeedEstimator(pixels_per_meter=10.0, fps=30.0)
    track = Track(class_name="car", bbox=[0.0, 0.0, 10.0, 10.0], confidence=0.9, frame_idx=0)
    
    # Simulate movement: 300 pixels in 30 frames (1 sec) -> 30 meters/sec = 108 km/h
    for f in range(10):
        track.trajectory.append((f * 30.0, 10.0, f * 3))

    speed = estimator.estimate_speed(track)
    assert speed is not None
    assert 90.0 < speed < 120.0

def test_speed_estimator_uncalibrated():
    estimator = SpeedEstimator(pixels_per_meter=None, fps=30.0)
    track = Track(class_name="car", bbox=[0.0, 0.0, 10.0, 10.0], confidence=0.9, frame_idx=0)
    track.trajectory.append((0.0, 0.0, 0))
    track.trajectory.append((100.0, 0.0, 10))

    speed = estimator.estimate_speed(track)
    assert speed is None

def test_density_and_congestion():
    density_est = DensityEstimator(roi_area=10000.0)
    
    tracks = [
        Track(class_name="car", bbox=[0.0, 0.0, 50.0, 50.0], confidence=0.9, frame_idx=0)
        for _ in range(15)
    ]
    
    density = density_est.calculate_density(tracks)
    assert density["status"] in ["MEDIUM", "HIGH"]

    congestion_engine = CongestionEngine()
    result = congestion_engine.evaluate(density, tracks)
    assert result["level"] in ["MODERATE", "HEAVY"]
