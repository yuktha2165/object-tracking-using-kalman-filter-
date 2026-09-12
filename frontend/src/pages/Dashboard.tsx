import React, { useState } from 'react';
import { 
  Video, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Compass,
  Gauge,
  Eye,
  GitCommit,
  Share2,
  Layers,
  Play,
  Sliders,
  Sparkles
} from 'lucide-react';
import { ViewPage } from '../types';

interface DashboardProps {
  onSelectView: (view: ViewPage) => void;
  onSelectSession?: (sessionId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectView }) => {
  // Active Category Filter for Models & Mechanisms
  const [activeCategory, setActiveCategory] = useState<'all' | 'detection' | 'tracking' | 'analytics' | 'safety' | 'streaming'>('all');

  // Comprehensive Models & Mechanisms Catalog
  const mechanisms = [
    {
      id: 'yolo',
      category: 'detection',
      name: 'YOLOv8 / YOLOv11 Neural Detector',
      subtitle: 'Single-Stage Anchor-Free Convolutional Object Detection',
      icon: Eye,
      badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
      description: 'Employs a CSPDarknet backbone paired with C2f feature integration and PAN-FPN neck. Features Task-Aligned One-Stage Object Detection (TOOD) loss for simultaneous bounding box regression and class scoring.',
      highlights: [
        'Multi-class detection: Cars, Buses, Trucks, Motorcycles, Bicycles',
        'Specialized heavy-vehicle priority scoring & confidence tuning',
        'High-throughput GPU/MPS hardware inference (>60 FPS)'
      ],
      techSpecs: 'Architecture: CSPDarknet • Loss: CIoU + DFL • Resolution: 640x640 / Native'
    },
    {
      id: 'rtdetr',
      category: 'detection',
      name: 'RT-DETR (Real-Time Detection Transformer)',
      subtitle: 'End-to-End Vision Transformer with Deformable Attention',
      icon: Cpu,
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
      description: 'First real-time end-to-end vision transformer. Combines an efficient hybrid encoder (AIFI intra-scale interaction + CCFM cross-scale fusion) and query-based transformer decoder, completely removing NMS post-processing.',
      highlights: [
        'Zero Non-Maximum Suppression (NMS) latency bottlenecks',
        'Exceptional accuracy under dense traffic & heavy vehicle overlap',
        'Direct bipartite set prediction loss with Hungarian matching'
      ],
      techSpecs: 'Encoder: AIFI + CCFM • Decoder: Deformable Transformer • Set Matching Loss'
    },
    {
      id: 'kalman',
      category: 'tracking',
      name: '8-State Extended Kalman Filter',
      subtitle: 'Continuous Motion Modeling & Centroid Covariance Estimation',
      icon: Compass,
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      description: 'Models vehicle trajectory state dynamics using an 8-dimensional state vector x = [x, y, a, h, ẋ, ẏ, ȧ, ḣ]ᵀ under discrete constant-velocity assumptions. Predicts position across missing frames and filters out detector jitter.',
      highlights: [
        'State space: (x, y) center, aspect ratio a, height h, and 4 velocity components',
        'Smooths motion paths and mitigates bounding box camera vibration',
        'Maintains target position estimates during temporary visual occlusions'
      ],
      techSpecs: 'State: 8D Vector • Motion Model: Constant Velocity • Process: Discrete Gaussian Noise'
    },
    {
      id: 'bytetrack',
      category: 'tracking',
      name: 'ByteTrack & Hungarian Data Association',
      subtitle: 'Two-Stage Bipartite Matching with Low-Score Recall',
      icon: GitCommit,
      badgeColor: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
      description: 'Associates detections with active tracks using cost matrices combining IoU distance, centroid proximity, and soft classification consistency. Two-stage matching keeps low-confidence detections during partial occlusions.',
      highlights: [
        'Stage 1: High-confidence boxes (conf ≥ τ_high) matched via Hungarian Algorithm',
        'Stage 2: Unmatched tracks matched with low-confidence boxes to avoid track fragmentation',
        'Sequential persistent Vehicle IDs (#01, #02...) with interactive operator tagging'
      ],
      techSpecs: 'Matching: Munkres Linear Sum Assignment • Metric: Cost Matrix (1 - IoU + Pen_class)'
    },
    {
      id: 'counting',
      category: 'analytics',
      name: 'Virtual Line Counting & Ray-Casting',
      subtitle: 'Deterministic 2-Frame Segment Line Intersection Testing',
      icon: Activity,
      badgeColor: 'border-teal-500/30 bg-teal-500/10 text-teal-400',
      description: 'Calculates directional passage by testing line segment intersection between the vehicle 2-frame centroid vector [P_{t-1}, P_t] and the calibrated virtual counting line segment [L_A, L_B] using vector orientation cross products.',
      highlights: [
        'Prevents double-counting and phantom counts from jitter',
        'Direction-sensitive: Verifies entry and exit flow vector orientation',
        'Real-time class-wise accumulation (Cars, Buses, Trucks, Two-Wheelers)'
      ],
      techSpecs: 'Method: 2D Cross-Product Line Segment Intersection • Filter: Single-Event State'
    },
    {
      id: 'speed',
      category: 'analytics',
      name: 'Optical Speed Estimation & Calibration',
      subtitle: 'Perspective Homography & Exponential Moving Average (EMA)',
      icon: Gauge,
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      description: 'Transforms image-plane pixel displacement into real-world metric distances via calibrated pixels-per-meter (PPM) scaling: d = √(Δx² + Δy²) / PPM. Speed v = (d / Δt) × 3.6 km/h is filtered using an Exponential Moving Average (α = 0.35).',
      highlights: [
        'Configurable Pixels-Per-Meter (PPM) camera calibration factor',
        'Adaptive FPS delta timing ensures accurate speeds on variable framerates',
        'EMA smoothing eliminates erratic instantaneous velocity spikes'
      ],
      techSpecs: 'Formula: v = (Δd / Δt) × 3.6 km/h • Smoothing: EMA (α = 0.35) • Unit: km/h'
    },
    {
      id: 'density',
      category: 'analytics',
      name: 'Lane Occupancy & Density Classification',
      subtitle: 'Point-in-Polygon (PIP) Spatial Road Utilization',
      icon: Layers,
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
      description: 'Determines vehicle lane occupancy via Ray-Casting Point-in-Polygon tests against calibrated road polygon boundaries. Computes road spatial density ratio and classifies traffic state into Level of Service (LOS) tiers.',
      highlights: [
        'Dynamic multi-lane vehicle allocation (Lane 1, 2, 3...)',
        'Density categorization: Free Flow, Normal, Moderate, High Congestion',
        'Real-time lane utilization distribution bar metrics'
      ],
      techSpecs: 'Spatial Algorithm: Jordan Curve Ray-Casting • Output: Lane ID + Density %'
    },
    {
      id: 'violations',
      category: 'safety',
      name: 'Wrong-Way & Incident Detection Vector Engine',
      subtitle: 'Cosine Similarity Directional Alignment & Safety Triggers',
      icon: ShieldCheck,
      badgeColor: 'border-red-500/30 bg-red-500/10 text-red-400',
      description: 'Monitors vehicle direction by computing the motion unit vector v̂ and evaluating the dot product with the predefined road corridor vector û: cos(θ) = v̂ · û. Flagged as wrong-way violation when cos(θ) < -0.5 (divergence > 120°).',
      highlights: [
        'Wrong-way driving detection with persistent multi-frame confirmation',
        'Overspeeding threshold alerts with vehicle ID and speed telemetry',
        'Stationary vehicle / bottleneck queue detection in active traffic lanes'
      ],
      techSpecs: 'Vector Metric: cos(θ) = v̂ · û • Threshold: cos(θ) < -0.5 • Multi-Frame Validation'
    },
    {
      id: 'streaming',
      category: 'streaming',
      name: 'Bi-Directional WebSocket Telemetry Engine',
      subtitle: 'Full-Duplex Asynchronous Video-Sync & Telemetry Streaming',
      icon: Share2,
      badgeColor: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
      description: 'Facilitates real-time, low-latency communication between FastAPI async event loops and the React browser client. Streams frame metadata, bounding coordinates, vehicle classes, speeds, and alerts concurrently with video playback.',
      highlights: [
        'Bi-directional time-synchronization keeping inference aligned with HTML5 video',
        'Live client controls: Dynamic confidence threshold, missed frames, & calibration updates',
        'Mathematical letterbox/pillarbox coordinate calibration for object-contain scaling'
      ],
      techSpecs: 'Protocol: RFC 6455 WebSockets • Format: Structured JSON Telemetry + Binary Frame Sync'
    }
  ];

  const filteredMechanisms = activeCategory === 'all' 
    ? mechanisms 
    : mechanisms.filter(m => m.category === activeCategory);

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#0a111a] min-h-screen text-slate-100 font-sans max-w-7xl mx-auto">
      
      {/* 1. PROJECT DESCRIPTION HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1b2b3f] bg-gradient-to-br from-[#0e1b2b] via-[#09121d] to-[#070d15] p-8 md:p-10 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Badges & Quick Action */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span>Intelligent Transportation Systems (ITS)</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <Cpu className="w-3.5 h-3.5" />
                <span>Computer Vision & Deep Learning</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                <Zap className="w-3.5 h-3.5" />
                <span>Real-Time Processing</span>
              </span>
            </div>

            <button
              onClick={() => onSelectView('video-analysis')}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-orange-500/20 transition cursor-pointer shrink-0"
            >
              <Video className="w-4 h-4" />
              <span>Open Video Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title & Tagline */}
          <div className="space-y-3">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
              Intelligent Traffic Monitoring & Analysis System
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-4xl leading-relaxed">
              An enterprise-grade, end-to-end computer vision and intelligent telemetry platform designed for continuous traffic surveillance. Leveraging deep neural detectors, Kalman-filter multi-object tracking, and automated flow analytics, the system transforms raw video feeds into actionable real-time traffic intelligence.
            </p>
          </div>

          {/* Core Highlights Quick Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#18293d]">
            <div className="p-3 rounded-xl bg-[#0b1523] border border-[#18293d]">
              <span className="text-[11px] text-slate-400 block font-medium">Neural Models</span>
              <span className="text-sm font-bold text-white mt-0.5 block">YOLOv8 & RT-DETR</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1523] border border-[#18293d]">
              <span className="text-[11px] text-slate-400 block font-medium">Tracking Engine</span>
              <span className="text-sm font-bold text-white mt-0.5 block">ByteTrack + 8D Kalman</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1523] border border-[#18293d]">
              <span className="text-[11px] text-slate-400 block font-medium">Telemetry Latency</span>
              <span className="text-sm font-bold text-emerald-400 mt-0.5 block">&lt; 35ms (WebSocket)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0b1523] border border-[#18293d]">
              <span className="text-[11px] text-slate-400 block font-medium">Safety Violations</span>
              <span className="text-sm font-bold text-orange-400 mt-0.5 block">Wrong-Way & Speeding</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MODELS & MECHANISMS ARCHITECTURE SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-5 rounded-full bg-orange-500 inline-block" />
              <h2 className="text-xl font-bold text-white tracking-tight">AI Models & Core Mechanisms</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Architectures, algorithmic mechanisms, mathematical models, and telemetry pipelines utilized in the system
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#0c1624] p-1.5 rounded-xl border border-[#18293d]">
            {[
              { id: 'all', label: 'All' },
              { id: 'detection', label: 'Detection Models' },
              { id: 'tracking', label: 'Tracking Engine' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'safety', label: 'Safety & Alerts' },
              { id: 'streaming', label: 'Streaming' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mechanisms Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMechanisms.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id}
                className="rounded-2xl border border-[#192c43] bg-[#0c1624] p-5 flex flex-col justify-between hover:border-slate-600 transition group hover:shadow-xl shadow-slate-950/50"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl border ${item.badgeColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Highlights Bullet Points */}
                  <div className="space-y-1.5 pt-1">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-start space-x-2 text-[11px] text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0" />
                        <span className="leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Specs Footer */}
                <div className="mt-5 pt-3 border-t border-[#162536] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="truncate">{item.techSpecs}</span>
                  <span className="text-orange-400/80 uppercase font-semibold shrink-0 ml-2">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. GO TO VIDEO ANALYSIS WORKSPACE CTA SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1e3450] bg-gradient-to-r from-[#0d1c2d] via-[#0e1726] to-[#121c2b] p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-semibold text-orange-400">
              <Sparkles className="w-4 h-4" />
              <span>Live AI Inference Engine</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Ready to Analyze Traffic Surveillance Footage?
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Launch the dedicated Video Analysis Workspace to upload video recordings, connect live RTSP/Webcam feeds, fine-tune confidence & calibration parameters, and monitor live telemetry with synchronized overlays.
            </p>
          </div>

          <button
            onClick={() => onSelectView('video-analysis')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold flex items-center space-x-2.5 shadow-xl shadow-orange-500/25 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Video className="w-5 h-5" />
            <span>Go to Video Analysis Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
