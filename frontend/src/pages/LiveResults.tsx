import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Car, 
  Bus, 
  Truck, 
  Bike, 
  Gauge, 
  Activity, 
  AlertTriangle, 
  Download,
  Film,
  CheckCircle2
} from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { api } from '../services/api';
import { SessionAnalytics } from '../types';

interface LiveResultsProps {
  activeJobId: string | null;
}

export const LiveResults: React.FC<LiveResultsProps> = ({ activeJobId }) => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeJobId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    api.getAnalytics(activeJobId)
      .then((res) => {
        setAnalytics(res.analytics);
        setLoading(false);
      })
      .catch((err) => {
        setError('Could not load analysis results. Make sure processing has finished.');
        setLoading(false);
      });
  }, [activeJobId]);

  if (!activeJobId) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-4">
        <Film className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
        <h3 className="text-lg font-bold text-slate-300 font-mono">No Active Video Selected</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please upload a video or select an existing analysis session from the History tab to view processed results.
        </p>
      </div>
    );
  }

  const processedUrl = api.getProcessedVideoUrl(activeJobId);
  const summary = analytics?.summary;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight font-mono">
            Processed Video & Telemetry Output
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized playback with explicit Kalman Filter trajectory trails, vehicle IDs, & overlay stats.
          </p>
        </div>

        <a
          href={processedUrl}
          download={`traffic_analysis_${activeJobId}.mp4`}
          className="px-5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs uppercase tracking-wider border border-cyan-500/40 flex items-center space-x-2 transition"
        >
          <Download className="w-4 h-4" />
          <span>Download Processed Video</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Processed Video Player */}
        <div className="lg:col-span-8 space-y-4">
          <VideoPlayer
            src={processedUrl}
            title={`JOB ID: ${activeJobId} | AI PROCESSED VIDEO`}
            onDownload={() => {
              const a = document.createElement('a');
              a.href = processedUrl;
              a.download = `traffic_analysis_${activeJobId}.mp4`;
              a.click();
            }}
          />

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono">Output Codec: H.264 / AAC MP4</span>
            <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full Frame Telemetry Synchronized</span>
            </span>
          </div>
        </div>

        {/* Right Column: Live Session Stats Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800 pb-3">
              Session Summary Telemetry
            </h3>

            {/* Total Vehicles Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Total Vehicles Counted</span>
              <div className="text-3xl font-black font-mono text-cyan-400">
                {summary ? summary.total_vehicles : '--'}
              </div>
            </div>

            {/* Class Counts Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Class Breakdown</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Car className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cars</span>
                  </span>
                  <span className="font-bold text-slate-100">{summary?.class_counts?.car || 0}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Bus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Buses</span>
                  </span>
                  <span className="font-bold text-slate-100">{summary?.class_counts?.bus || 0}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Truck className="w-3.5 h-3.5 text-orange-400" />
                    <span>Trucks</span>
                  </span>
                  <span className="font-bold text-slate-100">{summary?.class_counts?.truck || 0}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Bike className="w-3.5 h-3.5 text-violet-400" />
                    <span>Bikes</span>
                  </span>
                  <span className="font-bold text-slate-100">{summary?.class_counts?.motorcycle || 0}</span>
                </div>
              </div>
            </div>

            {/* Average Speed */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Average Vehicle Speed</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {summary?.average_speed_kmh !== null && summary?.average_speed_kmh !== undefined
                  ? `${summary.average_speed_kmh} km/h`
                  : 'Speed estimation unavailable'}
              </div>
              <p className="text-[10px] text-slate-500">
                {summary?.speed_calibrated ? 'Calibrated scale (15 px/m)' : 'Calibration required'}
              </p>
            </div>

            {/* Congestion Badge */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Traffic Congestion Evaluation</span>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                  summary?.final_congestion === 'HEAVY'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : summary?.final_congestion === 'MODERATE'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {summary?.final_congestion || 'NORMAL'}
                </span>
                <span className="text-xs text-slate-400 font-mono">{analytics?.events?.length || 0} Alert Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
