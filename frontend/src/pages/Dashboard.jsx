import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { LogOut, Calculator, Clock, Pencil, Trophy } from "lucide-react";
import { MathSolver } from "../components/MathSolver";
import { History } from "../components/History";
import { DrawingCanvas } from "../components/DrawingCanvas";
import { PracticeMode } from "../components/PracticeMode";
import { LanguagePicker } from "../components/LanguagePicker";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Dashboard() {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('solve');
  const [historyKey, setHistoryKey] = useState(0);
  const [drawnEquation, setDrawnEquation] = useState('');

  const handleHistoryUpdate = () => {
    setHistoryKey(k => k + 1);
  };

  const handleDrawnEquation = (text) => {
    setDrawnEquation(text);
    setActiveTab('solve');
  };

  const loadProblemFromHistory = () => {
    setActiveTab('solve');
  };

  const tabs = [
    { id: 'solve', icon: <Calculator size={16} />, label: t('tabs.solver') },
    { id: 'practice', icon: <Trophy size={16} />, label: 'Practice' },
    { id: 'draw', icon: <Pencil size={16} />, label: t('canvas.draw') },
    { id: 'history', icon: <Clock size={16} />, label: t('tabs.history') },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-900/10 blur-[150px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cyan-900/10 blur-[150px] rounded-full -translate-x-1/4 translate-y-1/4"></div>
      </div>
      
      <header className="z-10 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="text-white font-bold text-xl">∑</span>
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
              MathMate<span className="text-indigo-400">.AI</span>
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <LanguagePicker />
            <ThemeToggle />
            <button 
              onClick={logout}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <LogOut size={18} />
              <span className="font-medium text-sm hidden sm:inline">{t('nav.signOut')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="w-full mx-auto space-y-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {t('solver.title')} <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">{t('solver.titleHighlight')}</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              {t('solver.subtitle')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-1 bg-gray-900/60 backdrop-blur-xl rounded-2xl p-1.5 max-w-lg mx-auto border border-gray-800/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'solve' && (
            <MathSolver onHistoryUpdate={handleHistoryUpdate} initialInput={drawnEquation} />
          )}
          {activeTab === 'practice' && (
            <PracticeMode />
          )}
          {activeTab === 'draw' && (
            <DrawingCanvas onEquationExtracted={handleDrawnEquation} />
          )}
          {activeTab === 'history' && (
            <History key={historyKey} onLoadProblem={loadProblemFromHistory} />
          )}
        </div>
      </main>
    </div>
  );
}
