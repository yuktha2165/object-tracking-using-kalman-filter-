import os
import urllib.request
import cv2
import numpy as np
from app.config import settings

SAMPLE_URL = "https://github.com/intel-iot-devkit/sample-videos/raw/master/car-detection.mp4"

def generate_sample_traffic_video(output_path: str):
    """
    Downloads a real traffic video clip or generates a synthetic traffic video fallback.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print(f"Fetching sample traffic video -> {output_path}")
    try:
        urllib.request.urlretrieve(SAMPLE_URL, output_path)
        if os.path.exists(output_path) and os.path.getsize(output_path) > 100000:
            print("Successfully downloaded real traffic video sample!")
            return
    except Exception as e:
        print(f"Could not download online sample video ({e}), falling back to synthetic generator...")

    # Synthetic fallback
    width, height = 1280, 720
    fps = 30
    duration_sec = 10
    total_frames = duration_sec * fps
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    vehicles = [
        {"id": 1, "type": "car", "color": (245, 130, 48), "w": 70, "h": 40, "pos": [50.0, 200.0], "speed": [7.5, 0.0]},
        {"id": 2, "type": "truck", "color": (0, 130, 200), "w": 120, "h": 50, "pos": [10.0, 320.0], "speed": [5.2, 0.0]},
        {"id": 3, "type": "bus", "color": (60, 180, 75), "w": 130, "h": 55, "pos": [1280.0, 450.0], "speed": [-6.0, 0.0]},
        {"id": 4, "type": "motorcycle", "color": (145, 30, 180), "w": 40, "h": 25, "pos": [150.0, 230.0], "speed": [9.0, 0.0]},
        {"id": 5, "type": "car", "color": (230, 25, 75), "w": 68, "h": 38, "pos": [300.0, 580.0], "speed": [6.5, 0.0]}
    ]

    for frame_idx in range(total_frames):
        frame = np.full((height, width, 3), (40, 45, 52), dtype=np.uint8)
        cv2.rectangle(frame, (0, 150), (width, 650), (55, 60, 68), -1)
        for y_lane in [300, 450]:
            for x_dash in range(0, width, 60):
                cv2.line(frame, (x_dash, y_lane), (x_dash + 35, y_lane), (220, 220, 220), 2)
        cv2.line(frame, (0, 150), (width, 150), (255, 255, 255), 3)
        cv2.line(frame, (0, 650), (width, 650), (255, 255, 255), 3)
        cv2.line(frame, (640, 150), (640, 650), (0, 0, 220), 2)

        for v in vehicles:
            vx, vy = v["speed"]
            v["pos"][0] += vx
            v["pos"][1] += vy
            if v["pos"][0] > width + 150:
                v["pos"][0] = -150.0
            elif v["pos"][0] < -150:
                v["pos"][0] = width + 150.0
            x = int(v["pos"][0])
            y = int(v["pos"][1])
            w_box, h_box = v["w"], v["h"]
            cv2.rectangle(frame, (x, y), (x + w_box, y + h_box), v["color"], -1)
            cv2.rectangle(frame, (x, y), (x + w_box, y + h_box), (255, 255, 255), 2)

        out.write(frame)

    out.release()
    print("Synthetic video generation complete!")

if __name__ == "__main__":
    out_file = os.path.join(settings.SAMPLE_DIR, "sample_traffic.mp4")
    generate_sample_traffic_video(out_file)
