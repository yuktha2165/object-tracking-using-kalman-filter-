import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Video, 
  Clock, 
  Settings,
  Radio,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { ViewPage } from '../types';

interface SidebarProps {
  currentView: ViewPage;
  onSelectView: (view: ViewPage) => void;
  activeJobId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, activeJobId }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('itms_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('itms_sidebar_collapsed', String(isCollapsed));
    } catch {}
  }, [isCollapsed]);

  const navItems: Array<{ id: ViewPage; label: string; icon: React.FC<any>; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'video-analysis', label: 'Video Analysis', icon: Video },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`relative border-r border-[#192c43] bg-[#0a111a] flex flex-col h-screen sticky top-0 z-40 select-none shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Floating Arrow Toggle Button on the Sidebar Border */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
        aria-label={isCollapsed ? "Expand sidebar" : "Minimize sidebar"}
        className="absolute -right-3.5 top-6 z-50 w-7 h-7 rounded-full bg-[#0d1829] hover:bg-orange-500 border border-[#1e3450] hover:border-orange-400 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer group"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 transition-transform group-hover:scale-110" />
        ) : (
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:scale-110" />
        )}
      </button>

      {/* Brand Title Header */}
      <div className={`p-4 flex items-center border-b border-[#192c43]/40 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center space-x-3 overflow-hidden">
          {/* ITMS Logo Symbol */}
          <div 
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isCollapsed ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
            title={isCollapsed ? "Click to expand" : undefined}
          >
            <svg viewBox="0 0 40 40" className="w-9 h-9">
              <path d="M6 34 L16 6 L24 6 L34 34 Z" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M20 12 L20 16 M20 20 L20 24 M20 28 L20 32" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <h2 className="font-extrabold text-xl tracking-tight text-white font-sans leading-none">ITMS</h2>
              <p className="text-[9px] font-medium text-slate-400 tracking-tight leading-tight mt-0.5">
                Intelligent Traffic<br />Monitoring System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 relative group ${
                isCollapsed ? 'justify-center py-3 px-2' : 'justify-between px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md shadow-orange-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-[#121f33]'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3 min-w-0'}`}>
                <Icon className={`shrink-0 transition-transform ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </div>

              {!isCollapsed && item.badge && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse shrink-0">
                  <Radio className="w-2.5 h-2.5" />
                  <span>{item.badge}</span>
                </span>
              )}

              {/* Collapsed Tooltip Flyout on Hover */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#0f1c2e] text-slate-100 text-[11px] font-mono whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-[#1e3450] shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed ? (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-[#0e1b2c] to-[#081220] border border-[#192c43] relative overflow-hidden text-center group">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 py-3 px-2">
            <div className="text-xs font-bold text-slate-200 tracking-wide">Safer Roads</div>
            <div className="text-[11px] font-semibold text-cyan-400 tracking-wider">Smarter Cities</div>
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center border-t border-[#192c43]/40">
          <div 
            onClick={() => setIsCollapsed(false)}
            title="Expand sidebar"
            className="w-8 h-8 rounded-lg bg-[#0e1b2c] border border-[#192c43] flex items-center justify-center text-cyan-400 cursor-pointer hover:border-cyan-500/40 transition"
          >
            <Shield className="w-4 h-4" />
          </div>
        </div>
      )}
    </aside>
  );
};

