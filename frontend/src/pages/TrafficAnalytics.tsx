import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { BarChart3, Activity, Gauge, Layers, Navigation, Film } from 'lucide-react';
import { api } from '../services/api';
import { SessionAnalytics } from '../types';

interface TrafficAnalyticsProps {
  activeJobId: string | null;
}

const COLORS = ['#0284c7', '#f59e0b', '#f97316', '#8b5cf6', '#10b981'];

export const TrafficAnalytics: React.FC<TrafficAnalyticsProps> = ({ activeJobId }) => {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeJobId) {
      setLoading(false);
      return;
    }

    api.getAnalytics(activeJobId)
      .then((res) => {
        setAnalytics(res.analytics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeJobId]);

  if (!activeJobId || !analytics) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <BarChart3 className="w-12 h-12 mx-auto text-slate-600 opacity-40" />
        <h3 className="text-lg font-bold text-slate-300 font-mono">No Session Analytics Loaded</h3>
        <p className="text-xs text-slate-500">Please process or select a video session to display analytics charts.</p>
      </div>
    );
  }

  const { time_series, summary } = analytics;

  // Format Class Data for Pie Chart
  const classData = Object.entries(summary.class_counts || {}).map(([key, val]) => ({
    name: key.toUpperCase(),
    value: val
  }));

  // Format Lane Data for Bar Chart
  const laneData = Object.entries(summary.lane_distribution || {}).map(([key, val]) => ({
    lane: key,
    vehicles: val
  }));

  // Format Direction Data
  const directionData = Object.entries(summary.direction_distribution || {}).map(([key, val]) => ({
    direction: key,
    vehicles: val
  }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight font-mono">
          Traffic Analytics & Insights
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Detailed metrics over time: vehicle counts, speed trends, road occupancy density, & lane usage.
        </p>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Vehicles Over Time */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Vehicles Volume Over Time</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={time_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="active_vehicles" name="Active Vehicles" stroke="#0284c7" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="total_counted" name="Cumulative Counted" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Traffic Density & Occupancy */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <Layers className="w-4 h-4 text-violet-400" />
            <span>Traffic Density & Occupancy %</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={time_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="occupancy_percentage" name="Occupancy %" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Vehicle Class Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Vehicle Class Breakdown</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Lane Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span>Lane-wise Vehicle Distribution</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={laneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="lane" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="vehicles" name="Vehicles" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
