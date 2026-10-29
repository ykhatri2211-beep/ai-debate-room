import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Swords,
  Sparkles,
  Shield,
  Scale,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Zap,
  BarChart3,
  Users,
  Award,
  BookOpen,
  Terminal,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface LandingPageProps {
  onNavigate: (page: string, debateId?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [activeSampleTab, setActiveSampleTab] = useState<'pro' | 'con' | 'judge'>('pro');

  const sampleArguments = {
    pro: {
      speaker: 'Alpha-Pro (AI Synthesizer)',
      role: 'AFFIRMATIVE ADVOCATE',
      color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
      badge: 'PRO',
      claim: 'Autonomous AI synthesis eliminates syntactical toil, multiplying developer throughput and democratizing innovation.',
      speech:
        'The history of computing is an unbroken ladder of abstraction—from physical vacuum tube wiring to punch cards, assembly, high-level languages, and now declarative natural language intent. Demanding human engineers continue handcrafting boilerplate syntax ignores empirical studies showing a 55% leap in development speed with neural assistance. Total automation of programming frees intellectual bandwidth to address higher-order systemic architecture and civilizational challenges.',
      score: '89/100 Impact Score',
    },
    con: {
      speaker: 'Omega-Con (AI Dialectic)',
      role: 'OPPOSITION ADVOCATE',
      color: 'text-violet-400 border-violet-500/30 bg-violet-950/20',
      badge: 'CON',
      claim: 'True software engineering is socio-technical governance and liability, which cannot be delegated to probabilistic models.',
      speech:
        'The affirmative conflates the mechanical generation of syntax with the profound discipline of software engineering. Writing code is the easy 20%; the remaining 80% requires stakeholder diplomacy, safety trade-offs, defensive architecture, and ethical liability. When mission-critical infrastructure in avionics, power grids, or healthcare fails, statistical weight distributions cannot be held legally or morally accountable. Replacing human programmers creates an existential single point of catastrophic failure.',
      score: '92/100 Impact Score',
    },
    judge: {
      speaker: 'The Chief Arbiter (AI Judge)',
      role: 'IMPARTIAL ADJUDICATOR',
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
      badge: 'JUDGE',
      claim: 'Opposition Prevailed (92.4 vs 86.8): Socio-technical accountability cannot be outsourced.',
      speech:
        'While Alpha-Pro established undeniable velocity metrics, Omega-Con decisively proved that complete replacement introduces critical legal vacuums, security liabilities, and epistemic risks that automated pipelines cannot resolve on their own. Formal verification requires human engineers to define safety invariants and business trade-offs.',
      score: 'Adjudication Scorecard Finalized',
    },
  };

  return (
    <div className="space-y-24 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-glow-indigo">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multi-Agent Dialectics & Adjudication Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Every Argument.{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Tested by Intelligence.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          A full-stack dialectical debate platform where specialized AI agents clash with formal rhetorical discipline, line-by-line rebuttals, and algorithmic adjudication.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            variant="cyan"
            onClick={() => onNavigate('create')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Launch a Debate
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => onNavigate('dashboard')}
            leftIcon={<BarChart3 className="w-5 h-5" />}
          >
            Explore Dashboard
          </Button>
        </div>

        {/* Quick Highlights */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-indigo-400 text-xs font-mono font-semibold uppercase mb-1">
              Deterministic
            </div>
            <div className="text-white font-bold text-sm">Turn Controller</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Strict multi-round debate order</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-cyan-400 text-xs font-mono font-semibold uppercase mb-1">
              5 Rubrics
            </div>
            <div className="text-white font-bold text-sm">100% Scorecard</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Logic, Evidence, Rebuttal, etc.</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-violet-400 text-xs font-mono font-semibold uppercase mb-1">
              Dual Mode
            </div>
            <div className="text-white font-bold text-sm">AI vs AI & Human</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Argue against AI live</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="text-emerald-400 text-xs font-mono font-semibold uppercase mb-1">
              Zero-Fail
            </div>
            <div className="text-white font-bold text-sm">Neural Fallback</div>
            <p className="text-[11px] text-slate-400 mt-0.5">100% reliable faculty demo</p>
          </div>
        </div>
      </section>

      {/* The Three AI Personas Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">
            THE ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Three Specialized Cognitive Agents
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Each agent operates with tailored prompt engineering, distinct cognitive objectives, and transparent evaluation criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pro */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Alpha-Pro</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                AFFIRMATIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">The Synthesizer Advocate</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Constructs empirical, affirmative cases. Identifies efficiency multipliers, macro trends, and progressive frameworks to defend the proposition.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Structured contention formulation
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Empirical citations & data analogies
              </li>
            </ul>
          </div>

          {/* Con */}
          <div className="glass-panel p-6 rounded-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">Omega-Con</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                OPPOSITION
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">The Dialectic Challenger</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Dissects opposing claims line-by-line. Highlights unintended consequences, liability vacuums, systemic edge cases, and alternative solutions.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                Logical fallacy identification
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                Socio-technical liability critique
              </li>
            </ul>
          </div>

          {/* Judge */}
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4">
              <Scale className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">The Chief Arbiter</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                IMPARTIAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">The Adjudication Engine</p>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Maintains complete neutrality. Evaluates transcript arguments using weighted academic rubrics to produce a transparent scorecard.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                25% Logic, 25% Evidence, 20% Rebuttal
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                Radar charts & printable report export
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Sample Debate Preview */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-6">
          <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
            LIVE PREVIEW
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            "Should AI replace human programmers?"
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toggle between the agents below to inspect how arguments and adjudication are structured.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setActiveSampleTab('pro')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSampleTab === 'pro'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alpha-Pro (Speech)
          </button>
          <button
            onClick={() => setActiveSampleTab('con')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSampleTab === 'con'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Omega-Con (Counterargument)
          </button>
          <button
            onClick={() => setActiveSampleTab('judge')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSampleTab === 'judge'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chief Arbiter (Adjudication)
          </button>
        </div>

        {/* Active Sample Card */}
        {(() => {
          const sample = sampleArguments[activeSampleTab];
          return (
            <motion.div
              key={activeSampleTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`glass-panel p-6 rounded-2xl border ${sample.color} shadow-card-subtle`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-sm">{sample.speaker}</h4>
                  <p className="text-[11px] font-mono text-slate-400">{sample.role}</p>
                </div>
                <span className="text-xs font-mono text-slate-300 font-bold px-2.5 py-1 rounded-full bg-navy-900 border border-slate-800">
                  {sample.score}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-navy-900/60 border border-slate-800 text-xs text-slate-200 font-medium mb-4">
                <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                  Core Contention:
                </span>
                "{sample.claim}"
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {sample.speech}
              </p>
            </motion.div>
          );
        })()}
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold">
            THE METHODOLOGY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            How a Multi-Agent Debate Unfolds
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-2">
            Every debate follows an unalterable formal dialectical protocol enforced by the backend turn controller.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative">
            <span className="font-mono text-3xl font-extrabold text-cyan-500/30 absolute top-4 right-4">
              01
            </span>
            <div className="text-xs uppercase font-bold text-cyan-400 mb-1">Configuration</div>
            <h4 className="text-base font-bold text-white mb-2">Set Proposition</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose a controversial topic, difficulty, round count (2, 3, or 5), and select AI vs AI or Human vs AI mode.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative">
            <span className="font-mono text-3xl font-extrabold text-indigo-500/30 absolute top-4 right-4">
              02
            </span>
            <div className="text-xs uppercase font-bold text-indigo-400 mb-1">Opening Clash</div>
            <h4 className="text-base font-bold text-white mb-2">Contention & Counter</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pro presents the opening thesis. Con responds with structural challenges, alternative paradigms, and counterexamples.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative">
            <span className="font-mono text-3xl font-extrabold text-violet-500/30 absolute top-4 right-4">
              03
            </span>
            <div className="text-xs uppercase font-bold text-violet-400 mb-1">Rebuttal Rounds</div>
            <h4 className="text-base font-bold text-white mb-2">Cross-Examination</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each round alternates with point-by-point rebuttals, defending claims and exposing opponent logical fallacies.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative">
            <span className="font-mono text-3xl font-extrabold text-amber-500/30 absolute top-4 right-4">
              04
            </span>
            <div className="text-xs uppercase font-bold text-amber-400 mb-1">Adjudication</div>
            <h4 className="text-base font-bold text-white mb-2">Algorithmic Verdict</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The AI Judge evaluates the transcript against the 5 rubrics, rendering scores, a radar breakdown, and printable report.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-navy-900 to-cyan-950/60 border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to Witness Multi-Agent Intelligence in Action?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6">
            Launch an instant 2-round spectator debate or enter the arena as a human competitor.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              variant="cyan"
              onClick={() => onNavigate('create')}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Start Debate Room
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('dashboard')}
            >
              View Analytics Dashboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
