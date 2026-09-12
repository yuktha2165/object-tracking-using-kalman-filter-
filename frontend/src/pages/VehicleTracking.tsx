import React, { useEffect, useState } from 'react';
import { Search, Filter, Car, Eye, X, Compass, Gauge, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { VehicleTrack } from '../types';

interface VehicleTrackingProps {
  activeJobId: string | null;
}

export const VehicleTracking: React.FC<VehicleTrackingProps> = ({ activeJobId }) => {
  const [vehicles, setVehicles] = useState<VehicleTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTrack | null>(null);

  useEffect(() => {
    if (!activeJobId) {
      setLoading(false);
      return;
    }

    api.getVehicles(activeJobId)
      .then((res) => {
        setVehicles(res.vehicles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeJobId]);

  if (!activeJobId) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Car className="w-12 h-12 mx-auto text-slate-600 opacity-40" />
        <h3 className="text-lg font-bold text-slate-300 font-mono">No Active Session</h3>
        <p className="text-xs text-slate-500">Select a processed session to explore individual vehicle tracking logs.</p>
      </div>
    );
  }

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = 
      v.track_id.toString().includes(searchQuery) ||
      v.class_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.direction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.lane.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || v.class_name.toLowerCase() === selectedClass.toLowerCase();

    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight font-mono">
            Vehicle Telemetry & Trajectory Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search persistent vehicle IDs, inspect bounding boxes, velocities, trajectories, & lane assignments.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search Track ID, class, lane, or direction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:border-cyan-500 outline-none"
          >
            <option value="ALL">All Vehicle Classes</option>
            <option value="car">Cars</option>
            <option value="bus">Buses</option>
            <option value="truck">Trucks</option>
            <option value="motorcycle">Motorcycles</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px]">
            <tr>
              <th className="p-4">Track ID</th>
              <th className="p-4">Class</th>
              <th className="p-4">Lane</th>
              <th className="p-4">Direction</th>
              <th className="p-4">Speed</th>
              <th className="p-4">Age (Frames)</th>
              <th className="p-4">Confidence</th>
              <th className="p-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                  No vehicle tracks matched your search parameters.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v) => (
                <tr key={v.track_id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-cyan-400">#{v.track_id}</td>
                  <td className="p-4 font-semibold text-slate-100 uppercase">{v.class_name}</td>
                  <td className="p-4 font-mono">{v.lane}</td>
                  <td className="p-4 font-mono">{v.direction}</td>
                  <td className="p-4 font-mono font-semibold text-emerald-400">
                    {v.speed !== null ? `${v.speed} km/h` : 'N/A'}
                  </td>
                  <td className="p-4 font-mono">{v.age}</td>
                  <td className="p-4 font-mono">{(v.confidence * 100).toFixed(0)}%</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedVehicle(v)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] border border-slate-700 transition flex items-center space-x-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vehicle Detail Modal Drawer */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-mono">
                  Vehicle Track #{selectedVehicle.track_id}
                </h3>
                <span className="text-xs text-cyan-400 font-mono uppercase font-semibold">
                  {selectedVehicle.class_name} • {(selectedVehicle.confidence * 100).toFixed(0)}% Confidence
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Assigned Lane</span>
                <span className="text-slate-200 font-bold">{selectedVehicle.lane}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Movement Direction</span>
                <span className="text-slate-200 font-bold">{selectedVehicle.direction}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Estimated Speed</span>
                <span className="text-emerald-400 font-bold">
                  {selectedVehicle.speed !== null ? `${selectedVehicle.speed} km/h` : 'Uncalibrated'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Frames Active</span>
                <span className="text-slate-200 font-bold">{selectedVehicle.age} frames</span>
              </div>
            </div>

            {/* Trajectory Points Log */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase">
                Centroid Trajectory Log ({selectedVehicle.trajectory.length} points)
              </span>
              <div className="max-h-40 overflow-y-auto p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                {selectedVehicle.trajectory.map((pt, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-900 pb-1">
                    <span>Point #{idx + 1} (Frame {pt[2]})</span>
                    <span className="text-cyan-300">({pt[0]}, {pt[1]})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
