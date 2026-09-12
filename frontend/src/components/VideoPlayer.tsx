import React, { useRef, useState } from 'react';
import { Play, Pause, Download, Maximize, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onDownload?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, onDownload }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
      {/* Video Title Banner */}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-slate-950/90 to-transparent z-10 flex items-center justify-between pointer-events-none">
          <span className="text-xs font-mono font-semibold text-cyan-300 bg-slate-900/80 px-3 py-1 rounded-md border border-slate-700/60">
            {title}
          </span>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video object-contain bg-slate-950"
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Video Control Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col space-y-2">
        {/* Progress Slider */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-cyan-400 transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="font-mono text-[11px] text-slate-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold border border-cyan-500/40 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Video</span>
              </button>
            )}

            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
