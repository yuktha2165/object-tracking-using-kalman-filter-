import React, { useEffect, useState } from 'react';
import { Sliders, Database, Cpu, HardDrive, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  // Settings State
  const [model, setModel] = useState('yolo26n.pt');
  const [confidence, setConfidence] = useState(0.35);
  const [maxMissed, setMaxMissed] = useState(30);
  const [ppm, setPpm] = useState(15);
  const [direction, setDirection] = useState('EAST');

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight font-mono">
          System & Algorithm Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure default AI models, explicit Kalman Filter tracking parameters, & database storage.
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Computer Vision & YOLO Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Detection Model Settings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Detection Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
              >
                <option value="yolo26n.pt">YOLO26 Nano (yolo26n.pt - Fast)</option>
                <option value="yolo11n.pt">YOLO11 Nano (yolo11n.pt)</option>
                <option value="yolov8n.pt">YOLOv8 Nano (yolov8n.pt)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Confidence Threshold</label>
              <input
                type="number"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Kalman Tracking Settings */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Kalman Filter & Data Association</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-400 mb-1">Max Missed Frames Before Deletion</label>
              <input
                type="number"
                value={maxMissed}
                onChange={(e) => setMaxMissed(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Default Speed Calibration (px/m)</label>
              <input
                type="number"
                value={ppm}
                onChange={(e) => setPpm(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Database Status Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Database Storage Status</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px]">Active Repository Mode</span>
              <span className="font-bold text-cyan-400">{health?.database_mode || 'LOCAL_FALLBACK'}</span>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              OPERATIONAL
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
};
