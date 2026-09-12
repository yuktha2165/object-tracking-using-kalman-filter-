export type ViewPage = 
  | 'dashboard'
  | 'video-analysis'
  | 'live-results'
  | 'traffic-analytics'
  | 'vehicle-tracking'
  | 'alerts'
  | 'history'
  | 'settings';

export interface VideoMetadata {
  video_id: string;
  filename: string;
  duration: number;
  fps: number;
  resolution: string;
  width: number;
  height: number;
  total_frames: number;
  size_bytes: number;
  size_mb: number;
  created_at?: string;
}

export interface ProcessingJob {
  id: string;
  video_path: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'UPLOADED';
  progress_percent: number;
  progress?: number;
  processed_frames?: number;
  current_frame: number;
  total_frames: number;
  processing_fps: number;
  processing_device?: string;
  vehicles_detected?: number;
  estimated_remaining_seconds: number;
  error?: string | null;
  created_at: string;
  updated_at: string;
  config?: any;
  summary?: any;
}

export interface VehicleTrack {
  track_id: number;
  class_name: string;
  bbox: [number, number, number, number];
  centroid: [number, number];
  velocity: [number, number];
  confidence: number;
  age: number;
  missed_frames: number;
  trajectory: Array<[number, number, number]>;
  first_seen_frame: number;
  last_seen_frame: number;
  lane: string;
  direction: string;
  speed: number | null;
  status: 'ACTIVE' | 'COASTING' | 'DELETED';
}

export interface EventAlert {
  event_type: 'WRONG_WAY' | 'ZONE_VIOLATION' | 'CONGESTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  track_id: number | null;
  class_name: string;
  frame_idx: number;
  timestamp: string;
  message: string;
  lane: string;
}

export interface TimeSeriesPoint {
  frame: number;
  timestamp: string;
  active_vehicles: number;
  total_counted: number;
  average_speed_kmh: number | null;
  occupancy_percentage: number;
  density_status: 'LOW' | 'MEDIUM' | 'HIGH';
  congestion_level: 'NORMAL' | 'MODERATE' | 'HEAVY';
}

export interface SessionAnalytics {
  video_metadata: VideoMetadata;
  summary: {
    total_vehicles: number;
    class_counts: Record<string, number>;
    direction_counts: Record<string, number>;
    lane_distribution: Record<string, number>;
    direction_distribution: Record<string, number>;
    average_speed_kmh: number | null;
    speed_calibrated: boolean;
    final_congestion: string;
    total_events: number;
  };
  time_series: TimeSeriesPoint[];
  events: EventAlert[];
}

export interface AnalysisSessionSummary {
  id: string;
  video_name: string;
  duration: number;
  fps: number;
  resolution: string;
  total_vehicles: number;
  average_speed: number | null;
  speed_calibrated: boolean;
  traffic_density: string;
  congestion: string;
  status: string;
  created_at: string;
}
