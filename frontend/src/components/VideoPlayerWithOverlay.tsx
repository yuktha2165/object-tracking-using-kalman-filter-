import React, { useEffect, useRef } from 'react';
import { Play, Pause, Square, RefreshCw, Activity, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface VideoPlayerWithOverlayProps {
  videoId: string;
  videoUrl?: string;
  tracks: any[];
  countingLine?: any;
  lanePolygons?: any;
  isAnalyzing: boolean;
  isCompleted?: boolean;
  onStartLiveAnalysis: () => void;
  onPauseAnalysis: () => void;
  onResumeAnalysis: () => void;
  onStopAnalysis: () => void;
  onSeek?: (seconds: number) => void;
  onVideoEnded?: () => void;
  videoRef: any;
}

export const VideoPlayerWithOverlay: React.FC<VideoPlayerWithOverlayProps> = ({
  videoId,
  videoUrl,
  tracks,
  countingLine,
  lanePolygons,
  isAnalyzing,
  isCompleted = false,
  onStartLiveAnalysis,
  onPauseAnalysis,
  onResumeAnalysis,
  onStopAnalysis,
  onSeek,
  onVideoEnded,
  videoRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const resolvedVideoUrl = videoUrl || (videoId ? api.getVideoFileUrl(videoId) : '');

  // Draw transparent overlay canvas on every tracks update or animation frame
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas pixel dimensions to displayed video dimensions
    const displayWidth = video.clientWidth || 640;
    const displayHeight = video.clientHeight || 360;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const naturalWidth = video.videoWidth || 1280;
    const naturalHeight = video.videoHeight || 720;
    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;

    // 1. Draw Lane Polygons / Lines if available
    if (lanePolygons && typeof lanePolygons === 'object') {
      ctx.save();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      Object.entries(lanePolygons).forEach(([laneName, poly]: [string, any]) => {
        if (Array.isArray(poly) && poly.length >= 2) {
          ctx.beginPath();
          poly.forEach((pt: number[], idx: number) => {
            const px = pt[0] * scaleX;
            const py = pt[1] * scaleY;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();

          // Lane Label
          const firstPt = poly[0];
          ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(laneName.toUpperCase(), firstPt[0] * scaleX + 4, firstPt[1] * scaleY + 12);
        }
      });
      ctx.restore();
    }

    // 2. Draw Virtual Counting Line
    if (countingLine && countingLine.y !== undefined) {
      ctx.save();
      const lineY = (countingLine.y || (naturalHeight * 0.55)) * scaleY;
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(displayWidth, lineY);
      ctx.stroke();

      // Glowing badge
      ctx.fillStyle = '#f97316';
      ctx.fillRect(10, Math.max(0, lineY - 14), 110, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('COUNTING LINE ──', 14, Math.max(10, lineY - 4));
      ctx.restore();
    }

    // 3. Draw Vehicle Bounding Boxes & Trajectories
    tracks.forEach((t) => {
      const [x1, y1, x2, y2] = t.bbox || [0, 0, 0, 0];
      const sx1 = x1 * scaleX;
      const sy1 = y1 * scaleY;
      const sw = (x2 - x1) * scaleX;
      const sh = (y2 - y1) * scaleY;

      // Color mapping by vehicle class
      let primaryColor = '#06b6d4'; // Default cyan for cars
      const cls = (t.class_name || '').toLowerCase();
      if (cls.includes('bus')) primaryColor = '#0d9488';
      else if (cls.includes('truck')) primaryColor = '#f97316';
      else if (cls.includes('motorcycle') || cls.includes('bike')) primaryColor = '#a855f7';

      // Alert override
      if (t.speed_kmh && t.speed_kmh > 60) {
        primaryColor = '#ef4444';
      }

      // Draw Trajectory Trail
      if (Array.isArray(t.trajectory) && t.trajectory.length > 1) {
        ctx.save();
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();

        t.trajectory.forEach((pt: number[], idx: number) => {
          const tx = pt[0] * scaleX;
          const ty = pt[1] * scaleY;
          if (idx === 0) ctx.moveTo(tx, ty);
          else ctx.lineTo(tx, ty);
        });
        ctx.stroke();

        // Draw motion dots
        t.trajectory.forEach((pt: number[]) => {
          ctx.fillStyle = primaryColor;
          ctx.beginPath();
          ctx.arc(pt[0] * scaleX, pt[1] * scaleY, 2, 0, 2 * Math.PI);
          ctx.fill();
        });
        ctx.restore();
      }

      // Bounding Box
      ctx.save();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(sx1, sy1, sw, sh);

      // Label Header Badge
      const dirArrow = t.direction === 'EAST' ? '→' : t.direction === 'WEST' ? '←' : t.direction === 'NORTH' ? '↑' : '↓';
      const confPercent = t.confidence ? `${Math.round(t.confidence * 100)}%` : '';
      const speedLabel = t.speed_kmh ? `${t.speed_kmh} km/h` : 'Tracking';
      const label = `${(t.class_name || 'Vehicle').toUpperCase()} #${t.track_id} ${dirArrow} | ${speedLabel} (${confPercent})`;

      ctx.font = 'bold 10px monospace';
      const textWidth = ctx.measureText(label).width;
      const badgeHeight = 16;
      const badgeY = Math.max(0, sy1 - badgeHeight);

      // Badge Background
      ctx.fillStyle = primaryColor;
      ctx.fillRect(sx1, badgeY, textWidth + 10, badgeHeight);

      // Label Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, sx1 + 5, badgeY + 12);
      ctx.restore();
    });

  }, [tracks, countingLine, lanePolygons]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        if (isAnalyzing) onResumeAnalysis();
        else onStartLiveAnalysis();
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      onPauseAnalysis();
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Container with Overlaid Transparent Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-[#050a12] rounded-2xl overflow-hidden border border-[#192c43] shadow-2xl group"
      >
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          playsInline
          crossOrigin="anonymous"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (onVideoEnded) onVideoEnded();
          }}
          className="w-full h-full object-contain"
        />

        {/* Dynamic Canvas Bounding Box Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none w-full h-full"
        />

        {/* Top Floating Status Pill */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
          {isAnalyzing ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-500/90 text-white font-mono text-[11px] font-bold shadow-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE AI ANALYSIS ACTIVE ●</span>
            </div>
          ) : isCompleted ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white font-mono text-[11px] font-bold shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ANALYSIS COMPLETE ✓</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0a111a]/80 backdrop-blur border border-[#192c43] text-slate-300 font-mono text-[11px] font-medium">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>TRAFFIC CAMERA FEED READY</span>
            </div>
          )}
        </div>

        {/* Video Controls Bar Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#050a12] via-[#050a12]/80 to-transparent p-4 flex items-center justify-between z-20 opacity-90 group-hover:opacity-100 transition">
          <div className="flex items-center space-x-3">
            {!isAnalyzing ? (
              <button
                onClick={onStartLiveAnalysis}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 flex items-center space-x-2 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START LIVE ANALYSIS</span>
              </button>
            ) : (
              <button
                onClick={togglePlayPause}
                className="px-4 py-2 rounded-xl bg-[#122238] hover:bg-[#1a2e48] border border-[#192c43] text-slate-200 font-bold text-xs flex items-center space-x-2 transition"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-orange-400 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-emerald-400 fill-current" />
                    <span>RESUME</span>
                  </>
                )}
              </button>
            )}

            {isAnalyzing && (
              <button
                onClick={onStopAnalysis}
                className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold text-xs flex items-center space-x-1.5 transition"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
