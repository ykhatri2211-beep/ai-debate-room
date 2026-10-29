import React, { useEffect, useState } from 'react';
import {
  Swords,
  PlusCircle,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart2,
  PieChart as PieIcon,
  Play
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { DebateSession, DashboardStats } from '../types/debate';

interface DashboardPageProps {
  onNavigate: (page: string, debateId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [debates, setDebates] = useState<DebateSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getDebates()])
      .then(([statsData, debatesData]) => {
        setStats(statsData);
        setDebates(debatesData);
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const categoryChartData = stats?.categoryDistribution
    ? Object.entries(stats.categoryDistribution).map(([name, count]) => ({
        name: name.length > 14 ? `${name.slice(0, 12)}...` : name,
        fullName: name,
        count,
      }))
    : [];

  const COLORS = ['#06b6d4', '#6366f1', '#a78bfa', '#10b981', '#f59e0b', '#f43f5e'];

  const suggestedTopics = [
    {
      title: 'Should AI replace human programmers?',
      category: 'Technology',
      difficulty: 'Advanced',
    },
    {
      title: 'Is remote work better than office work?',
      category: 'Workplace & Economics',
      difficulty: 'Intermediate',
    },
    {
      title: 'Should social media have stricter regulations?',
      category: 'Ethics & Society',
      difficulty: 'Intermediate',
    },
  ];

  return (
    <div className="space-y-8 py-4 sm:py-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            PLATFORM ANALYTICS ACTIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Multi-Agent Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor autonomous debates, review algorithmic scorecards, and initiate new dialectical matches.
          </p>
        </div>

        <Button
          size="md"
          variant="cyan"
          onClick={() => onNavigate('create')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Quick Start Debate
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debates */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-slate-400 font-semibold">
              Total Debates
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Swords className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {stats?.totalDebates ?? '--'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recorded across sessions</p>
        </div>

        {/* Completed Matches */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-slate-400 font-semibold">
              Completed Matches
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-300 font-mono">
            {stats?.completedDebates ?? '--'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Fully adjudicated by Judge</p>
        </div>

        {/* Average Debate Score */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-slate-400 font-semibold">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-cyan-300 font-mono">
            {stats?.averageScore ? `${stats.averageScore}/100` : '--'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Rubric composite index</p>
        </div>

        {/* Win Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-slate-400 font-semibold">
              Pro vs Con Win Ratio
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono flex items-center gap-2">
            <span className="text-cyan-400">{stats?.winnerDistribution?.pro ?? 0}</span>
            <span className="text-slate-600">:</span>
            <span className="text-violet-400">{stats?.winnerDistribution?.con ?? 0}</span>
            {stats?.winnerDistribution?.tie ? (
              <span className="text-xs text-amber-400 font-normal">({stats.winnerDistribution.tie} ties)</span>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Affirmative vs Opposition</p>
        </div>
      </div>

      {/* Analytics Chart & Suggested Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Chart */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Category Activity Distribution</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Sessions per domain</span>
          </div>

          <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Launch Suggested Topics */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-base">Faculty Demo Prompts</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Curated controversial topics optimized for multi-round academic clash:
            </p>

            <div className="space-y-2.5">
              {suggestedTopics.map((topic, i) => (
                <div
                  key={i}
                  onClick={() => onNavigate('create')}
                  className="p-3 rounded-xl bg-navy-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:bg-navy-850 group"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                    <span className="text-cyan-400">{topic.category}</span>
                    <span>{topic.difficulty}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {topic.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full mt-4"
            onClick={() => onNavigate('create')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Custom Debate Config
          </Button>
        </div>
      </div>

      {/* Recent Debates Table */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Recent Debate Sessions</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate('history')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View All ({debates.length})
          </Button>
        </div>

        {debates.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Swords className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm">No debates found. Click "Quick Start Debate" to launch one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Topic</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Mode</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Winner</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {debates.slice(0, 5).map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-semibold text-white max-w-xs truncate">
                      {d.topic}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-navy-900 border border-slate-700 text-[10px] text-slate-300">
                        {d.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {d.mode === 'human_vs_ai' ? 'Human vs AI' : 'AI vs AI'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : d.status === 'in_progress'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {d.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {d.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {d.judgeReport ? (
                        <span
                          className={
                            d.judgeReport.winner === 'pro'
                              ? 'text-cyan-400'
                              : d.judgeReport.winner === 'con'
                              ? 'text-violet-400'
                              : 'text-amber-400'
                          }
                        >
                          {d.judgeReport.winner === 'pro'
                            ? 'Pro (Affirmative)'
                            : d.judgeReport.winner === 'con'
                            ? 'Con (Opposition)'
                            : 'Tie'}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-normal">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate('arena', d.id)}
                        rightIcon={<Play className="w-3 h-3" />}
                      >
                        Open Arena
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
