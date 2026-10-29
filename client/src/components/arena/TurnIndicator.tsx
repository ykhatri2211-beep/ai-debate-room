import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mic, Sparkles, User, Shield, CheckCircle2 } from 'lucide-react';
import { SpeakerType, AgentRole } from '../../types/debate';

interface TurnIndicatorProps {
  currentTurnSpeaker: SpeakerType;
  currentStep: number;
  totalSteps: number;
  currentRound: number;
  totalRounds: number;
  isLoading: boolean;
  status: string;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentTurnSpeaker,
  currentStep,
  totalSteps,
  currentRound,
  totalRounds,
  isLoading,
  status,
}) => {
  const isHumanTurn = currentTurnSpeaker === 'human';
  const isPro = currentTurnSpeaker === 'ai_pro';
  const isCon = currentTurnSpeaker === 'ai_con';
  const isJudge = currentTurnSpeaker === 'judge' || status === 'evaluating' || status === 'completed';

  const speakerName = isHumanTurn
    ? 'Your Turn (Human Advocate)'
    : isPro
    ? 'Alpha-Pro (Affirmative)'
    : isCon
    ? 'Omega-Con (Opposition)'
    : 'The Chief Arbiter (AI Judge)';

  const speakerIcon = isHumanTurn ? User : isPro ? Sparkles : isCon ? Shield : CheckCircle2;
  const Icon = speakerIcon;

  const colorClass = isHumanTurn
    ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20'
    : isPro
    ? 'border-cyan-500/40 text-cyan-300 bg-cyan-950/20'
    : isCon
    ? 'border-violet-500/40 text-violet-300 bg-violet-950/20'
    : 'border-amber-500/40 text-amber-300 bg-amber-950/20';

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${colorClass}`}>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-navy-900 border border-slate-700">
          <Icon className="w-5 h-5" />
          {isLoading && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
              Active Floor:
            </span>
            <span className="font-bold text-sm text-white">{speakerName}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isLoading ? (
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Synthesizing argument with logical deduction...
              </span>
            ) : isHumanTurn ? (
              <span className="text-emerald-300 font-medium">
                Submit your argument below to respond to your opponent.
              </span>
            ) : status === 'completed' ? (
              'Debate concluded. Final verdict delivered by Judge.'
            ) : (
              'Ready for next speech.'
            )}
          </p>
        </div>
      </div>

      {/* Round & Step Counter */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        <div className="text-right">
          <div className="text-[11px] text-slate-400 uppercase font-mono">Progress</div>
          <div className="text-xs font-mono font-bold text-white">
            Round {currentRound}/{totalRounds} • Step {Math.min(currentStep + 1, totalSteps)}/{totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
};
