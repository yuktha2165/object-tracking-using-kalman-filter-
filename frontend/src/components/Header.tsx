import React, { useEffect, useState } from 'react';
import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  currentViewTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ currentViewTitle }) => {
  const [timeStr, setTimeStr] = useState<string>('14:32:18');
  const [dateStr, setDateStr] = useState<string>('Aug 26, 2025');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
      setDateStr(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 border-b border-[#192c43] bg-[#0a111a] px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Greeting & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Good Afternoon, Admin
        </h1>
        <p className="text-xs text-slate-400 font-normal">
          Monitor Today. Build Safer Tomorrow.
        </p>
      </div>

      {/* Center: Search Input */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search videos, vehicles, or events..."
            className="w-full bg-[#101e30] border border-[#192c43] text-slate-200 placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 transition"
          />
        </div>
      </div>

      {/* Right: Notifications, User Profile & Clock */}
      <div className="flex items-center space-x-6">
        {/* Notification Bell with Dot */}
        <button className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#122238] transition">
          <Bell className="w-5 h-5 text-slate-300 fill-slate-300/10" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-[#0a111a]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 border-r border-[#192c43] pr-6">
          <div className="w-9 h-9 rounded-full bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center font-bold text-cyan-300 text-sm">
            A
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">Admin</span>
            <span className="text-[10px] text-slate-400">Traffic Control</span>
          </div>
        </div>

        {/* Date & Time Widget */}
        <div className="flex flex-col text-right">
          <span className="text-[11px] text-slate-400 leading-tight">{dateStr}</span>
          <span className="text-lg font-bold text-white font-mono tracking-tight leading-tight">{timeStr}</span>
        </div>
      </div>
    </header>
  );
};

