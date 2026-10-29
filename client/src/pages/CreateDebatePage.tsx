import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  User,
  ArrowRight,
  Shield,
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Flame,
  Scale
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { DebateCategory, DebateDifficulty, DebateMode } from '../types/debate';

interface CreateDebatePageProps {
  onDebateCreated: (debateId: string) => void;
}

export const CreateDebatePage: React.FC<CreateDebatePageProps> = ({ onDebateCreated }) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<DebateCategory>('Technology');
  const [difficulty, setDifficulty] = useState<DebateDifficulty>('Intermediate');
  const [totalRounds, setTotalRounds] = useState<2 | 3 | 5>(2);
  const [mode, setMode] = useState<DebateMode>('ai_vs_ai');
  const [humanPosition, setHumanPosition] = useState<'pro' | 'con'>('pro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedTopics = [
    {
      title: 'Should AI replace human programmers?',
      category: 'Technology' as DebateCategory,
      difficulty: 'Advanced' as DebateDifficulty,
    },
    {
      title: 'Is remote work better than office work?',
      category: 'Workplace & Economics' as DebateCategory,
      difficulty: 'Intermediate' as DebateDifficulty,
    },
    {
      title: 'Should social media have stricter regulations?',
      category: 'Ethics & Society' as DebateCategory,
      difficulty: 'Intermediate' as DebateDifficulty,
    },
    {
      title: 'Is open-source software better than proprietary software?',
      category: 'Technology' as DebateCategory,
      difficulty: 'Advanced' as DebateDifficulty,
    },
    {
      title: 'Should college attendance be mandatory?',
      category: 'Education & Culture' as DebateCategory,
      difficulty: 'Beginner' as DebateDifficulty,
    },
    {
      title: 'Can AI-generated code be trusted in production?',
      category: 'Technology' as DebateCategory,
      difficulty: 'Advanced' as DebateDifficulty,
    },
  ];

  const handleSelectSuggested = (t: {
    title: string;
    category: DebateCategory;
    difficulty: DebateDifficulty;
  }) => {
    setTopic(t.title);
    setCategory(t.category);
    setDifficulty(t.difficulty);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setError('Please provide a debate proposition or choose a suggested topic.');
      return;
    }

    if (topic.trim().length < 5) {
      setError('Topic proposition must be at least 5 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const debate = await api.createDebate({
        topic: topic.trim(),
        category,
        difficulty,
        totalRounds,
        mode,
        humanPosition: mode === 'human_vs_ai' ? humanPosition : undefined,
      });

      onDebateCreated(debate.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create debate session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          MATCH CONFIGURATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Initialize New Debate
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure proposition parameters, agent difficulty, round limits, and interactive participant mode.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <div className="font-bold">Configuration Validation Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Suggested Topics Carousel / Grid */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Suggested Topics & Example Prompts</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Click any to auto-fill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {suggestedTopics.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSuggested(t)}
              className={`p-3 rounded-xl border text-left transition-all ${
                topic === t.title
                  ? 'border-cyan-400 bg-cyan-950/30 shadow-glow-cyan'
                  : 'border-slate-800 bg-navy-900 hover:border-slate-700 hover:bg-navy-850'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                <span className="text-cyan-400">{t.category}</span>
                <span>{t.difficulty}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
                {t.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        {/* Topic Input */}
        <div>
          <label className="block text-sm font-bold text-white mb-1.5">
            Debate Proposition / Motion
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Should AI replace human programmers?"
            className="w-full px-4 py-3 rounded-xl bg-navy-900 border border-slate-700 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Frame as a clear normative question or motion suitable for affirmative and opposition clash.
          </p>
        </div>

        {/* Category & Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DebateCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Technology">Technology</option>
              <option value="Ethics & Society">Ethics & Society</option>
              <option value="Workplace & Economics">Workplace & Economics</option>
              <option value="Education & Culture">Education & Culture</option>
              <option value="Science & Environment">Science & Environment</option>
              <option value="Politics & Law">Politics & Law</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Dialectical Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DebateDifficulty)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Beginner">Beginner (Clear analogies, intuitive reasoning)</option>
              <option value="Intermediate">Intermediate (Structured dialectics & empirical data)</option>
              <option value="Advanced">Advanced (Academic rhetoric, socio-technical depth)</option>
            </select>
          </div>
        </div>

        {/* Number of Rounds */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Number of Rounds (4 turns per round)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { rounds: 2, label: '2 Rounds (Fast Demo)', turns: '8 speeches' },
              { rounds: 3, label: '3 Rounds (Standard Match)', turns: '12 speeches' },
              { rounds: 5, label: '5 Rounds (Deep Academic)', turns: '20 speeches' },
            ].map((r) => (
              <button
                key={r.rounds}
                type="button"
                onClick={() => setTotalRounds(r.rounds as 2 | 3 | 5)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  totalRounds === r.rounds
                    ? 'border-indigo-400 bg-indigo-950/30 shadow-glow-indigo text-white'
                    : 'border-slate-800 bg-navy-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm text-white">{r.label}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{r.turns}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Debate Mode Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Debate Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMode('ai_vs_ai')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                mode === 'ai_vs_ai'
                  ? 'border-cyan-400 bg-cyan-950/20 shadow-glow-cyan'
                  : 'border-slate-800 bg-navy-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">AI vs AI (Spectator Mode)</h4>
                  <span className="text-[10px] text-cyan-300 font-mono">Autonomous Agents</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch Alpha-Pro and Omega-Con argue autonomously with automatic or step-by-step turns.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('human_vs_ai')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                mode === 'human_vs_ai'
                  ? 'border-emerald-400 bg-emerald-950/20 shadow-glow-indigo'
                  : 'border-slate-800 bg-navy-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Human vs AI (Interactive Arena)</h4>
                  <span className="text-[10px] text-emerald-300 font-mono">You Competitor</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step onto the debate floor yourself. Submit arguments and let the AI opponent directly counter you.
              </p>
            </button>
          </div>
        </div>

        {/* Position Selection if Human vs AI */}
        {mode === 'human_vs_ai' && (
          <div className="p-4 rounded-xl bg-navy-900/80 border border-emerald-500/30 space-y-2">
            <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Choose Your Position
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHumanPosition('pro')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  humanPosition === 'pro'
                    ? 'border-cyan-400 bg-cyan-950/30 text-white font-bold'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Argue PRO (Affirmative)
              </button>
              <button
                type="button"
                onClick={() => setHumanPosition('con')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  humanPosition === 'con'
                    ? 'border-violet-400 bg-violet-950/30 text-white font-bold'
                    : 'border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Argue CON (Opposition)
              </button>
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <Button
            type="submit"
            size="lg"
            variant="cyan"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Launch Arena Session
          </Button>
        </div>
      </form>
    </div>
  );
};
