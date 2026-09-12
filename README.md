# Intelligent Traffic Monitoring System

A production-grade, end-to-end computer vision application for analyzing recorded traffic videos using **Ultralytics YOLO** vehicle detection, **explicit 2D Kalman Filter** multi-object tracking, **Hungarian Algorithm** data association, traffic analytics, and a modern dark control-room web dashboard.

---

## 🚀 Key Features

1. **Video Upload & Processing**: Supports `.mp4`, `.avi`, `.mov`, `.mkv` files. Real-time background job execution with WebSocket progress reporting (frames processed, current FPS, ETA).
2. **YOLO Vehicle Detection**: Detects cars, buses, trucks, motorcycles, and bicycles with configurable confidence thresholds.
3. **Explicit Kalman Filter Tracking**: Predicts vehicle positions across frames using a constant-velocity motion model ($x = [x, y, v_x, v_y]^T$).
4. **Hungarian Algorithm Association**: Associates detections to active Kalman tracks based on Euclidean distance cost matrices via SciPy's `linear_sum_assignment`.
5. **Persistent Vehicle IDs**: Maintains unique tracking IDs across occlusions and missing frames for up to a configurable threshold (`MAX_MISSED_FRAMES`).
6. **Trajectory Visualization**: Renders motion history tails and bounding boxes on processed output video.
7. **Virtual Line Vehicle Counting**: Counts vehicles crossing customizable virtual lines without duplicate counts.
8. **Direction Detection**: Maps trajectory displacement vectors to cardinal directions (`EAST`, `WEST`, `NORTH`, `SOUTH`).
9. **Polygon-Based Lane Analysis**: Assigns vehicle centroids to custom or automatic lane region polygons.
10. **Calibrated Speed Estimation**: Estimates speed in km/h using trajectory displacement and frame rate when `PIXELS_PER_METER` calibration scale is provided.
11. **Traffic Density & Congestion Engine**: Classifies traffic density (`LOW`, `MEDIUM`, `HIGH`) and evaluates congestion status (`NORMAL`, `MODERATE`, `HEAVY`).
12. **Traffic Violations & Alerts**: Detects wrong-way vehicles and restricted zone entry violations.
13. **Database Fallback**: Integrates MongoDB with an automatic local JSON/memory fallback repository so the application works out-of-the-box with zero setup.
14. **Modern React Dashboard**: Dark control-room UI built with React 18, TypeScript, Tailwind CSS, Recharts, and Lucide icons.

---

## 🏗️ Architecture

```
Recorded Traffic Video (.mp4 / .avi / .mov)
                     ↓
       FastAPI Async Upload & Metadata Extraction
                     ↓
        Frame-by-Frame Processing Worker
                     ↓
       Ultralytics YOLO Vehicle Detection
                     ↓
     Explicit 2D Kalman Filter State Prediction
                     ↓
 Hungarian Algorithm Association (Distance Matrix)
                     ↓
   Persistent Track Maintenance & Trajectory Tail
                     ↓
           Traffic Analytics Engine
  ┌──────────────────┬──────────────────┬──────────────────┐
  │  Line Counting   │ Speed Estimation │ Traffic Density  │
  ├──────────────────┼──────────────────┼──────────────────┤
  │  Lane Assignment │ Direction Vector │ Wrong-Way Alerts │
  └──────────────────┴──────────────────┴──────────────────┘
                     ↓
  OpenCV Video Overlay & ffmpeg H.264 Web Encoder
                     ↓
     MongoDB / Local Repository Persistence
                     ↓
   FastAPI REST Endpoints & WebSocket Progress Server
                     ↓
  React 18 + TypeScript Control-Room Dashboard
```

---

## 📐 Mathematical Foundations

### 1. Explicit 2D Kalman Filter
The tracking system represents state vector $x = [x, y, v_x, v_y]^T$ where $(x,y)$ is the vehicle bounding box centroid and $(v_x, v_y)$ is velocity.

* **State Transition Equation**:
  $$\hat{x}_{k|k-1} = F \hat{x}_{k-1|k-1}$$
  $$F = \begin{bmatrix} 1 & 0 & \Delta t & 0 \\ 0 & 1 & 0 & \Delta t \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix}$$

* **Covariance Prediction**:
  $$P_{k|k-1} = F P_{k-1|k-1} F^T + Q$$

* **State Update with YOLO Measurement** $z_k = [x_{det}, y_{det}]^T$:
  $$y_k = z_k - H \hat{x}_{k|k-1}, \quad H = \begin{bmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \end{bmatrix}$$
  $$S_k = H P_{k|k-1} H^T + R$$
  $$K_k = P_{k|k-1} H^T S_k^{-1}$$
  $$\hat{x}_{k|k} = \hat{x}_{k|k-1} + K_k y_k$$
  $$P_{k|k} = (I - K_k H) P_{k|k-1}$$

### 2. Hungarian Algorithm Association
Computes Euclidean distance matrix $C_{i,j} = \sqrt{(x_{pred,i} - x_{det,j})^2 + (y_{pred,i} - y_{det,j})^2}$ between predicted track positions and detected object centroids. SciPy's `linear_sum_assignment` finds the globally optimal assignment minimizing total distance.

---

## 🛠️ Project Structure

```
traffic/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app entrypoint
│   │   ├── config.py                 # Configuration settings
│   │   ├── api/                      # REST & WebSocket endpoints
│   │   ├── detection/                # YOLO detector module
│   │   ├── tracking/                 # Kalman Filter & Hungarian Tracker
│   │   ├── analytics/                # Master Analytics Engine
│   │   ├── services/                 # Video processing worker & overlays
│   │   └── database/                 # MongoDB & Memory fallback repository
│   ├── uploads/                      # Uploaded input video storage
│   ├── outputs/                      # Processed H.264 MP4 videos
│   ├── sample_videos/                # Synthetic traffic videos
│   ├── tests/                        # Backend unit & integration test suite
│   ├── generate_sample_video.py      # Synthetic traffic video generator
│   └── requirements.txt              # Python package dependencies
├── frontend/
│   ├── src/
│   │   ├── components/               # Header, Sidebar, VideoPlayer, Progress
│   │   ├── pages/                    # Dashboard, Analysis, Analytics, Vehicles, Alerts
│   │   ├── services/                 # Axios API & WebSocket wrapper
│   │   └── types/                    # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── README.md
└── docker-compose.yml
```

---

## ⚙️ Installation & Running Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & NPM
- FFmpeg (`brew install ffmpeg` on macOS)

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

To generate a sample traffic video for testing:
```bash
python generate_sample_video.py
```

Run backend unit tests:
```bash
PYTHONPATH=app pytest tests
```

Start the FastAPI backend server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📝 Important Limitations & Calibration

1. **Speed Calibration**: Real-world speed estimation requires setting `PIXELS_PER_METER` based on camera height and road geometry. If left uncalibrated, the system explicitly displays *"Calibration required"*.
2. **Camera Angle**: Optimum results are achieved with static, elevated traffic cameras overlooking multi-lane roads.
3. **Occlusions**: Vehicles fully occluded for longer than `MAX_MISSED_FRAMES` will be assigned a new ID upon reappearance.
