import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Award,
  Trophy,
  Scale,
  Sparkles,
  Shield,
  Printer,
  X,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  BarChart2
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { JudgeEvaluation, DebateSession } from '../../types/debate';
import { Button } from '../ui/Button';

interface JudgeVerdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: JudgeEvaluation;
  session: DebateSession;
}

export const JudgeVerdictModal: React.FC<JudgeVerdictModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  session,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger subtle celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#a78bfa', '#fbbf24'],
        });
      } catch (e) {
        // Safe fallback if canvas-confetti is not loaded
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isProWinner = evaluation.winner === 'pro';
  const isConWinner = evaluation.winner === 'con';
  const isTie = evaluation.winner === 'tie';

  // Format data for radar & bar charts
  const radarData = [
    {
      subject: 'Logic (25%)',
      Pro: evaluation.breakdown.logicalConsistency.pro,
      Con: evaluation.breakdown.logicalConsistency.con,
      fullMark: 100,
    },
    {
      subject: 'Evidence (25%)',
      Pro: evaluation.breakdown.evidenceAndExamples.pro,
      Con: evaluation.breakdown.evidenceAndExamples.con,
      fullMark: 100,
    },
    {
      subject: 'Rebuttal (20%)',
      Pro: evaluation.breakdown.rebuttalQuality.pro,
      Con: evaluation.breakdown.rebuttalQuality.con,
      fullMark: 100,
    },
    {
      subject: 'Relevance (15%)',
      Pro: evaluation.breakdown.relevance.pro,
      Con: evaluation.breakdown.relevance.con,
      fullMark: 100,
    },
    {
      subject: 'Clarity (15%)',
      Pro: evaluation.breakdown.clarityAndStructure.pro,
      Con: evaluation.breakdown.clarityAndStructure.con,
      fullMark: 100,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/85 backdrop-blur-md no-print"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-5xl bg-navy-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800 no-print">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold">
                  OFFICIAL ADJUDICATION VERDICT
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-navy-800 text-slate-300 border border-slate-700">
                  {session.category} • {session.difficulty}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                "{session.topic}"
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Winner Banner */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-navy-800 via-navy-850 to-navy-800 border border-slate-700 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            {isTie ? 'COMPETITIVE DRAW' : isProWinner ? 'AFFIRMATIVE (PRO) PREVAILED' : 'OPPOSITION (CON) PREVAILED'}
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {evaluation.verdictTitle}
          </h3>

          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            {evaluation.executiveRationale}
          </p>

          {/* Large Score Comparison */}
          <div className="grid grid-cols-2 max-w-md mx-auto mt-6 p-4 rounded-xl bg-navy-950/70 border border-slate-800 gap-4">
            <div className={`p-3 rounded-lg border ${isProWinner ? 'border-cyan-500/40 bg-cyan-950/30' : 'border-slate-800'}`}>
              <div className="text-xs uppercase font-mono text-cyan-400 font-bold mb-1">
                Alpha-Pro
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-300 font-mono">
                {evaluation.proScore}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Weighted / 100</div>
            </div>

            <div className={`p-3 rounded-lg border ${isConWinner ? 'border-violet-500/40 bg-violet-950/30' : 'border-slate-800'}`}>
              <div className="text-xs uppercase font-mono text-violet-400 font-bold mb-1">
                Omega-Con
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-violet-300 font-mono">
                {evaluation.conScore}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Weighted / 100</div>
            </div>
          </div>
        </div>

        {/* Radar & Rubric Breakdown Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="p-5 rounded-2xl bg-navy-850/60 border border-slate-800 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                Category Rubric Comparison
              </h4>
              <span className="text-xs text-slate-400 font-mono">5 Rubrics (100% Total)</span>
            </div>
            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="Alpha-Pro" dataKey="Pro" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                  <Radar name="Omega-Con" dataKey="Con" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.4} />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rubric Category Table */}
          <div className="p-5 rounded-2xl bg-navy-850/60 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white mb-2">Detailed Rubric Scores</h4>

            {Object.entries(evaluation.breakdown).map(([key, item]) => {
              const rubricNames: Record<string, string> = {
                logicalConsistency: 'Logical Consistency',
                evidenceAndExamples: 'Evidence & Examples',
                rebuttalQuality: 'Rebuttal Quality',
                relevance: 'Relevance to Topic',
                clarityAndStructure: 'Clarity & Structure',
              };

              return (
                <div key={key} className="p-3 rounded-xl bg-navy-900 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">{rubricNames[key] || key}</span>
                    <span className="font-mono text-slate-400">
                      Weight: {Math.round(item.weight * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-xs mb-1.5">
                    <span className="text-cyan-400">Pro: {item.pro}/100</span>
                    <span className="text-violet-400">Con: {item.con}/100</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-300">Analysis:</strong> {item.proNotes}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strongest & Weakest Matrix */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Analysis */}
          <div className="p-5 rounded-2xl bg-navy-850/60 border border-cyan-500/20 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              Alpha-Pro Performance Matrix
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-cyan-500/20 text-xs">
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Strongest Argument
              </div>
              <p className="text-slate-200">{evaluation.strongestArgumentPro}</p>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-rose-500/20 text-xs">
              <div className="text-[10px] uppercase font-bold text-rose-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Key Vulnerability / Weakest Point
              </div>
              <p className="text-slate-200">{evaluation.weakestArgumentPro}</p>
            </div>
          </div>

          {/* Con Analysis */}
          <div className="p-5 rounded-2xl bg-navy-850/60 border border-violet-500/20 space-y-3">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              Omega-Con Performance Matrix
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-violet-500/20 text-xs">
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Strongest Argument
              </div>
              <p className="text-slate-200">{evaluation.strongestArgumentCon}</p>
            </div>
            <div className="p-3 rounded-xl bg-navy-900 border border-rose-500/20 text-xs">
              <div className="text-[10px] uppercase font-bold text-rose-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Key Vulnerability / Weakest Point
              </div>
              <p className="text-slate-200">{evaluation.weakestArgumentCon}</p>
            </div>
          </div>
        </div>

        {/* Counterarguments & Neutral Synthesis */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-navy-850/60 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Critical Dialectical Counterarguments
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {evaluation.keyCounterarguments.map((arg, idx) => (
                <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-navy-900 border border-slate-800">
                  <span className="text-indigo-400 font-bold mt-0.5">•</span>
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-navy-850/60 border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Suggestions for the Weaker Side
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-navy-900 border border-amber-500/20">
              {evaluation.suggestionsForWeakerSide}
            </p>

            <h4 className="text-sm font-bold text-white mt-4">Impartial Synthesis</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {evaluation.neutralSummary}
            </p>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>
            *Adjudication generated by the AI Arbiter based strictly on the 5-category evaluation rubric.
          </p>
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close Scorecard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
