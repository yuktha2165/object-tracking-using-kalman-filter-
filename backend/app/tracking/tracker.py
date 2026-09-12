from typing import List, Dict, Any
from app.tracking.track import Track
from app.tracking.association import associate_detections_to_tracks
from app.config import settings

class MultiObjectTracker:
    def __init__(
        self,
        max_missed_frames: int = settings.MAX_MISSED_FRAMES,
        max_distance: float = settings.MAX_ASSOCIATION_DISTANCE,
        max_trajectory_points: int = settings.MAX_TRAJECTORY_POINTS,
        confidence_threshold: float = settings.CONFIDENCE_THRESHOLD
    ):
        self.tracks: List[Track] = []
        self.max_missed_frames = max_missed_frames
        self.max_distance = max_distance
        self.max_trajectory_points = max_trajectory_points
        self.confidence_threshold = confidence_threshold

    def reset(self):
        """Reset tracker state and ID counter."""
        self.tracks.clear()
        Track.reset_id_counter()

    def update(self, detections: List[Dict[str, Any]], frame_idx: int) -> List[Track]:
        """
        Process a single frame of YOLO detections:
        1. Predict next state for all active tracks using Kalman filter.
        2. Associate predicted tracks with detections via Hungarian algorithm.
        3. Update matched tracks with measurement.
        4. Handle missed tracks.
        5. Create new tracks for unmatched detections above confidence threshold.
        """
        # Step 1: Predict position for all active tracks
        active_tracks = [t for t in self.tracks if t.status not in ["REMOVED", "DELETED"]]
        for track in active_tracks:
            track.predict()

        # Step 2: Hungarian algorithm association
        matches, unmatched_tracks_idx, unmatched_detections_idx = associate_detections_to_tracks(
            active_tracks, detections, max_distance=self.max_distance
        )

        # Step 3: Update matched tracks
        for track_idx, det_idx in matches:
            track = active_tracks[track_idx]
            det = detections[det_idx]
            track.update(
                bbox=det['bbox'],
                class_name=det['class_name'],
                confidence=det['confidence'],
                frame_idx=frame_idx
            )

        # Step 4: Handle unmatched tracks
        for track_idx in unmatched_tracks_idx:
            track = active_tracks[track_idx]
            track.mark_missed(max_missed=self.max_missed_frames)

        # Step 5: Handle unmatched detections (create new tracks)
        for det_idx in unmatched_detections_idx:
            det = detections[det_idx]
            if det['confidence'] >= self.confidence_threshold:
                new_track = Track(
                    class_name=det['class_name'],
                    bbox=det['bbox'],
                    confidence=det['confidence'],
                    frame_idx=frame_idx,
                    max_trajectory_points=self.max_trajectory_points
                )
                self.tracks.append(new_track)

        # Return list of currently valid active tracks
        return [t for t in self.tracks if t.status not in ["REMOVED", "DELETED"]]

    def propagate_skipped_frame(self, frame_idx: int) -> List[Track]:
        """Propagate state for active tracks on skipped frame without running object detector."""
        active_tracks = [t for t in self.tracks if t.status not in ["REMOVED", "DELETED"]]
        for track in active_tracks:
            track.propagate_skipped_frame(frame_idx)
        return active_tracks


