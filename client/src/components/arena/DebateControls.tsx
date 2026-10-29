import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Award,
  RotateCcw,
  Square,
  FileDown,
  Volume2,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/Button';

interface DebateControlsProps {
  status: string;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  onNextTurn: () => void;
  onPauseResume: () => void;
  onFinalizeEarly: () => void;
  onOpenReport?: () => void;
  isLoading: boolean;
  canAdvance: boolean;
  canFinalize: boolean;
  isHumanTurn: boolean;
}

export const DebateControls: React.FC<DebateControlsProps> = ({
  status,
  isAutoPlay,
  onToggleAutoPlay,
  onNextTurn,
  onPauseResume,
  onFinalizeEarly,
  onOpenReport,
  isLoading,
  canAdvance,
  canFinalize,
  isHumanTurn,
}) => {
  const isCompleted = status === 'completed';
  const isEvaluating = status === 'evaluating';
  const isPaused = status === 'paused';

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-card-subtle">
      {/* Left controls: Auto-play and Step */}
      <div className="flex flex-wrap items-center gap-2">
        {!isCompleted && !isEvaluating && (
          <>
            <Button
              size="sm"
              variant={isAutoPlay ? 'cyan' : 'secondary'}
              onClick={onToggleAutoPlay}
              disabled={isLoading || isHumanTurn}
              leftIcon={isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isAutoPlay ? 'Auto-Advancing' : 'Auto-Play'}
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={onNextTurn}
              disabled={isLoading || isHumanTurn || !canAdvance}
              leftIcon={<SkipForward className="w-3.5 h-3.5" />}
            >
              Next Speech
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onPauseResume}
              disabled={isLoading}
              leftIcon={isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          </>
        )}
      </div>

      {/* Right controls: Finalize / Adjudicate or View Report */}
      <div className="flex items-center gap-2">
        {canFinalize && !isCompleted && !isEvaluating && (
          <Button
            size="sm"
            variant="violet"
            onClick={onFinalizeEarly}
            isLoading={isEvaluating}
            leftIcon={<Award className="w-3.5 h-3.5" />}
          >
            Adjudicate Now
          </Button>
        )}

        {isCompleted && onOpenReport && (
          <Button
            size="sm"
            variant="cyan"
            onClick={onOpenReport}
            leftIcon={<Award className="w-3.5 h-3.5" />}
          >
            View Adjudication Scorecard
          </Button>
        )}
      </div>
    </div>
  );
};
