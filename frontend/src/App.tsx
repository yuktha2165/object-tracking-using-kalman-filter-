import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { VideoAnalysis } from './pages/VideoAnalysis';
import { LiveResults } from './pages/LiveResults';
import { TrafficAnalytics } from './pages/TrafficAnalytics';
import { VehicleTracking } from './pages/VehicleTracking';
import { Alerts } from './pages/Alerts';
import { History } from './pages/History';
import { SettingsPage } from './pages/Settings';
import { ViewPage } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewPage>('dashboard');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const getPageTitle = (view: ViewPage): string => {
    switch (view) {
      case 'dashboard': return 'Control Room Dashboard';
      case 'video-analysis': return 'Video Upload & AI Processing';
      case 'live-results': return 'Processed Video Playback';
      case 'traffic-analytics': return 'Analytics & Metrics';
      case 'vehicle-tracking': return 'Vehicle Trajectory Telemetry';
      case 'alerts': return 'Traffic Alerts & Violations';
      case 'history': return 'Analysis History Log';
      case 'settings': return 'System Settings';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        activeJobId={activeJobId}
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header currentViewTitle={getPageTitle(currentView)} />

        <main className="flex-1 pb-12">
          {currentView === 'dashboard' && (
            <Dashboard
              onSelectView={setCurrentView}
              onSelectSession={setActiveJobId}
            />
          )}

          {currentView === 'video-analysis' && (
            <VideoAnalysis
              onAnalysisStarted={(id) => {
                setActiveJobId(id);
              }}
              activeJobId={activeJobId}
              onSelectView={setCurrentView}
            />
          )}

          {currentView === 'live-results' && (
            <LiveResults activeJobId={activeJobId} />
          )}

          {currentView === 'traffic-analytics' && (
            <TrafficAnalytics activeJobId={activeJobId} />
          )}

          {currentView === 'vehicle-tracking' && (
            <VehicleTracking activeJobId={activeJobId} />
          )}

          {currentView === 'alerts' && (
            <Alerts activeJobId={activeJobId} />
          )}

          {currentView === 'history' && (
            <History
              onSelectSession={(id) => setActiveJobId(id)}
              onSelectView={setCurrentView}
            />
          )}

          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
