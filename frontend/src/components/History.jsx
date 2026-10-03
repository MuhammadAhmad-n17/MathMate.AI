import React, { useState, useEffect } from 'react';
import { Clock, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from './ui/Card';
import { BlockMath } from 'react-katex';

// History is stored in localStorage for instant access without API
const HISTORY_KEY = 'mathmate_history';
const MAX_HISTORY = 50;

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToHistory(input, solution) {
  const history = getHistory();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    input,
    answer: solution.answer || solution.solution,
    latex: solution.latex,
    steps: solution.steps,
    graphExpression: solution.graphExpression,
    method: solution.solvedLocally ? 'local' : 'cloud',
    timestamp: Date.now(),
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return entry;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export const History = ({ onLoadProblem }) => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const filteredHistory = history.filter(entry =>
    entry.input?.toLowerCase().includes(search.toLowerCase()) ||
    entry.answer?.toLowerCase().includes(search.toLowerCase())
  );

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  if (history.length === 0) {
    return (
      <Card className="border-gray-800/50 text-center py-12">
        <Clock size={32} className="mx-auto text-gray-600 mb-3" />
        <h3 className="text-gray-400 font-medium mb-1">No history yet</h3>
        <p className="text-gray-600 text-sm">Solved problems will appear here</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 cursor-pointer"
        >
          <Trash2 size={14} />
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {filteredHistory.map((entry) => (
          <div
            key={entry.id}
            className="bg-gray-900/40 border border-gray-800/50 rounded-2xl overflow-hidden transition-all duration-200 hover:border-gray-700/50"
          >
            <button
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="w-full px-5 py-4 flex items-center gap-4 text-left cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-gray-200 truncate">{entry.input}</p>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-gray-500">{formatTime(entry.timestamp)}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    entry.method === 'local'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {entry.method === 'local' ? 'Local' : 'AI'}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0 max-w-[40%] overflow-hidden">
                <p className="text-sm text-indigo-300 font-medium truncate">{entry.answer}</p>
              </div>
              {expandedId === entry.id ? <ChevronUp size={16} className="text-gray-500 shrink-0" /> : <ChevronDown size={16} className="text-gray-500 shrink-0" />}
            </button>

            {expandedId === entry.id && (
              <div className="px-5 pb-4 border-t border-gray-800/50 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
                {entry.latex && (
                  <div className="bg-gray-950/60 rounded-xl p-4 mb-3 overflow-x-auto">
                    <BlockMath math={entry.latex} />
                  </div>
                )}
                {entry.steps?.length > 0 && (
                  <div className="space-y-2">
                    {entry.steps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 text-xs">
                        <span className="text-gray-600 font-mono shrink-0">{step.step || idx + 1}.</span>
                        <span className="text-gray-400">{step.description}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => onLoadProblem?.(entry.input)}
                  className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Solve again →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-gray-600 text-xs">
        {filteredHistory.length} of {history.length} problems • Stored locally on your device
      </p>
    </div>
  );
};
