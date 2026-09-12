import React from 'react';
import { Loader2, Cpu, Clock, Film, Zap } from 'lucide-react';
import { ProcessingJob } from '../types';

interface ProcessingProgressProps {
  job: ProcessingJob;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ job }) => {
  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressVal = job.progress !== undefined ? job.progress : Math.round(job.progress_percent || 0);
  const processedFrames = job.processed_frames !== undefined ? job.processed_frames : job.current_frame;

  return (
    <div className="p-6 rounded-2xl bg-[#0c1624] border border-[#192c43] shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>ANALYZING TRAFFIC VIDEO</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/40 animate-pulse">
                {job.status || 'PROCESSING'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Direct Video Analysis → YOLO Batch Inference → Kalman Tracking → Real-Time Analytics
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-black font-mono text-orange-500">
            {progressVal}%
          </div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Progress</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-3.5 w-full bg-[#060c14] rounded-full overflow-hidden p-0.5 border border-[#192c43]">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-400 rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${Math.max(2, progressVal)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Real-Time Processing Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 rounded-xl bg-[#060c14] border border-[#192c43]">
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Film className="w-3.5 h-3.5 text-orange-400" />
            <span>Frames Processed</span>
          </div>
          <div className="text-sm font-bold font-mono text-slate-200">
            {processedFrames.toLocaleString()} / {job.total_frames.toLocaleString()}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#060c14] border border-[#192c43]">
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Vehicles Detected</span>
          </div>
          <div className="text-sm font-bold font-mono text-amber-400">
            {job.vehicles_detected || 0}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#060c14] border border-[#192c43]">
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Processing Speed</span>
          </div>
          <div className="text-sm font-bold font-mono text-emerald-300">
            {job.processing_fps ? job.processing_fps.toFixed(1) : '30.0'} FPS
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#060c14] border border-[#192c43]">
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Processing Device</span>
          </div>
          <div className="text-sm font-bold font-mono text-cyan-300">
            {job.processing_device || 'CPU'}
          </div>
        </div>
      </div>
    </div>
  );
};

