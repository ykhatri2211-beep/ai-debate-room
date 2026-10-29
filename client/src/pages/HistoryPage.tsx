import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Play,
  Award,
  Calendar,
  Layers,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { api } from '../services/api';
import { DebateSession } from '../types/debate';

interface HistoryPageProps {
  onNavigate: (page: string, debateId?: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const [debates, setDebates] = useState<DebateSession[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [winnerFilter, setWinnerFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDebates = async () => {
    try {
      const data = await api.getDebates();
      setDebates(data);
    } catch (err) {
      console.error('Failed to load debates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebates();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.deleteDebate(deleteId);
      setDebates(debates.filter((d) => d.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportJson = (debate: DebateSession) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(debate, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `debate-${debate.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredDebates = debates.filter((d) => {
    const matchSearch = d.topic.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'ALL' || d.category === categoryFilter;
    const matchMode = modeFilter === 'ALL' || d.mode === modeFilter;
    const matchWinner =
      winnerFilter === 'ALL' ||
      (d.judgeReport && d.judgeReport.winner === winnerFilter);

    return matchSearch && matchCategory && matchMode && matchWinner;
  });

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <History className="w-3.5 h-3.5" />
            HISTORICAL PERSISTENCE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Debate Archives & Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Filter past multi-agent debates, inspect complete transcripts, and export records.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-navy-900 px-3 py-1.5 rounded-xl border border-slate-800">
          Total Archived: <strong className="text-white">{debates.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Ethics & Society">Ethics & Society</option>
            <option value="Workplace & Economics">Workplace & Economics</option>
            <option value="Education & Culture">Education & Culture</option>
            <option value="Science & Environment">Science & Environment</option>
            <option value="Politics & Law">Politics & Law</option>
          </select>
        </div>

        {/* Mode */}
        <div>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Modes</option>
            <option value="ai_vs_ai">AI vs AI (Spectator)</option>
            <option value="human_vs_ai">Human vs AI (Interactive)</option>
          </select>
        </div>

        {/* Winner */}
        <div>
          <select
            value={winnerFilter}
            onChange={(e) => setWinnerFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="ALL">All Outcomes</option>
            <option value="pro">Winner: Pro (Affirmative)</option>
            <option value="con">Winner: Con (Opposition)</option>
            <option value="tie">Draw / Tie</option>
          </select>
        </div>
      </div>

      {/* Debates List */}
      {filteredDebates.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <History className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-50" />
          <p className="text-sm font-semibold">No debates match the selected filters.</p>
          <p className="text-xs text-slate-500">Try clearing your search query or reset the filter dropdowns.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebates.map((d) => (
            <div
              key={d.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
                  <span className="text-cyan-400 font-bold">{d.category}</span>
                  <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 line-clamp-2">
                  "{d.topic}"
                </h3>

                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-navy-900 text-slate-300 border border-slate-800">
                    {d.mode === 'human_vs_ai' ? 'Human vs AI' : 'AI vs AI'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-navy-900 text-slate-300 border border-slate-800">
                    {d.totalRounds} Rounds ({d.transcript.length} speeches)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      d.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {d.status.toUpperCase()}
                  </span>
                </div>

                {/* Score Summary */}
                {d.judgeReport && (
                  <div className="p-3 rounded-xl bg-navy-900 border border-slate-800 mb-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 font-mono">Winner: </span>
                      <strong
                        className={
                          d.judgeReport.winner === 'pro'
                            ? 'text-cyan-400'
                            : d.judgeReport.winner === 'con'
                            ? 'text-violet-400'
                            : 'text-amber-400'
                        }
                      >
                        {d.judgeReport.winner === 'pro'
                          ? 'Alpha-Pro'
                          : d.judgeReport.winner === 'con'
                          ? 'Omega-Con'
                          : 'Draw'}
                      </strong>
                    </div>
                    <div className="font-mono font-bold">
                      <span className="text-cyan-400">{d.judgeReport.proScore}</span>
                      <span className="text-slate-600 mx-1.5">-</span>
                      <span className="text-violet-400">{d.judgeReport.conScore}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onNavigate('arena', d.id)}
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                >
                  View Arena
                </Button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleExportJson(d)}
                    title="Export JSON Transcript"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteId(d.id)}
                    title="Delete Record"
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Session Deletion"
        subtitle="This action will permanently delete this debate and its full adjudication transcript."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Are you sure you want to remove this record from the database?</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button size="sm" variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
