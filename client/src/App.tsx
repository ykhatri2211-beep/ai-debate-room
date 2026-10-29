import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateDebatePage } from './pages/CreateDebatePage';
import { ArenaPage } from './pages/ArenaPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [activeDebateId, setActiveDebateId] = useState<string>('demo-seed-001');

  // Load last active debate from localStorage if available
  useEffect(() => {
    const savedId = localStorage.getItem('activeDebateId');
    if (savedId) {
      setActiveDebateId(savedId);
    }
  }, []);

  const handleNavigate = (page: string, debateId?: string) => {
    if (debateId) {
      setActiveDebateId(debateId);
      localStorage.setItem('activeDebateId', debateId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDebateCreated = (newDebateId: string) => {
    setActiveDebateId(newDebateId);
    localStorage.setItem('activeDebateId', newDebateId);
    setCurrentPage('arena');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-cyan-200">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        activeDebateId={activeDebateId}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'create' && <CreateDebatePage onDebateCreated={handleDebateCreated} />}
        {currentPage === 'arena' && <ArenaPage debateId={activeDebateId} onNavigate={handleNavigate} />}
        {currentPage === 'history' && <HistoryPage onNavigate={handleNavigate} />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
