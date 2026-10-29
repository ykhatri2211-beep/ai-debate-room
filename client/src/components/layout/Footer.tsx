import React from 'react';
import { Swords, Award, Shield, Code, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-navy-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-cyan-400">
                <Swords className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">AI Debate Room</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Academic Capstone
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              An advanced multi-agent dialectical platform built for Software Engineering demonstrations.
              Autonomous LLM agents argue propositions, rebut counterclaims, and undergo formal algorithmic adjudication.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-slate-800 text-slate-300">
                React 19 + TypeScript
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-slate-800 text-slate-300">
                Tailwind CSS
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-slate-800 text-slate-300">
                Node.js + Express
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-slate-800 text-slate-300">
                Google Gemini API
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-slate-800 text-slate-300">
                Framer Motion
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Debate Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Alpha-Pro (Affirmative)
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-violet-400" />
                Omega-Con (Opposition)
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                The Chief Arbiter (AI Judge)
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                Deterministic Turn Controller
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Evaluation Rubrics
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex justify-between">
                <span>Logical Consistency</span>
                <span className="font-mono text-cyan-400">25%</span>
              </li>
              <li className="flex justify-between">
                <span>Evidence & Examples</span>
                <span className="font-mono text-cyan-400">25%</span>
              </li>
              <li className="flex justify-between">
                <span>Rebuttal Quality</span>
                <span className="font-mono text-cyan-400">20%</span>
              </li>
              <li className="flex justify-between">
                <span>Relevance to Motion</span>
                <span className="font-mono text-cyan-400">15%</span>
              </li>
              <li className="flex justify-between">
                <span>Clarity & Structure</span>
                <span className="font-mono text-cyan-400">15%</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI Debate Room. College Software Engineering Capstone Project.</p>
          <p className="text-slate-400">
            Engineered with modern full-stack architecture & reliable failover simulation.
          </p>
        </div>
      </div>
    </footer>
  );
};
