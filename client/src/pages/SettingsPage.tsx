import React, { useEffect, useState } from 'react';
import {
  Settings,
  Cpu,
  Shield,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Code,
  Sparkles,
  ExternalLink,
  Zap,
  Database
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { LLMHealthStatus } from '../types/debate';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<LLMHealthStatus | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'groq' | 'mock'>('gemini');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      const status = await api.getLLMStatus();
      setHealth(status);
      if (['gemini', 'openai', 'groq', 'mock'].includes(status.providerType)) {
        setSelectedProvider(status.providerType as any);
      }
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleApplyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg(null);

    try {
      await api.setLLMConfig({
        providerType: selectedProvider,
        apiKey: apiKeyInput.trim() || undefined,
        model: modelInput.trim() || undefined,
      });

      setUpdateMsg({
        type: 'success',
        text: `Provider configuration successfully updated to ${selectedProvider.toUpperCase()}.`,
      });
      setApiKeyInput('');
      await fetchStatus();
    } catch (err: any) {
      setUpdateMsg({ type: 'error', text: err.message || 'Failed to update config.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <Settings className="w-3.5 h-3.5" />
          SYSTEM GOVERNANCE & ARCHITECTURE
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Provider & Engineering Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure the active LLM inference engine, inspect failover mechanisms, and review the full-stack design.
        </p>
      </div>

      {/* Provider Status Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Active Inference Provider</h3>
              <p className="text-xs text-slate-400">Current AI engine backing the debate arena</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchStatus}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Check Health
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">Engine Engine</div>
            <div className="text-sm font-bold text-white">
              {health?.provider || 'Detecting...'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Model: {health?.model || 'default'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">Connectivity Status</div>
            <div className="flex items-center gap-1.5 text-sm font-bold">
              {health?.isHealthy ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Live & Operational
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Zap className="w-4 h-4" />
                  Autonomous Simulation Active
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {health?.latencyMs ? `Latency: ${health.latencyMs}ms` : 'Instant Response'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase mb-1">Security Isolation</div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
              <Shield className="w-4 h-4 text-indigo-400" />
              Backend Shielded
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Zero client-side secrets exposure
            </div>
          </div>
        </div>

        {health?.error && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{health.error}</span>
          </div>
        )}

        {/* Change Provider Form */}
        <form onSubmit={handleApplyConfig} className="pt-4 border-t border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-white">Switch AI Engine</h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'gemini', label: 'Google Gemini', desc: 'gemini-2.5-flash' },
              { id: 'openai', label: 'OpenAI API', desc: 'gpt-4o-mini' },
              { id: 'groq', label: 'Groq Cloud', desc: 'llama-3.3-70b' },
              { id: 'mock', label: 'Neural Sim', desc: 'Autonomous fallback' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProvider(p.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedProvider === p.id
                    ? 'border-cyan-400 bg-cyan-950/30 text-white font-bold'
                    : 'border-slate-800 bg-navy-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white">{p.label}</div>
                <div className="text-[10px] font-mono text-slate-400">{p.desc}</div>
              </button>
            ))}
          </div>

          {selectedProvider !== 'mock' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional API Key (Override)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Leave empty to use server .env key"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Model Name
                </label>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder={selectedProvider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {updateMsg && (
            <div
              className={`p-3 rounded-xl text-xs ${
                updateMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}
            >
              {updateMsg.text}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="cyan" type="submit" isLoading={isUpdating}>
              Apply Provider Config
            </Button>
          </div>
        </form>
      </div>

      {/* Project Architecture Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Full-Stack Project Architecture</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          The AI Debate Room is designed with strict separation of concerns, deterministic turn sequencing, and defensive fallback layers.
        </p>

        {/* Visual Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-navy-900 border border-indigo-500/30 space-y-2">
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">1. Client Layer</div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Code className="w-4 h-4 text-cyan-400" />
              React + Vite + TS
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tailwind CSS, Framer Motion animations, Recharts radar analytics, and responsive arena layouts.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-navy-900 border border-indigo-500/30 space-y-2">
            <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase">2. API Gateway</div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-400" />
              Node.js + Express
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              RESTful endpoints (/api/debates, /api/health), CORS isolation, input validation, and secure secrets handling.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-navy-900 border border-indigo-500/30 space-y-2">
            <div className="text-[10px] font-mono text-violet-400 font-bold uppercase">3. Core Engine</div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-violet-400" />
              Turn Controller
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic 4-step sequence (Pro → Con → Rebuttal → Rebuttal), concurrent request locking, and Judge isolation.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-navy-900 border border-indigo-500/30 space-y-2">
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">4. Persistence</div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              Persistent DB
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Atomic transactional file database with seed data, full transcript history, and analytics aggregations.
            </p>
          </div>
        </div>

        {/* Technology Stack Table */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            Technology Specifications
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-navy-900/60 border border-slate-800">
              <span className="text-slate-500 block font-mono text-[10px]">FRONTEND</span>
              <strong className="text-white">React 19 + TypeScript</strong>
            </div>
            <div className="p-3 rounded-lg bg-navy-900/60 border border-slate-800">
              <span className="text-slate-500 block font-mono text-[10px]">STYLING</span>
              <strong className="text-white">Tailwind CSS 3.4</strong>
            </div>
            <div className="p-3 rounded-lg bg-navy-900/60 border border-slate-800">
              <span className="text-slate-500 block font-mono text-[10px]">BACKEND</span>
              <strong className="text-white">Express 4.21 (Node.js)</strong>
            </div>
            <div className="p-3 rounded-lg bg-navy-900/60 border border-slate-800">
              <span className="text-slate-500 block font-mono text-[10px]">ANALYTICS</span>
              <strong className="text-white">Recharts Radar & Bar</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
