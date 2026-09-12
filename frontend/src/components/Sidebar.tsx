import React from 'react';
import { 
  Home, 
  Video, 
  BarChart2, 
  Car, 
  AlertTriangle, 
  Clock, 
  Settings,
  Radio
} from 'lucide-react';
import { ViewPage } from '../types';

interface SidebarProps {
  currentView: ViewPage;
  onSelectView: (view: ViewPage) => void;
  activeJobId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, activeJobId }) => {
  const navItems: Array<{ id: ViewPage; label: string; icon: React.FC<any>; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'video-analysis', label: 'Video Analysis', icon: Video },
    { id: 'traffic-analytics', label: 'Traffic Analytics', icon: BarChart2 },
    { id: 'vehicle-tracking', label: 'Vehicle Tracking', icon: Car },
    { id: 'alerts', label: 'Events & Alerts', icon: AlertTriangle },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 border-r border-[#192c43] bg-[#0a111a] flex flex-col h-screen sticky top-0 z-40 select-none shrink-0">
      {/* Brand Title Header */}
      <div className="p-5 flex flex-col items-start justify-center">
        <div className="flex items-center space-x-3 mb-1">
          {/* ITMS Logo Symbol */}
          <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center relative">
            <svg viewBox="0 0 40 40" className="w-9 h-9">
              <path d="M6 34 L16 6 L24 6 L34 34 Z" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M20 12 L20 16 M20 20 L20 24 M20 28 L20 32" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="font-extrabold text-xl tracking-tight text-white font-sans leading-none">ITMS</h2>
          </div>
        </div>
        <p className="text-[10px] font-medium text-slate-400 tracking-tight leading-tight">
          Intelligent Traffic<br />Monitoring System
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md shadow-orange-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#121f33]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                  <Radio className="w-2.5 h-2.5" />
                  <span>{item.badge}</span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Banner - City Skyline */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-[#0e1b2c] to-[#081220] border border-[#192c43] relative overflow-hidden text-center group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 py-4 px-2">
          <div className="text-sm font-bold text-slate-200 tracking-wide">Safer Roads</div>
          <div className="text-xs font-semibold text-cyan-400 tracking-wider">Smarter Cities</div>
        </div>
      </div>
    </aside>
  );
};

