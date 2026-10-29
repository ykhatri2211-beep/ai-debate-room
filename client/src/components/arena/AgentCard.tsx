import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Scale, User, Mic, Bot } from 'lucide-react';
import { AgentRole, SpeakerType } from '../../types/debate';

interface AgentCardProps {
  role: AgentRole;
  isSpeaking: boolean;
  speakerType: SpeakerType;
  speechCount: number;
  mode: 'ai_vs_ai' | 'human_vs_ai';
  humanPosition?: 'pro' | 'con';
}

export const AgentCard: React.FC<AgentCardProps> = ({
  role,
  isSpeaking,
  speakerType,
  speechCount,
  mode,
  humanPosition,
}) => {
  const isHuman = mode === 'human_vs_ai' && humanPosition === role;

  const roleConfig = {
    pro: {
      title: isHuman ? 'You (Human Advocate)' : 'Alpha-Pro',
      subtitle: isHuman ? 'Affirmative Human Competitor' : 'Autonomous AI Synthesizer',
      badge: 'PRO • AFFIRMATIVE',
      badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      activeBorder: 'border-cyan-400 shadow-glow-cyan',
      inactiveBorder: 'border-slate-800',
      icon: isHuman ? User : Sparkles,
      iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      description: 'Defends the motion with empirical evidence, logical deduction, and pragmatic framing.',
    },
    con: {
      title: isHuman ? 'You (Human Advocate)' : 'Omega-Con',
      subtitle: isHuman ? 'Opposition Human Competitor' : 'Autonomous AI Dialectic',
      badge: 'CON • OPPOSITION',
      badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      activeBorder: 'border-violet-400 shadow-glow-violet',
      inactiveBorder: 'border-slate-800',
      icon: isHuman ? User : Shield,
      iconBg: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
      description: 'Challenges the motion with counterexamples, edge cases, liability scrutiny, and alternatives.',
    },
    judge: {
      title: 'Chief Arbiter',
      subtitle: 'Neural Adjudication Engine',
      badge: 'AI JUDGE • IMPARTIAL',
      badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      activeBorder: 'border-amber-400 shadow-lg shadow-amber-500/20',
      inactiveBorder: 'border-slate-800',
      icon: Scale,
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      description: 'Adjudicates strictly on the 5-category rubric: Logic (25%), Evidence (25%), Rebuttal (20%), Relevance (15%), Clarity (15%).',
    },
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <motion.div
      animate={{
        scale: isSpeaking ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
      className={`glass-panel rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden ${
        isSpeaking ? config.activeBorder : config.inactiveBorder
      }`}
    >
      {/* Speaking Pulse Glow Indicator */}
      {isSpeaking && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`relative flex items-center justify-center w-12 h-12 rounded-xl border ${config.iconBg} ${
              isSpeaking ? 'ring-2 ring-offset-2 ring-offset-navy-950 ring-current' : ''
            }`}
          >
            <Icon className="w-6 h-6" />
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-navy-950"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base leading-snug">{config.title}</h3>
              {isHuman ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HUMAN
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI AGENT
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{config.subtitle}</p>
          </div>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
          {config.badge}
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
        {config.description}
      </p>

      {/* Status Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5">
          {isSpeaking ? (
            <span className="flex items-center gap-1.5 text-cyan-300 font-medium">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              On the Floor
            </span>
          ) : (
            <span className="text-slate-500">Waiting for turn</span>
          )}
        </div>
        <span className="font-mono text-slate-400 text-[11px]">
          {role === 'judge' ? 'Adjudicator' : `${speechCount} speeches`}
        </span>
      </div>
    </motion.div>
  );
};
