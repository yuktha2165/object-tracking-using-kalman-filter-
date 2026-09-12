import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, Filter, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { EventAlert } from '../types';

interface AlertsProps {
  activeJobId: string | null;
}

export const Alerts: React.FC<AlertsProps> = ({ activeJobId }) => {
  const [events, setEvents] = useState<EventAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!activeJobId) {
      setLoading(false);
      return;
    }

    api.getEvents(activeJobId)
      .then((res) => {
        setEvents(res.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeJobId]);

  if (!activeJobId) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <AlertTriangle className="w-12 h-12 mx-auto text-slate-600 opacity-40" />
        <h3 className="text-lg font-bold text-slate-300 font-mono">No Active Session Selected</h3>
        <p className="text-xs text-slate-500">Select a video analysis session to view traffic alerts and violation events.</p>
      </div>
    );
  }

  const filteredEvents = events.filter((e) => {
    return severityFilter === 'ALL' || e.severity === severityFilter;
  });

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight font-mono">
            Traffic Events & Violation Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated alerts for wrong-way vehicles, heavy congestion, and restricted zone entry.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-slate-300 font-mono outline-none"
          >
            <option value="ALL">All Severities ({events.length})</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
          </select>
        </div>
      </div>

      {/* Events Feed List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
            <p className="text-sm font-semibold text-slate-300">No traffic alerts logged for this session.</p>
            <p className="text-xs text-slate-500">Traffic flow is operating normally without safety violations.</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const isCritical = evt.severity === 'CRITICAL' || evt.severity === 'HIGH';
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-slate-900/80 border ${
                  isCritical ? 'border-rose-500/40 shadow-rose-500/5' : 'border-amber-500/30'
                } shadow-lg flex items-start space-x-4 transition hover:scale-[1.01]`}
              >
                <div className={`p-3 rounded-xl ${isCritical ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <ShieldAlert className="w-6 h-6" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {evt.event_type} • {evt.severity}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Frame {evt.frame_idx}</span>
                    </div>

                    <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{evt.timestamp}</span>
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-200">{evt.message}</p>
                  <p className="text-xs text-slate-500 font-mono">Lane: {evt.lane} | Vehicle Type: {evt.class_name.toUpperCase()}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
