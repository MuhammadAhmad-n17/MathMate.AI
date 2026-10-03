/**
 * MathMate.AI — Practice Problem Generator
 * 
 * Generates random math problems by category and difficulty.
 * All problems are solvable by the local math engine.
 */

import { solveLocally } from './mathEngine';

// ─── Random Helpers ─────────────────────────────────────────────

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Problem Generators ─────────────────────────────────────────

const generators = {
  arithmetic: {
    easy: () => {
      const a = rand(1, 20), b = rand(1, 20);
      const op = pick(['+', '-', '*']);
      return `${a} ${op} ${b}`;
    },
    medium: () => {
      const a = rand(10, 100), b = rand(2, 50), c = rand(1, 30);
      const op1 = pick(['+', '-', '*']);
      const op2 = pick(['+', '-']);
      return `${a} ${op1} ${b} ${op2} ${c}`;
    },
    hard: () => {
      const a = rand(50, 500), b = rand(2, 20), c = rand(10, 100), d = rand(2, 10);
      return `(${a} + ${b} * ${c}) / ${d}`;
    },
  },

  algebra: {
    easy: () => {
      const a = rand(1, 10), b = rand(1, 30);
      return `${a}x + ${rand(1, 10)} = ${b}`;
    },
    medium: () => {
      const a = rand(1, 5), b = rand(-10, 10), c = rand(-20, 20);
      return `${a}x^2 + ${b}x + ${c} = 0`;
    },
    hard: () => {
      const a = rand(1, 3), b = rand(-8, 8), c = rand(-15, 15), d = rand(-10, 10);
      return `${a}x^3 + ${b}x^2 + ${c}x + ${d} = 0`;
    },
  },

  calculus: {
    easy: () => {
      const a = rand(1, 10), n = rand(2, 5);
      return `derivative of ${a}*x^${n}`;
    },
    medium: () => {
      const a = rand(1, 5), b = rand(1, 8), n = rand(2, 4);
      const func = pick(['sin', 'cos']);
      return `derivative of ${a}*x^${n} + ${b}*${func}(x)`;
    },
    hard: () => {
      const a = rand(1, 6), n = rand(2, 5);
      return `integrate ${a}*x^${n}`;
    },
  },

  trigonometry: {
    easy: () => {
      const angle = pick(['pi/6', 'pi/4', 'pi/3', 'pi/2', 'pi']);
      const func = pick(['sin', 'cos', 'tan']);
      return `${func}(${angle})`;
    },
    medium: () => {
      const a = rand(1, 5);
      const func = pick(['sin', 'cos']);
      return `derivative of ${a}*${func}(x)`;
    },
    hard: () => {
      const func = pick(['sin', 'cos']);
      return `integrate ${func}(x)`;
    },
  },

  factoring: {
    easy: () => {
      const a = rand(1, 10);
      return `factor x^2 - ${a * a}`;
    },
    medium: () => {
      const r1 = rand(1, 8), r2 = rand(1, 8);
      const b = r1 + r2, c = r1 * r2;
      return `factor x^2 + ${b}x + ${c}`;
    },
    hard: () => {
      const a = rand(1, 5), r1 = rand(-5, 5), r2 = rand(-5, 5);
      const b = -(r1 + r2) * a, c = r1 * r2 * a;
      return `factor ${a}x^2 + ${b}x + ${c}`;
    },
  },
};

// ─── Public API ─────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 'arithmetic', name: 'Arithmetic', emoji: '🔢' },
  { id: 'algebra', name: 'Algebra', emoji: '📐' },
  { id: 'calculus', name: 'Calculus', emoji: '∫' },
  { id: 'trigonometry', name: 'Trigonometry', emoji: '📏' },
  { id: 'factoring', name: 'Factoring', emoji: '🧩' },
];

export const DIFFICULTIES = [
  { id: 'easy', name: 'Easy', color: 'text-emerald-400' },
  { id: 'medium', name: 'Medium', color: 'text-amber-400' },
  { id: 'hard', name: 'Hard', color: 'text-red-400' },
];

/**
 * Generate a practice problem.
 * @returns {{ problem: string, answer: string, steps: Array, latex: string }}
 */
export function generateProblem(category = 'algebra', difficulty = 'easy') {
  const gen = generators[category]?.[difficulty];
  if (!gen) return null;

  // Try up to 5 times to get a solvable problem
  for (let i = 0; i < 5; i++) {
    const problem = gen();
    const result = solveLocally(problem);
    if (result.success) {
      return {
        problem,
        answer: result.data.answer || result.data.solution,
        steps: result.data.steps,
        latex: result.data.latex,
        category,
        difficulty,
      };
    }
  }

  // Fallback to a simple problem
  const fallback = `${rand(1, 10)} + ${rand(1, 10)}`;
  const result = solveLocally(fallback);
  return {
    problem: fallback,
    answer: result.success ? result.data.answer : '',
    steps: result.success ? result.data.steps : [],
    latex: result.success ? result.data.latex : '',
    category: 'arithmetic',
    difficulty: 'easy',
  };
}

// ─── Score Persistence ──────────────────────────────────────────

const SCORE_KEY = 'mathmate_practice_score';

export function getScore() {
  try {
    return JSON.parse(localStorage.getItem(SCORE_KEY)) || {
      total: 0, correct: 0, streak: 0, bestStreak: 0,
      byCategory: {},
    };
  } catch { return { total: 0, correct: 0, streak: 0, bestStreak: 0, byCategory: {} }; }
}

export function recordAnswer(category, isCorrect) {
  const score = getScore();
  score.total++;
  if (isCorrect) {
    score.correct++;
    score.streak++;
    if (score.streak > score.bestStreak) score.bestStreak = score.streak;
  } else {
    score.streak = 0;
  }

  if (!score.byCategory[category]) {
    score.byCategory[category] = { total: 0, correct: 0 };
  }
  score.byCategory[category].total++;
  if (isCorrect) score.byCategory[category].correct++;

  localStorage.setItem(SCORE_KEY, JSON.stringify(score));
  return score;
}

export function resetScore() {
  localStorage.removeItem(SCORE_KEY);
}
