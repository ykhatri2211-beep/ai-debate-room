import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Play,
  Pause,
  SkipForward,
  Award,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Scale,
  Shield,
  Loader2,
  FileDown,
  Printer,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { DebateSession, ArgumentMessage, JudgeEvaluation } from '../types/debate';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AgentCard } from '../components/arena/AgentCard';
import { ArgumentBubble } from '../components/arena/ArgumentBubble';
import { TurnIndicator } from '../components/arena/TurnIndicator';
import { HumanInputBox } from '../components/arena/HumanInputBox';
import { DebateControls } from '../components/arena/DebateControls';
import { JudgeVerdictModal } from '../components/results/JudgeVerdictModal';

interface ArenaPageProps {
  debateId: string;
  onNavigate: (page: string, debateId?: string) => void;
}

export const ArenaPage: React.FC<ArenaPageProps> = ({ debateId, onNavigate }) => {
  const [session, setSession] = useState<DebateSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTurnLoading, setIsTurnLoading] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showVerdictModal, setShowVerdictModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<any>(null);

  // Fetch initial debate session
  const fetchSession = async () => {
    try {
      const data = await api.getDebate(debateId);
      setSession(data);
      if (data.status === 'completed' && data.judgeReport) {
        // Modal can be opened
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load debate.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [debateId]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (autoScroll && transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.transcript.length, autoScroll]);

  // Auto-play runner
  useEffect(() => {
    if (!isAutoPlay || !session || isTurnLoading) return;

    if (session.status === 'completed') {
      setIsAutoPlay(false);
      setShowVerdictModal(true);
      return;
    }

    if (session.status === 'paused') {
      return;
    }

    // If it's a human turn, auto-play must pause and wait for user input
    if (session.mode === 'human_vs_ai' && session.currentTurnSpeaker === 'human') {
      setIsAutoPlay(false);
      return;
    }

    // Schedule next turn
    autoPlayTimerRef.current = setTimeout(() => {
      handleNextTurn();
    }, 2500);

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isAutoPlay, session?.currentStep, session?.status, isTurnLoading]);

  // Next Turn execution
  const handleNextTurn = async () => {
    if (!session || isTurnLoading) return;
    setError(null);
    setIsTurnLoading(true);

    try {
      const result = await api.executeTurn(session.id);
      setSession(result.session);

      if (result.isFinished && result.judgeReport) {
        setIsAutoPlay(false);
        setShowVerdictModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process turn.');
      setIsAutoPlay(false);
    } finally {
      setIsTurnLoading(false);
    }
  };

  // Submit human argument
  const handleHumanSubmit = async (content: string, claim?: string) => {
    if (!session) return;
    setError(null);
    setIsTurnLoading(true);

    try {
      const result = await api.submitHumanTurn(session.id, content, claim);
      setSession(result.session);

      if (result.isFinished && result.judgeReport) {
        setShowVerdictModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit human argument.');
    } finally {
      setIsTurnLoading(false);
    }
  };

  // Finalize early
  const handleFinalizeEarly = async () => {
    if (!session) return;
    setIsTurnLoading(true);
    setIsAutoPlay(false);
    setError(null);

    try {
      const result = await api.finalizeDebate(session.id, true);
      setSession(result.session);
      setShowVerdictModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to adjudicate debate.');
    } finally {
      setIsTurnLoading(false);
    }
  };

  // Pause / Resume
  const handlePauseResume = async () => {
    if (!session) return;
    const nextStatus = session.status === 'paused' ? 'in_progress' : 'paused';
    try {
      const updated = await api.updateDebateStatus(session.id, nextStatus);
      setSession(updated);
      if (nextStatus === 'paused') setIsAutoPlay(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
        <p className="text-sm font-mono text-slate-400">Loading Debate Arena Workspace...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Debate Session Not Found</h2>
        <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const proSpeechCount = session.transcript.filter((m: ArgumentMessage) => m.role === 'pro').length;
  const conSpeechCount = session.transcript.filter((m: ArgumentMessage) => m.role === 'con').length;
  const isHumanTurn = session.mode === 'human_vs_ai' && session.currentTurnSpeaker === 'human';
  const progressPercent = Math.min(100, Math.round((session.currentStep / session.totalSteps) * 100));

  return (
    <div className="space-y-6 py-4">
      {/* Top Breadcrumb & Motion Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-navy-900 text-slate-300 border border-slate-700">
              {session.category}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-navy-900 text-slate-300 border border-slate-700">
              {session.difficulty}
            </span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                session.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {session.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Debate Motion Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-4">
          "{session.topic}"
        </h1>

        {/* Live Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>
              Round {session.currentRound} of {session.totalRounds} • Step {session.currentStep} of {session.totalSteps}
            </span>
            <span className="font-bold text-cyan-400">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2 bg-navy-950 rounded-full overflow-hidden border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Three Agent Status Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AgentCard
          role="pro"
          isSpeaking={session.currentTurnSpeaker === 'ai_pro' || (session.currentTurnSpeaker === 'human' && session.humanPosition === 'pro')}
          speakerType={session.humanPosition === 'pro' ? 'human' : 'ai_pro'}
          speechCount={proSpeechCount}
          mode={session.mode}
          humanPosition={session.humanPosition}
        />

        <AgentCard
          role="judge"
          isSpeaking={session.currentTurnSpeaker === 'judge' || session.status === 'evaluating'}
          speakerType="judge"
          speechCount={session.transcript.length}
          mode={session.mode}
        />

        <AgentCard
          role="con"
          isSpeaking={session.currentTurnSpeaker === 'ai_con' || (session.currentTurnSpeaker === 'human' && session.humanPosition === 'con')}
          speakerType={session.humanPosition === 'con' ? 'human' : 'ai_con'}
          speechCount={conSpeechCount}
          mode={session.mode}
          humanPosition={session.humanPosition}
        />
      </div>

      {/* Turn Indicator */}
      <TurnIndicator
        currentTurnSpeaker={session.currentTurnSpeaker}
        currentStep={session.currentStep}
        totalSteps={session.totalSteps}
        currentRound={session.currentRound}
        totalRounds={session.totalRounds}
        isLoading={isTurnLoading}
        status={session.status}
      />

      {/* Control Bar */}
      <DebateControls
        status={session.status}
        isAutoPlay={isAutoPlay}
        onToggleAutoPlay={() => setIsAutoPlay(!isAutoPlay)}
        onNextTurn={handleNextTurn}
        onPauseResume={handlePauseResume}
        onFinalizeEarly={handleFinalizeEarly}
        onOpenReport={() => setShowVerdictModal(true)}
        isLoading={isTurnLoading}
        canAdvance={session.currentStep < session.totalSteps && !isHumanTurn}
        canFinalize={session.transcript.length >= 2}
        isHumanTurn={isHumanTurn}
      />

      {/* Human Input Box (When Human Turn) */}
      {isHumanTurn && session.status !== 'completed' && (
        <HumanInputBox
          onSubmit={handleHumanSubmit}
          disabled={isTurnLoading}
          userRole={session.humanPosition || 'pro'}
          round={session.currentRound}
        />
      )}

      {/* Transcript Stream Section */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Live Dialectical Transcript</h3>
            <span className="text-xs text-slate-400 font-mono">
              ({session.transcript.length} speeches delivered)
            </span>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-navy-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Auto-scroll to latest speech</span>
          </label>
        </div>

        {session.transcript.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm">The debate floor is open. Ready for the opening statement.</p>
            {session.mode === 'ai_vs_ai' ? (
              <Button size="sm" variant="cyan" onClick={handleNextTurn} isLoading={isTurnLoading}>
                Begin Opening Statement
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {session.transcript.map((msg: ArgumentMessage, idx: number) => (
              <ArgumentBubble key={msg.id || idx} message={msg} index={idx} />
            ))}

            {/* Active Turn In-Progress Indicator Bubble */}
            {isTurnLoading && (
              <div className="p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 flex items-center gap-3 animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                <span className="text-xs font-mono text-cyan-300">
                  {session.currentTurnSpeaker === 'judge'
                    ? 'Chief Arbiter is evaluating the transcript against the 5 rubrics...'
                    : 'Active Agent is formulating structured argument and citations...'}
                </span>
              </div>
            )}

            <div ref={transcriptBottomRef} />
          </div>
        )}
      </div>

      {/* Verdict & Scorecard Modal */}
      {session.judgeReport && (
        <JudgeVerdictModal
          isOpen={showVerdictModal}
          onClose={() => setShowVerdictModal(false)}
          evaluation={session.judgeReport}
          session={session}
        />
      )}
    </div>
  );
};
