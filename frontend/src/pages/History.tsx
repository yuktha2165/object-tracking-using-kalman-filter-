import React, { useEffect, useState } from 'react';
import { 
  Trash2, 
  Play, 
  Film, 
  Search, 
  RefreshCw, 
  ArrowRight, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Car, 
  Gauge, 
  Activity, 
  Download, 
  FileVideo,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisSessionSummary, ViewPage } from '../types';

interface HistoryProps {
  onSelectSession: (sessionId: string) => void;
  onSelectView: (view: ViewPage) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelectSession, onSelectView }) => {
  const [sessions, setSessions] = useState<AnalysisSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [viewingSession, setViewingSession] = useState<AnalysisSessionSummary | null>(null);
  const [deleteTargetSession, setDeleteTargetSession] = useState<AnalysisSessionSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Feedback alerts
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = () => {
    setLoading(true);
    api.getHistory()
      .then((res) => {
        setSessions(res.sessions || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setFeedback({
          type: 'error',
          message: 'Failed to load analysis history. Please check backend connection.'
        });
      });
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Clear feedback toast after 4s
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Handle in-app delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTargetSession) return;
    const targetId = deleteTargetSession.id;
    setIsDeleting(true);

    try {
      // Optimistic update
      setSessions((prev) => prev.filter((s) => s.id !== targetId));
      
      const res = await api.deleteHistory(targetId);
      setIsDeleting(false);
      setDeleteTargetSession(null);

      if (viewingSession?.id === targetId) {
        setViewingSession(null);
      }

      setFeedback({
        type: 'success',
        message: `Session "${deleteTargetSession.video_name || targetId}" successfully deleted.`
      });

      // Reload fresh list
      loadHistory();
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteTargetSession(null);
      loadHistory(); // Revert optimistic update
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to delete session from server.'
      });
    }
  };

  const handleLaunchAnalysis = (sessionId: string) => {
    onSelectSession(sessionId);
    onSelectView('video-analysis');
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter sessions by query
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.id?.toLowerCase().includes(q) ||
      s.video_name?.toLowerCase().includes(q) ||
      s.congestion?.toLowerCase().includes(q)
    );
  });

  const totalVehiclesCount = sessions.reduce((acc, s) => acc + (s.total_vehicles || 0), 0);

  return (
    <div className="p-6 md:p-10 space-y-6 bg-[#0a111a] min-h-screen text-slate-100 font-sans max-w-7xl mx-auto">
      
      {/* Page Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
            <span>Analysis Sessions History Log</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Archived traffic video processing logs, recorded feeds, and telemetry data.
          </p>
        </div>

        {/* Action & Stats Badges */}
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#0e1b2b] border border-[#1b2b3f] text-xs flex items-center space-x-2 text-slate-300">
            <span className="text-slate-400">Total Sessions:</span>
            <span className="font-bold text-white font-mono">{sessions.length}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#0e1b2b] border border-[#1b2b3f] text-xs flex items-center space-x-2 text-cyan-300">
            <Car className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Vehicles Logged:</span>
            <span className="font-bold text-white font-mono">{totalVehiclesCount}</span>
          </div>

          <button
            onClick={loadHistory}
            disabled={loading}
            className="p-2 rounded-xl bg-[#0e1b2b] border border-[#1b2b3f] hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
            title="Refresh history"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-3 transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter sessions by video name or session ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c1624] border border-[#1b2b3f] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition"
        />
      </div>

      {/* Main Sessions Table */}
      <div className="rounded-2xl bg-[#0c1624] border border-[#1b2b3f] overflow-hidden shadow-2xl">
        {loading && sessions.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-orange-400 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">Loading archived sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400">
              <Film className="w-8 h-8 opacity-40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-300">
                {searchQuery ? 'No matching sessions found' : 'No analysis session history found'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery 
                  ? `No archived sessions matched "${searchQuery}". Try clearing your search.` 
                  : 'Surveillance recordings uploaded or processed through the Video Analysis workspace will appear here.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => onSelectView('video-analysis')}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-orange-500/20"
              >
                <span>Go to Video Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#09121d] text-slate-400 font-mono uppercase text-[10px] border-b border-[#18293d]">
                <tr>
                  <th className="p-4 font-semibold">Session ID</th>
                  <th className="p-4 font-semibold">Video Name</th>
                  <th className="p-4 font-semibold">Resolution / FPS</th>
                  <th className="p-4 font-semibold">Duration</th>
                  <th className="p-4 font-semibold">Vehicles</th>
                  <th className="p-4 font-semibold">Avg Speed</th>
                  <th className="p-4 font-semibold">Congestion</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142336] text-slate-300">
                {filteredSessions.map((s) => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-[#0f1d2e]/80 transition cursor-pointer group"
                    onClick={() => setViewingSession(s)}
                  >
                    {/* Session ID with copy button */}
                    <td className="p-4 font-mono font-bold text-cyan-400">
                      <div className="flex items-center space-x-1.5">
                        <span>{s.id}</span>
                        <button
                          onClick={(e) => handleCopyId(s.id, e)}
                          title="Copy session ID"
                          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-white transition"
                        >
                          {copiedId === s.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Video Name */}
                    <td className="p-4 font-semibold text-slate-100 max-w-xs truncate">
                      <div className="flex items-center space-x-2">
                        <FileVideo className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="truncate" title={s.video_name}>{s.video_name || 'Traffic Feed'}</span>
                      </div>
                    </td>

                    {/* Resolution / FPS */}
                    <td className="p-4 font-mono text-slate-400">
                      {s.resolution ? `${s.resolution} @ ${s.fps ? Math.round(s.fps) : 30}fps` : '1080p'}
                    </td>

                    {/* Duration */}
                    <td className="p-4 font-mono text-slate-300">
                      {s.duration ? `${Math.floor(s.duration / 60)}m ${Math.floor(s.duration % 60)}s` : 'N/A'}
                    </td>

                    {/* Vehicles */}
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {s.total_vehicles || 0}
                    </td>

                    {/* Average Speed */}
                    <td className="p-4 font-mono text-slate-300">
                      {s.average_speed !== null && s.average_speed !== undefined ? `${Math.round(s.average_speed)} km/h` : 'N/A'}
                    </td>

                    {/* Congestion */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        s.congestion === 'HEAVY' || s.congestion === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : s.congestion === 'MODERATE'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}>
                        {s.congestion || 'NORMAL'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {/* View Modal Button */}
                        <button
                          onClick={() => setViewingSession(s)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition flex items-center space-x-1 cursor-pointer"
                          title="View video details and playback"
                        >
                          <span>View</span>
                        </button>

                        {/* Direct Analyze Button */}
                        <button
                          onClick={() => handleLaunchAnalysis(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30 transition flex items-center space-x-1 cursor-pointer"
                          title="Launch AI analysis for this session"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Analyze</span>
                        </button>

                        {/* In-App Delete Button */}
                        <button
                          onClick={() => setDeleteTargetSession(s)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer border border-transparent hover:border-rose-500/30"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. SESSION DETAILS & VIDEO PLAYBACK MODAL */}
      {viewingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0d1829] border border-[#1e3450] shadow-2xl p-6 md:p-8 space-y-6 text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#18293d] pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    SESSION ID: {viewingSession.id}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {viewingSession.video_name || 'Traffic Surveillance Recording'}
                </h2>
              </div>

              <button
                onClick={() => setViewingSession(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="rounded-xl overflow-hidden bg-black border border-[#192c43] aspect-video w-full relative shadow-inner">
              <video
                src={api.getVideoFileUrl(viewingSession.id)}
                controls
                className="w-full h-full object-contain"
                playsInline
              />
            </div>

            {/* Metrics & Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#09121d] border border-[#18293d]">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Vehicles</span>
                </div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {viewingSession.total_vehicles || 0}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#09121d] border border-[#18293d]">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Average Speed</span>
                </div>
                <div className="text-xl font-bold text-cyan-400 font-mono">
                  {viewingSession.average_speed !== null && viewingSession.average_speed !== undefined 
                    ? `${Math.round(viewingSession.average_speed)} km/h` 
                    : 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#09121d] border border-[#18293d]">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Duration</span>
                </div>
                <div className="text-xl font-bold text-white font-mono">
                  {viewingSession.duration ? `${Math.floor(viewingSession.duration / 60)}m ${Math.floor(viewingSession.duration % 60)}s` : 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#09121d] border border-[#18293d]">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Congestion Level</span>
                </div>
                <div className="text-base font-bold text-purple-300 font-mono uppercase">
                  {viewingSession.congestion || 'NORMAL'}
                </div>
              </div>
            </div>

            {/* Technical Metadata Bar */}
            <div className="p-3.5 rounded-xl bg-[#09121d] border border-[#18293d] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
              <div>Resolution: <span className="text-slate-200">{viewingSession.resolution || '1080p'}</span></div>
              <div>Framerate: <span className="text-slate-200">{viewingSession.fps ? Math.round(viewingSession.fps) : 30} fps</span></div>
              <div>Status: <span className="text-emerald-400 uppercase font-semibold">{viewingSession.status || 'UPLOADED'}</span></div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#18293d]">
              <div className="flex items-center space-x-2">
                <a
                  href={api.getVideoFileUrl(viewingSession.id)}
                  download={viewingSession.video_name || `traffic_video_${viewingSession.id}.mp4`}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-2 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Video</span>
                </a>

                <button
                  onClick={() => {
                    const toDelete = viewingSession;
                    setViewingSession(null);
                    setDeleteTargetSession(toDelete);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center space-x-2 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Session</span>
                </button>
              </div>

              <button
                onClick={() => {
                  const id = viewingSession.id;
                  setViewingSession(null);
                  handleLaunchAnalysis(id);
                }}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-orange-500/20 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Open in Live AI Video Analysis Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. IN-APP DELETE CONFIRMATION MODAL */}
      {deleteTargetSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1829] border border-rose-500/30 shadow-2xl p-6 space-y-5 text-slate-100">
            
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Analysis Session?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#09121d] border border-[#18293d] space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Session ID:</span>
                <span className="font-mono text-cyan-400">{deleteTargetSession.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Video Name:</span>
                <span className="font-semibold text-white max-w-[200px] truncate">
                  {deleteTargetSession.video_name || 'Traffic Recording'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Duration:</span>
                <span className="font-mono text-slate-300">
                  {deleteTargetSession.duration ? `${Math.round(deleteTargetSession.duration)}s` : 'N/A'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Deleting this session will permanently remove the uploaded video recording, detection tracks, trajectory logs, and historical analytics.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteTargetSession(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Session</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
