import React, { useState } from 'react';
import { Send, User, Lightbulb, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface HumanInputBoxProps {
  onSubmit: (content: string, claim?: string) => Promise<void>;
  disabled: boolean;
  userRole: 'pro' | 'con';
  round: number;
}

export const HumanInputBox: React.FC<HumanInputBoxProps> = ({
  onSubmit,
  disabled,
  userRole,
  round,
}) => {
  const [content, setContent] = useState('');
  const [claim, setClaim] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Please provide an argument speech. Empty submissions are not permitted.');
      return;
    }

    if (content.trim().length < 20) {
      setError('Your argument is too brief. Elaborate with supporting evidence (minimum 20 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), claim.trim() || undefined);
      setContent('');
      setClaim('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit argument.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/10 shadow-glow-indigo">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Deliver Your {userRole.toUpperCase()} Argument (Round {round})
            </h4>
            <p className="text-xs text-slate-400">
              The AI opponent and judge will analyze and respond directly to your submission.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          YOUR TURN
        </span>
      </div>

      {error && (
        <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Core Contention / Headline Claim (Optional)
          </label>
          <input
            type="text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            disabled={disabled || isSubmitting}
            placeholder="e.g., Empirical studies show that asynchronous workflows reduce operational overhead..."
            className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <label className="font-semibold text-slate-300">Argument Speech & Evidence</label>
            <span className="font-mono">{wordCount} words • {content.length} characters</span>
          </div>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSubmitting}
            placeholder={`State your argumentative thesis, substantiate with reasoning or examples, and refute the opponent's previous counterarguments... (Ctrl + Enter to send)`}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Tip: The judge weights Logical Consistency (25%) and Evidence (25%) highest.</span>
          </div>

          <Button
            type="submit"
            variant="cyan"
            size="md"
            isLoading={isSubmitting}
            disabled={disabled || !content.trim()}
            rightIcon={<Send className="w-4 h-4" />}
          >
            Deliver Argument
          </Button>
        </div>
      </form>
    </div>
  );
};
