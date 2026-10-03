import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Flame, Target, RefreshCw, Check, X, ChevronRight, RotateCcw, Timer, Star, Award } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { BlockMath } from 'react-katex';
import {
  CATEGORIES, DIFFICULTIES,
  generateProblem, getScore, recordAnswer, resetScore,
} from '../engine/practiceEngine';
import {
  awardXP, breakStreak, getGamificationState, getLevel,
} from '../engine/gamificationEngine';

export const PracticeMode = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState('algebra');
  const [difficulty, setDifficulty] = useState('easy');
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(getScore());
  const [showSolution, setShowSolution] = useState(false);
  const [started, setStarted] = useState(false);
  const [gamify, setGamify] = useState(getGamificationState());
  const [xpToast, setXpToast] = useState(null);
  const [badgeToast, setBadgeToast] = useState(null);

  // Timed quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizSize, setQuizSize] = useState(10);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizTimer, setQuizTimer] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const timerRef = useRef(null);

  // Timer tick
  useEffect(() => {
    if (started && quizMode && !quizDone) {
      timerRef.current = setInterval(() => setQuizTimer(t => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [started, quizMode, quizDone]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const newProblem = () => {
    const p = generateProblem(category, difficulty);
    setProblem(p);
    setUserAnswer('');
    setFeedback(null);
    setShowSolution(false);
  };

  const start = (isQuiz = false) => {
    setStarted(true);
    setQuizMode(isQuiz);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizTimer(0);
    setQuizDone(false);
    newProblem();
  };

  const showXpToast = (result) => {
    if (result.xp > 0) {
      setXpToast(`+${result.xp} XP`);
      setTimeout(() => setXpToast(null), 2000);
    }
    if (result.newBadges.length > 0) {
      setBadgeToast(result.newBadges[0]);
      setTimeout(() => setBadgeToast(null), 3500);
    }
    setGamify(getGamificationState());
  };

  const checkAnswer = (e) => {
    e?.preventDefault();
    if (!userAnswer.trim() || !problem) return;

    const normalize = (s) => s.toString().replace(/\s+/g, '').replace(/\*/g, '*').toLowerCase();
    const userNorm = normalize(userAnswer);
    const correctNorm = normalize(problem.answer);

    let isCorrect = userNorm === correctNorm;
    if (!isCorrect) {
      try {
        const userNum = parseFloat(userAnswer);
        const correctNum = parseFloat(problem.answer);
        if (!isNaN(userNum) && !isNaN(correctNum)) isCorrect = Math.abs(userNum - correctNum) < 0.01;
      } catch { /* not numeric */ }
    }
    if (!isCorrect && correctNorm.includes('=')) {
      isCorrect = userNorm === correctNorm.split('=').pop().trim();
    }
    if (!isCorrect && userNorm.includes('=')) {
      isCorrect = userNorm.split('=').pop().trim() === correctNorm;
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    const newScore = recordAnswer(category, isCorrect);
    setScore(newScore);

    // Gamification
    if (isCorrect) {
      const xpAction = `solve_${difficulty}`;
      const result = awardXP(xpAction, { category });
      showXpToast(result);
    } else {
      breakStreak();
      setGamify(getGamificationState());
    }

    // Quiz mode progression
    if (quizMode) {
      if (isCorrect) setQuizCorrect(c => c + 1);
      if (quizIndex + 1 >= quizSize) {
        // Quiz complete
        clearInterval(timerRef.current);
        setQuizDone(true);
        const allCorrect = (isCorrect ? quizCorrect + 1 : quizCorrect) === quizSize;
        if (allCorrect) {
          const result = awardXP('quiz_perfect', { timeSeconds: quizTimer });
          showXpToast(result);
        } else {
          awardXP('quiz_complete');
          setGamify(getGamificationState());
        }
      }
    }
  };

  const nextQuizProblem = () => {
    setQuizIndex(i => i + 1);
    newProblem();
  };

  const handleReset = () => {
    resetScore();
    setScore(getScore());
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
  const level = gamify.level;

  // ─── Quiz Complete Screen ───────────────────────────────────────
  if (quizDone) {
    const quizAccuracy = Math.round((quizCorrect / quizSize) * 100);
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-indigo-500/20 bg-indigo-950/10 text-center py-8">
          <Trophy size={48} className="mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
          <p className="text-gray-400 mb-6">{formatTime(quizTimer)} · {CATEGORIES.find(c => c.id === category)?.name} · {difficulty}</p>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">{quizCorrect}</p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-400">{quizSize - quizCorrect}</p>
              <p className="text-xs text-gray-500">Wrong</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${quizAccuracy >= 80 ? 'text-emerald-400' : quizAccuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{quizAccuracy}%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
          </div>

          {quizAccuracy === 100 && (
            <div className="text-center mb-6 text-amber-400 text-sm font-medium animate-pulse">
              💎 Perfect Score! +100 XP
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button onClick={() => start(true)} className="gap-2 rounded-xl">
              <RefreshCw size={16} /> Try Again
            </Button>
            <Button variant="secondary" onClick={() => setStarted(false)} className="gap-2 rounded-xl">
              Back to Menu
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Category Selection Screen ──────────────────────────────────
  if (!started) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* XP / Level Bar */}
        <Card className="border-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">{level.level}</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-white">{level.title}</span>
                <span className="text-xs text-gray-500">{gamify.xp} / {level.nextXp} XP</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${level.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Badges row */}
          {gamify.earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800/50">
              {gamify.earnedBadges.map(b => (
                <span key={b.id} title={`${b.name}: ${b.description}`} className="text-lg cursor-help hover:scale-125 transition-transform">{b.emoji}</span>
              ))}
              {gamify.lockedBadges.length > 0 && (
                <span className="text-xs text-gray-600 self-center ml-1">+{gamify.lockedBadges.length} locked</span>
              )}
            </div>
          )}
        </Card>

        {/* Score Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="text-center py-4 border-gray-800/50">
            <Target size={20} className="mx-auto text-indigo-400 mb-2" />
            <p className="text-2xl font-bold text-white">{score.total}</p>
            <p className="text-xs text-gray-500">Problems</p>
          </Card>
          <Card className="text-center py-4 border-gray-800/50">
            <Check size={20} className="mx-auto text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-emerald-400">{accuracy}%</p>
            <p className="text-xs text-gray-500">Accuracy</p>
          </Card>
          <Card className="text-center py-4 border-gray-800/50">
            <Flame size={20} className="mx-auto text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-orange-400">{score.streak}</p>
            <p className="text-xs text-gray-500">Streak</p>
          </Card>
          <Card className="text-center py-4 border-gray-800/50">
            <Trophy size={20} className="mx-auto text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-amber-400">{score.bestStreak}</p>
            <p className="text-xs text-gray-500">Best Streak</p>
          </Card>
        </div>

        {/* Category Selection */}
        <Card className="border-gray-800/50">
          <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-5">Choose a Topic</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const catScore = score.byCategory[cat.id];
              const catAccuracy = catScore ? Math.round((catScore.correct / catScore.total) * 100) : 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    category === cat.id
                      ? 'bg-indigo-600/20 border-indigo-500/40 ring-1 ring-indigo-500/30'
                      : 'bg-gray-900/40 border-gray-800/50 hover:border-gray-700'
                  }`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <p className="font-semibold text-white mt-2">{cat.name}</p>
                  {catScore && (
                    <p className="text-xs text-gray-500 mt-1">{catAccuracy}% ({catScore.total} solved)</p>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Difficulty */}
        <Card className="border-gray-800/50">
          <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-5">Difficulty</h3>
          <div className="flex gap-3">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.id}
                onClick={() => setDifficulty(diff.id)}
                className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all cursor-pointer ${
                  difficulty === diff.id
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                    : 'bg-gray-900/40 border-gray-800/50 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className={diff.color}>{diff.name}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Start Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={() => start(false)} className="gap-2 px-8 py-3 rounded-xl text-lg font-semibold">
            <ChevronRight size={20} /> Free Practice
          </Button>
          <Button onClick={() => start(true)} variant="secondary" className="gap-2 px-8 py-3 rounded-xl text-lg font-semibold border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
            <Timer size={20} /> Timed Quiz ({quizSize} Qs)
          </Button>
          {score.total > 0 && (
            <Button variant="secondary" onClick={handleReset} className="gap-2 px-6 py-3 rounded-xl">
              <RotateCcw size={16} /> Reset Score
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ─── Active Practice / Quiz Screen ──────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* XP Toast */}
      {xpToast && (
        <div className="fixed top-24 right-6 z-50 bg-indigo-600/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
          <Star size={14} className="inline mr-1" /> {xpToast}
        </div>
      )}

      {/* Badge Toast */}
      {badgeToast && (
        <div className="fixed top-36 right-6 z-50 bg-amber-600/90 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-xl animate-in fade-in slide-in-from-right-4 duration-300">
          <Award size={14} className="inline mr-1" /> Badge Unlocked: {badgeToast.emoji} {badgeToast.name}
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStarted(false)}
          className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex items-center gap-4">
          {quizMode && (
            <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg">
              <Timer size={12} className="inline mr-1" />{formatTime(quizTimer)} · {quizIndex + 1}/{quizSize}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {CATEGORIES.find(c => c.id === category)?.emoji} {CATEGORIES.find(c => c.id === category)?.name} ·{' '}
            <span className={DIFFICULTIES.find(d => d.id === difficulty)?.color}>{DIFFICULTIES.find(d => d.id === difficulty)?.name}</span>
          </span>
          <div className="flex items-center gap-2 text-sm">
            <Flame size={14} className={score.streak > 0 ? 'text-orange-400' : 'text-gray-600'} />
            <span className={score.streak > 0 ? 'text-orange-400 font-bold' : 'text-gray-600'}>{score.streak}</span>
          </div>
        </div>
      </div>

      {/* Problem Card */}
      {problem && (
        <Card hoverEffect className="border-indigo-500/20 bg-indigo-950/10">
          <h3 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4">Solve this</h3>
          <div className="text-xl sm:text-2xl font-semibold text-white text-center py-6 overflow-x-auto">
            <BlockMath math={problem.problem.replace(/\*/g, '\\cdot ')} />
          </div>
        </Card>
      )}

      {/* Answer Input */}
      {!feedback && (
        <form onSubmit={checkAnswer} className="flex gap-3">
          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Your answer..."
            className="text-lg py-4"
            autoFocus
          />
          <Button type="submit" className="px-8 rounded-xl font-semibold gap-2">
            <Check size={18} /> Check
          </Button>
        </form>
      )}

      {/* Correct Feedback */}
      {feedback === 'correct' && (
        <Card className="border-emerald-500/30 bg-emerald-950/20 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 font-bold">Correct! 🎉</p>
              <p className="text-gray-400 text-sm">Streak: {score.streak}</p>
            </div>
          </div>
          <Button onClick={quizMode ? nextQuizProblem : newProblem} className="mt-4 gap-2 rounded-xl">
            <RefreshCw size={16} /> {quizMode ? 'Next Question' : 'Next Problem'}
          </Button>
        </Card>
      )}

      {/* Incorrect Feedback */}
      {feedback === 'incorrect' && (
        <Card className="border-red-500/30 bg-red-950/20 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <X size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-red-400 font-bold">Not quite</p>
              <p className="text-gray-400 text-sm">The answer is: <span className="text-white font-mono">{problem.answer}</span></p>
            </div>
          </div>
          {!showSolution && problem.steps?.length > 0 && (
            <button onClick={() => setShowSolution(true)} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
              Show solution →
            </button>
          )}
          {showSolution && problem.steps?.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-red-500/10 pt-4">
              {problem.steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 text-sm">
                  <span className="text-gray-600 font-mono shrink-0">{step.step || idx + 1}.</span>
                  <span className="text-gray-400">{step.description}</span>
                </div>
              ))}
            </div>
          )}
          <Button onClick={quizMode ? nextQuizProblem : newProblem} className="mt-4 gap-2 rounded-xl">
            <RefreshCw size={16} /> {quizMode ? 'Next Question' : 'Try Another'}
          </Button>
        </Card>
      )}
    </div>
  );
};
