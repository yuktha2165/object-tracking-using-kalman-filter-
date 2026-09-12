import numpy as np
from scipy.optimize import linear_sum_assignment
from typing import List, Tuple, Dict, Any
from app.tracking.track import Track

def compute_iou_matrix(boxes1: np.ndarray, boxes2: np.ndarray) -> np.ndarray:
    """
    Vectorized IoU calculation between N track bboxes [N, 4] and M detection bboxes [M, 4].
    Boxes format: [x1, y1, x2, y2]
    """
    if len(boxes1) == 0 or len(boxes2) == 0:
        return np.zeros((len(boxes1), len(boxes2)), dtype=np.float32)

    b1_x1, b1_y1, b1_x2, b1_y2 = boxes1[:, 0:1], boxes1[:, 1:2], boxes1[:, 2:3], boxes1[:, 3:4]
    b2_x1, b2_y1, b2_x2, b2_y2 = boxes2[:, 0], boxes2[:, 1], boxes2[:, 2], boxes2[:, 3]

    inter_x1 = np.maximum(b1_x1, b2_x1)
    inter_y1 = np.maximum(b1_y1, b2_y1)
    inter_x2 = np.minimum(b1_x2, b2_x2)
    inter_y2 = np.minimum(b1_y2, b2_y2)

    inter_area = np.maximum(0.0, inter_x2 - inter_x1) * np.maximum(0.0, inter_y2 - inter_y1)
    area1 = (b1_x2 - b1_x1) * (b1_y2 - b1_y1)
    area2 = (b2_x2 - b2_x1) * (b2_y2 - b2_y1)

    union_area = area1 + area2 - inter_area
    iou = inter_area / np.maximum(union_area, 1e-6)
    return iou.astype(np.float32)

def associate_detections_to_tracks(
    tracks: List[Track],
    detections: List[Dict[str, Any]],
    max_distance: float = 120.0
) -> Tuple[List[Tuple[int, int]], List[int], List[int]]:
    """
    Associates existing active tracks with current frame YOLO detections using Hungarian algorithm
    over a vectorized hybrid cost matrix (Centroid Distance + 1-IoU).
    """
    if len(tracks) == 0:
        return [], [], list(range(len(detections)))
    if len(detections) == 0:
        return [], list(range(len(tracks))), []

    # 1. Extract centroids & bboxes as NumPy arrays
    track_centroids = np.array([t.centroid for t in tracks], dtype=np.float32) # [N, 2]
    det_centroids = np.array([d['centroid'] for d in detections], dtype=np.float32) # [M, 2]

    track_boxes = np.array([t.bbox for t in tracks], dtype=np.float32) # [N, 4]
    det_boxes = np.array([d['bbox'] for d in detections], dtype=np.float32) # [M, 4]

    # 2. Vectorized Centroid Distance Matrix
    diff = track_centroids[:, np.newaxis, :] - det_centroids[np.newaxis, :, :] # [N, M, 2]
    dist_matrix = np.sqrt(np.sum(diff ** 2, axis=2)) # [N, M]

    # 3. Vectorized IoU Matrix
    iou_matrix = compute_iou_matrix(track_boxes, det_boxes) # [N, M]
    iou_cost = (1.0 - iou_matrix) * max_distance # Convert IoU to distance scale

    # 4. Hybrid Cost Matrix (70% Centroid Distance + 30% Bounding Box IoU Cost)
    cost_matrix = 0.7 * dist_matrix + 0.3 * iou_cost

    # 5. Class consistency penalty
    track_classes = [t.class_name for t in tracks]
    det_classes = [d['class_name'] for d in detections]
    for i, t_cls in enumerate(track_classes):
        for j, d_cls in enumerate(det_classes):
            if t_cls != d_cls:
                cost_matrix[i, j] += 35.0 # Mismatch penalty

    # 6. Run Hungarian Algorithm
    row_ind, col_ind = linear_sum_assignment(cost_matrix)

    matches = []
    unmatched_tracks = set(range(len(tracks)))
    unmatched_detections = set(range(len(detections)))

    for r, c in zip(row_ind, col_ind):
        if dist_matrix[r, c] <= max_distance or iou_matrix[r, c] > 0.2:
            matches.append((r, c))
            unmatched_tracks.discard(r)
            unmatched_detections.discard(c)

    return matches, list(unmatched_tracks), list(unmatched_detections)

