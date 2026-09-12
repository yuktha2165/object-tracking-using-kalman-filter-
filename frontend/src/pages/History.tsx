import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Trash2, ExternalLink, Play, Clock, Film } from 'lucide-react';
import { api } from '../services/api';
import { AnalysisSessionSummary, ViewPage } from '../types';

interface HistoryProps {
  onSelectSession: (sessionId: string) => void;
  onSelectView: (view: ViewPage) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelectSession, onSelectView }) => {
  const [sessions, setSessions] = useState<AnalysisSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    setLoading(true);
    api.getHistory()
      .then((res) => {
        setSessions(res.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this session?')) {
      await api.deleteHistory(id);
      loadHistory();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight font-mono">
          Analysis Sessions History Log
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Archived traffic video processing logs stored in MongoDB / Local JSON repository.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Film className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-sm font-semibold text-slate-300">No session history found.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-4">Session ID</th>
                <th className="p-4">Video Name</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Vehicles</th>
                <th className="p-4">Average Speed</th>
                <th className="p-4">Congestion</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono font-bold text-cyan-400">{s.id}</td>
                  <td className="p-4 font-semibold text-slate-100">{s.video_name}</td>
                  <td className="p-4 font-mono">{s.duration}s</td>
                  <td className="p-4 font-mono font-bold text-cyan-400">{s.total_vehicles}</td>
                  <td className="p-4 font-mono">
                    {s.average_speed !== null ? `${s.average_speed} km/h` : 'N/A'}
                  </td>
                  <td className="p-4 font-mono font-semibold text-amber-400">{s.congestion}</td>
                  <td className="p-4 text-right flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        onSelectSession(s.id);
                        onSelectView('live-results');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold text-[11px] border border-cyan-500/30 transition flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={(e) => handleDelete(s.id, e)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
