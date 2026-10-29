import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Swords,
  PlusCircle,
  LayoutDashboard,
  History,
  Settings,
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';
import { LLMHealthStatus } from '../../types/debate';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, debateId?: string) => void;
  activeDebateId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, activeDebateId }) => {
  const [llmStatus, setLlmStatus] = useState<LLMHealthStatus | null>(null);

  useEffect(() => {
    api.getLLMStatus()
      .then(setLlmStatus)
      .catch((err) => console.warn('Could not fetch LLM status:', err));
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'New Debate', icon: PlusCircle },
    { id: 'arena', label: 'Arena', icon: Swords, badge: activeDebateId ? 'Live' : undefined },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Architecture', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-0.5 shadow-glow-indigo group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <Swords className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">AI DEBATE</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  ROOM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wider font-mono">
                MULTI-AGENT DIALECTICS
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-navy-900/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: LLM status badge & Quick Action */}
          <div className="flex items-center gap-3">
            {/* LLM Engine Status Indicator */}
            <div
              onClick={() => onNavigate('settings')}
              title="Click to view AI Provider & System Architecture"
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-slate-800 text-xs cursor-pointer hover:border-slate-700 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Engine:</span>
              <span className="text-slate-200 font-medium">
                {llmStatus?.isConfigured && llmStatus?.isHealthy
                  ? llmStatus.model
                  : 'Simulation Engine'}
              </span>
              {llmStatus?.isConfigured && llmStatus?.isHealthy ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </div>

            <Button
              size="sm"
              variant="cyan"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => onNavigate('create')}
            >
              Start Debate
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
