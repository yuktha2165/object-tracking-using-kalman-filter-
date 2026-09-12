import numpy as np

class KalmanFilter2D:
    """
    Explicit 2D Kalman Filter tracking position (x, y) and velocity (vx, vy).
    State vector x = [x, y, vx, vy]^T
    Measurement vector z = [x, y]^T
    """
    def __init__(self, init_x: float, init_y: float, dt: float = 1.0, std_acc: float = 3.0, std_meas: float = 0.5):
        self.dt = dt
        
        # State vector: [x, y, vx, vy]
        self.x = np.array([[init_x], [init_y], [0.0], [0.0]], dtype=np.float32)
        
        # State transition matrix F
        self.F = np.array([
            [1, 0, dt, 0],
            [0, 1, 0, dt],
            [0, 0, 1,  0],
            [0, 0, 0,  1]
        ], dtype=np.float32)
        
        # Measurement matrix H
        self.H = np.array([
            [1, 0, 0, 0],
            [0, 1, 0, 0]
        ], dtype=np.float32)
        
        # Initial covariance matrix P
        self.P = np.diag([10.0, 10.0, 100.0, 100.0]).astype(np.float32)
        
        # Process noise covariance Q (discrete constant acceleration model)
        dt2 = dt ** 2
        dt3 = dt ** 3 / 2.0
        dt4 = dt ** 4 / 4.0
        q1 = np.array([
            [dt4, 0, dt3, 0],
            [0, dt4, 0, dt3],
            [dt3, 0, dt2, 0],
            [0, dt3, 0, dt2]
        ], dtype=np.float32)
        self.Q = q1 * (std_acc ** 2)
        
        # Measurement noise covariance R
        self.R = np.eye(2, dtype=np.float32) * (std_meas ** 2)

    def predict(self) -> np.ndarray:
        """Predict state and covariance for next frame."""
        self.x = np.dot(self.F, self.x)
        self.P = np.dot(np.dot(self.F, self.P), self.F.T) + self.Q
        return self.get_position()

    def update(self, z_x: float, z_y: float) -> np.ndarray:
        """Update state estimate with actual detection measurement z = [z_x, z_y]^T."""
        z = np.array([[z_x], [z_y]], dtype=np.float32)
        y = z - np.dot(self.H, self.x) # Innovation
        S = np.dot(np.dot(self.H, self.P), self.H.T) + self.R # Innovation covariance
        K = np.dot(np.dot(self.P, self.H.T), np.linalg.inv(S)) # Kalman gain
        
        self.x = self.x + np.dot(K, y)
        I = np.eye(self.P.shape[0], dtype=np.float32)
        self.P = np.dot(I - np.dot(K, self.H), self.P)
        return self.get_position()

    def get_position(self) -> np.ndarray:
        """Returns current estimated (x, y) centroid."""
        return np.array([float(self.x[0, 0]), float(self.x[1, 0])], dtype=np.float32)

    def get_velocity(self) -> np.ndarray:
        """Returns current estimated velocity (vx, vy)."""
        return np.array([float(self.x[2, 0]), float(self.x[3, 0])], dtype=np.float32)
