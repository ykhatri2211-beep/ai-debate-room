import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, User, CheckCircle, ArrowRight, Gauge } from 'lucide-react';
import { ArgumentMessage } from '../../types/debate';

interface ArgumentBubbleProps {
  message: ArgumentMessage;
  index: number;
}

export const ArgumentBubble: React.FC<ArgumentBubbleProps> = ({ message, index }) => {
  const isPro = message.role === 'pro';
  const isHuman = message.speaker === 'human';

  // Sub-step naming
  const subStep = message.stepNumber % 4;
  let speechType = 'Argument';
  if (message.round === 1 && subStep === 0) speechType = 'Opening Statement (Pro)';
  else if (message.round === 1 && subStep === 1) speechType = 'Opening Counterstatement (Con)';
  else if (subStep === 2) speechType = `Round ${message.round} Rebuttal (Pro)`;
  else if (subStep === 3) speechType = `Round ${message.round} Rebuttal (Con)`;
  else if (subStep === 0) speechType = `Round ${message.round} Contention (Pro)`;
  else if (subStep === 1) speechType = `Round ${message.round} Counter-Contention (Con)`;

  const theme = isHuman
    ? {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-950/20',
        avatarBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        accentText: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        claimBg: 'bg-emerald-900/25 border-emerald-500/30 text-emerald-200',
      }
    : isPro
    ? {
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-950/15',
        avatarBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        accentText: 'text-cyan-400',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        claimBg: 'bg-cyan-900/25 border-cyan-500/30 text-cyan-200',
      }
    : {
        border: 'border-violet-500/30',
        bg: 'bg-violet-950/15',
        avatarBg: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
        accentText: 'text-violet-400',
        badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
        claimBg: 'bg-violet-900/25 border-violet-500/30 text-violet-200',
      };

  const Icon = isHuman ? User : isPro ? Sparkles : Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className={`glass-panel rounded-2xl p-5 border ${theme.border} ${theme.bg} mb-4 relative shadow-card-subtle`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${theme.avatarBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{message.speakerName}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${theme.badge}`}>
                {isPro ? 'PRO' : 'CON'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Round {message.round} • Turn {message.stepNumber + 1} • {speechType}
            </p>
          </div>
        </div>

        {/* Strength Score Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-navy-900/80 border border-slate-800">
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-slate-400 font-mono">Impact:</span>
          <span className={`text-xs font-bold font-mono ${theme.accentText}`}>
            {message.strengthScore}/100
          </span>
        </div>
      </div>

      {/* Core Claim Box */}
      {message.claim && (
        <div className={`p-3 rounded-xl border text-xs leading-relaxed font-medium mb-3.5 ${theme.claimBg}`}>
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-75 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Core Contention
          </div>
          <p className="font-medium">"{message.claim}"</p>
        </div>
      )}

      {/* Full Argument Content */}
      <div className="text-slate-200 text-sm leading-relaxed mb-4 whitespace-pre-line font-normal">
        {message.content}
      </div>

      {/* Analytical Pillars & Counterpoints */}
      <div className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        {message.supportingPoints && message.supportingPoints.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono">Pillars:</span>
            {message.supportingPoints.map((point, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-navy-900 text-slate-300 border border-slate-800"
              >
                <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="line-clamp-1">{point}</span>
              </span>
            ))}
          </div>
        )}

        {message.counteredPoints && message.counteredPoints.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono">Refuting:</span>
            {message.counteredPoints.map((point, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-rose-950/30 text-rose-300 border border-rose-900/40"
              >
                <ArrowRight className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="line-clamp-1">{point}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
