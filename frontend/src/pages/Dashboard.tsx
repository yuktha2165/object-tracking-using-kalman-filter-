import React, { useEffect, useState } from 'react';
import { 
  Car, 
  Bus, 
  Truck, 
  Bike, 
  Gauge, 
  Activity, 
  AlertTriangle, 
  Upload, 
  MoreVertical, 
  Play, 
  Pause,
  Volume2, 
  Maximize, 
  ArrowUpRight,
  Info,
  TrendingUp
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '../services/api';
import { AnalysisSessionSummary, ViewPage } from '../types';

interface DashboardProps {
  onSelectView: (view: ViewPage) => void;
  onSelectSession: (sessionId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectView, onSelectSession }) => {
  const [sessions, setSessions] = useState<AnalysisSessionSummary[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(134); // ~ 00:02:14 out of 00:05:32 (332s total)

  useEffect(() => {
    api.getHistory()
      .then((res) => {
        setSessions(res.sessions || []);
      })
      .catch(() => {});
  }, []);

  const latestSession = sessions.length > 0 ? sessions[0] : null;

  // Donut chart data for Vehicle Type Distribution
  const donutData = [
    { name: 'Cars', value: 52, percentage: '60%', color: '#06b6d4' },
    { name: 'Buses', value: 8, percentage: '9%', color: '#0d9488' },
    { name: 'Trucks', value: 17, percentage: '20%', color: '#f97316' },
    { name: 'Motorcycles', value: 10, percentage: '11%', color: '#94a3b8' },
  ];

  // Time-Series data for Traffic Flow Over Time
  const flowData = [
    { time: '0:00', vehicles: 28, speed: 20 },
    { time: '1:00', vehicles: 45, speed: 25 },
    { time: '2:00', vehicles: 52, speed: 22 },
    { time: '3:00', vehicles: 68, speed: 30 },
    { time: '4:00', vehicles: 55, speed: 28 },
    { time: '5:00', vehicles: 72, speed: 34 },
  ];

  // Bar Chart data for Lane-wise Vehicle Count
  const laneData = [
    { lane: 'Lane 1', count: 35, color: '#00bcd4' },
    { lane: 'Lane 2', count: 42, color: '#f97316' },
    { lane: 'Lane 3', count: 21, color: '#00bcd4' },
    { lane: 'Lane 4', count: 12, color: '#00bcd4' },
  ];

  // Live Vehicle Tracking table rows matching screenshot
  const vehicleTrackingRows = [
    { id: '01', type: 'Car', lane: '1', speed: 42, direction: 'East', status: 'Normal' },
    { id: '02', type: 'Bus', lane: '2', speed: 31, direction: 'East', status: 'Normal' },
    { id: '03', type: 'Truck', lane: '1', speed: 28, direction: 'East', status: 'Normal' },
    { id: '17', type: 'Car', lane: '3', speed: 8, direction: 'West', status: 'Alert' },
    { id: '21', type: 'Car', lane: '2', speed: 36, direction: 'East', status: 'Normal' },
    { id: '25', type: 'Motorcycle', lane: '1', speed: 48, direction: 'East', status: 'Normal' },
  ];

  // Recent Events / Alerts list matching screenshot
  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Wrong-way vehicle detected',
      subtitle: 'Track ID: 27 | Lane 2',
      time: '14:28:12'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Congestion detected',
      subtitle: 'Lane 2 | Density: 78%',
      time: '14:26:05'
    },
    {
      id: 3,
      type: 'info',
      title: 'Restricted zone violation',
      subtitle: 'Track ID: 34',
      time: '14:24:18'
    },
    {
      id: 4,
      type: 'warning',
      title: 'Overspeeding vehicle',
      subtitle: 'Track ID: 19 | 68 km/h',
      time: '14:22:41'
    }
  ];

  return (
    <div className="p-6 space-y-5 bg-[#0a111a] min-h-screen text-slate-100 font-sans">
      
      {/* 1. TOP KPI CARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Total Vehicles Card */}
        <div className="itms-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Total Vehicles</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">87</span>
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center">
              ↑ 12%
            </span>
          </div>
          <span className="text-[9px] text-slate-500 mt-0.5">vs last analysis</span>
        </div>

        {/* Cars Card */}
        <div className="itms-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Cars</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">52</div>
            <div className="text-[10px] text-slate-400 mt-0.5">60%</div>
          </div>
        </div>

        {/* Buses Card */}
        <div className="itms-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Buses</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">8</div>
            <div className="text-[10px] text-slate-400 mt-0.5">9%</div>
          </div>
        </div>

        {/* Trucks Card */}
        <div className="itms-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Trucks</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">17</div>
            <div className="text-[10px] text-slate-400 mt-0.5">20%</div>
          </div>
        </div>

        {/* Motorcycles Card */}
        <div className="itms-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Motorcycles</span>
            <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-white tracking-tight">10</div>
            <div className="text-[10px] text-slate-400 mt-0.5">11%</div>
          </div>
        </div>

        {/* Average Speed Card */}
        <div className="itms-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Average Speed</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-white tracking-tight">34 km/h</div>
          </div>
        </div>

        {/* Traffic Density Card */}
        <div className="itms-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Traffic Density</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">72%</span>
            <span className="text-[10px] font-bold text-cyan-400">High</span>
          </div>
        </div>

        {/* Congestion Card */}
        <div className="itms-card p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Congestion</span>
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base font-bold text-orange-500 tracking-tight uppercase">MODERATE</div>
          </div>
        </div>

      </div>

      {/* 2. MAIN MIDDLE SECTION (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 8 Cols: Video Analysis */}
        <div className="lg:col-span-7 itms-card p-4 flex flex-col justify-between space-y-3">
          {/* Card Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-1 h-4 rounded-full bg-orange-500 inline-block" />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Video Analysis</h3>
                <p className="text-xs text-slate-400">AI-powered vehicle detection and tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelectView('video-analysis')}
                className="px-3 py-1.5 rounded-lg bg-transparent border border-orange-500/80 text-orange-400 hover:bg-orange-500/10 text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span>Upload Video</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Video Display Overlay */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video w-full border border-[#192c43] group">
            {/* Background Traffic Image / Canvas Simulation */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-90"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80')`
              }}
            />
            
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

            {/* AI Bounding Boxes Overlays (Matching screenshot positions & labels) */}
            
            {/* Truck #08 28 km/h */}
            <div className="absolute top-[28%] left-[34%] w-[13%] h-[26%] border-2 border-orange-500 rounded bg-orange-500/10 flex flex-col justify-start pointer-events-none">
              <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 self-start -mt-5 rounded-t-sm shadow">
                Truck #08<br /><span className="text-[8px] font-normal">28 km/h</span>
              </div>
            </div>

            {/* Bus #03 31 km/h */}
            <div className="absolute top-[32%] left-[49%] w-[14%] h-[32%] border-2 border-teal-400 rounded bg-teal-400/10 flex flex-col justify-start pointer-events-none">
              <div className="bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 self-start -mt-5 rounded-t-sm shadow">
                Bus #03<br /><span className="text-[8px] font-normal">31 km/h</span>
              </div>
            </div>

            {/* Car #14 36 km/h */}
            <div className="absolute top-[34%] left-[25%] w-[8%] h-[14%] border-2 border-teal-400 rounded bg-teal-400/10 flex flex-col justify-start pointer-events-none">
              <div className="bg-teal-500 text-white text-[9px] font-bold px-1 py-0.5 self-start -mt-5 rounded-t-sm shadow">
                Car #14<br /><span className="text-[8px] font-normal">36 km/h</span>
              </div>
            </div>

            {/* Car #12 42 km/h */}
            <div className="absolute top-[38%] left-[15%] w-[10%] h-[16%] border-2 border-teal-400 rounded bg-teal-400/10 flex flex-col justify-start pointer-events-none">
              <div className="bg-teal-500 text-white text-[9px] font-bold px-1 py-0.5 self-start -mt-5 rounded-t-sm shadow">
                Car #12<br /><span className="text-[8px] font-normal">42 km/h</span>
              </div>
            </div>

            {/* Car #17 45 km/h */}
            <div className="absolute top-[38%] left-[40%] w-[10%] h-[16%] border-2 border-teal-400 rounded bg-teal-400/10 flex flex-col justify-start pointer-events-none">
              <div className="bg-teal-500 text-white text-[9px] font-bold px-1 py-0.5 self-start -mt-5 rounded-t-sm shadow">
                Car #17<br /><span className="text-[8px] font-normal">45 km/h</span>
              </div>
            </div>

            {/* Motorcycle #25 48 km/h */}
            <div className="absolute top-[52%] left-[27%] w-[7%] h-[20%] border-2 border-orange-500 rounded bg-orange-500/10 flex flex-col justify-start pointer-events-none">
              <div className="bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 self-start -mt-5 rounded-t-sm shadow leading-tight">
                Motorcycle #25<br /><span className="text-[8px] font-normal">48 km/h</span>
              </div>
            </div>

            {/* Car #21 38 km/h */}
            <div className="absolute top-[48%] left-[56%] w-[11%] h-[20%] border-2 border-teal-400 rounded bg-teal-400/10 flex flex-col justify-start pointer-events-none">
              <div className="bg-teal-500 text-white text-[9px] font-bold px-1 py-0.5 self-start -mt-5 rounded-t-sm shadow">
                Car #21<br /><span className="text-[8px] font-normal">38 km/h</span>
              </div>
            </div>

            {/* Lane Markers / Guidelines simulation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <line x1="30%" y1="30%" x2="20%" y2="90%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6,6" />
              <line x1="45%" y1="30%" x2="40%" y2="90%" stroke="#f97316" strokeWidth="2" strokeDasharray="6,6" />
              <line x1="60%" y1="30%" x2="65%" y2="90%" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6,6" />
            </svg>
          </div>

          {/* Custom Video Control Bar */}
          <div className="flex items-center space-x-3 pt-1 text-slate-300 text-xs">
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="p-1 rounded hover:bg-slate-800 text-white transition"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <span className="font-mono text-[11px] text-slate-400">00:02:14 / 00:05:32</span>

            {/* Progress Bar Track */}
            <div className="flex-1 relative flex items-center cursor-pointer">
              <div className="w-full h-1.5 rounded-full bg-slate-800 relative overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '40%' }} />
              </div>
              <div className="absolute left-[40%] w-3 h-3 bg-orange-500 rounded-full border-2 border-slate-900 shadow -translate-x-1/2" />
            </div>

            <div className="flex items-center space-x-3 text-slate-400">
              <Volume2 className="w-4 h-4 cursor-pointer hover:text-white" />
              <span className="text-xs font-semibold cursor-pointer hover:text-white">1x</span>
              <Maximize className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Vehicle Type Distribution & Traffic Flow Over Time */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* Top: Vehicle Type Distribution */}
          <div className="itms-card p-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-1 h-4 rounded-full bg-orange-500 inline-block" />
              <h3 className="text-sm font-bold text-white tracking-tight">Vehicle Type Distribution</h3>
            </div>

            <div className="flex items-center justify-between h-44">
              {/* Donut Chart with total 87 Vehicles in Center */}
              <div className="w-1/2 h-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f1c2d" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white font-mono leading-none">87</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">Vehicles</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="w-1/2 pl-4 space-y-2 text-xs">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{item.value} ({item.percentage})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom: Traffic Flow Over Time */}
          <div className="itms-card p-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-1 h-4 rounded-full bg-orange-500 inline-block" />
                <h3 className="text-sm font-bold text-white tracking-tight">Traffic Flow Over Time</h3>
              </div>
              <div className="flex items-center space-x-4 text-[10px]">
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-0.5 bg-teal-400 rounded-full" />
                  <span className="text-slate-400">Vehicle Count</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-0.5 bg-orange-500 rounded-full" />
                  <span className="text-slate-400">Average Speed</span>
                </div>
              </div>
            </div>

            <div className="h-40 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={flowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 80]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f1c2d', borderColor: '#192c43', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="vehicles" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM ROW (3 EQUAL COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Column 1: Lane-wise Vehicle Count */}
        <div className="itms-card p-4 flex flex-col justify-between">
          <div className="flex items-center space-x-2 mb-3">
            <span className="w-1 h-4 rounded-full bg-orange-500 inline-block" />
            <h3 className="text-sm font-bold text-white tracking-tight">Lane-wise Vehicle Count</h3>
          </div>

          <div className="h-44 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={laneData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="lane" stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 60]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }}>
                  {laneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Column 2: Recent Events / Alerts */}
        <div className="itms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-1 h-4 rounded-full bg-orange-500 inline-block" />
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Events / Alerts</h3>
            </div>
            <button 
              onClick={() => onSelectView('alerts')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {recentAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="p-2.5 rounded-lg bg-[#0c1624] border border-[#18293d] flex items-center justify-between hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3">
                  {alert.type === 'warning' ? (
                    <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 leading-tight">{alert.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{alert.subtitle}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Live Vehicle Tracking Table */}
        <div className="itms-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-1 h-4 rounded-full bg-orange-500 inline-block" />
              <h3 className="text-sm font-bold text-white tracking-tight">Live Vehicle Tracking</h3>
            </div>
            <button 
              onClick={() => onSelectView('vehicle-tracking')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 border-b border-[#18293d] uppercase font-mono">
                <tr>
                  <th className="pb-2 font-medium">ID</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Lane</th>
                  <th className="pb-2 font-medium">Speed (km/h)</th>
                  <th className="pb-2 font-medium">Direction</th>
                  <th className="pb-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#142336] text-slate-300 text-[11px]">
                {vehicleTrackingRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#122135] transition">
                    <td className="py-1.5 font-mono text-slate-400">{row.id}</td>
                    <td className="py-1.5 font-medium">{row.type}</td>
                    <td className="py-1.5 font-mono">{row.lane}</td>
                    <td className="py-1.5 font-mono text-cyan-400">{row.speed}</td>
                    <td className="py-1.5 text-slate-400">{row.direction}</td>
                    <td className="py-1.5 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        row.status === 'Alert'
                          ? 'bg-orange-500 text-white'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

