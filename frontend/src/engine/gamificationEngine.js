/**
 * MathMate.AI — Gamification Engine
 * 
 * XP system, badges, and achievement tracking.
 * Persisted in localStorage — no backend needed.
 */

// ─── XP Configuration ───────────────────────────────────────────

const XP_REWARDS = {
  solve_easy: 10,
  solve_medium: 25,
  solve_hard: 50,
  streak_5: 30,
  streak_10: 75,
  streak_25: 200,
  first_solve: 20,
  first_practice: 15,
  first_share: 25,
  first_export: 15,
  first_ocr: 20,
  first_draw: 15,
  quiz_complete: 40,
  quiz_perfect: 100,
};

const LEVELS = [
  { level: 1, xp: 0, title: 'Beginner' },
  { level: 2, xp: 50, title: 'Student' },
  { level: 3, xp: 150, title: 'Learner' },
  { level: 4, xp: 350, title: 'Explorer' },
  { level: 5, xp: 600, title: 'Problem Solver' },
  { level: 6, xp: 1000, title: 'Math Enthusiast' },
  { level: 7, xp: 1500, title: 'Advanced' },
  { level: 8, xp: 2200, title: 'Expert' },
  { level: 9, xp: 3200, title: 'Master' },
  { level: 10, xp: 5000, title: 'Math Legend' },
];

// ─── Badges ─────────────────────────────────────────────────────

const BADGE_DEFINITIONS = [
  { id: 'first_solve', name: 'First Steps', emoji: '🎯', description: 'Solve your first problem', condition: (s) => s.totalSolves >= 1 },
  { id: 'solve_10', name: 'Getting Started', emoji: '📘', description: 'Solve 10 problems', condition: (s) => s.totalSolves >= 10 },
  { id: 'solve_50', name: 'Dedicated', emoji: '📗', description: 'Solve 50 problems', condition: (s) => s.totalSolves >= 50 },
  { id: 'solve_100', name: 'Centurion', emoji: '💯', description: 'Solve 100 problems', condition: (s) => s.totalSolves >= 100 },
  { id: 'streak_5', name: 'On Fire', emoji: '🔥', description: 'Get a 5-problem streak', condition: (s) => s.bestStreak >= 5 },
  { id: 'streak_10', name: 'Unstoppable', emoji: '⚡', description: 'Get a 10-problem streak', condition: (s) => s.bestStreak >= 10 },
  { id: 'streak_25', name: 'Legendary', emoji: '🏆', description: 'Get a 25-problem streak', condition: (s) => s.bestStreak >= 25 },
  { id: 'all_categories', name: 'Well-Rounded', emoji: '🌟', description: 'Solve problems in all 5 categories', condition: (s) => s.categoriesUsed >= 5 },
  { id: 'perfect_quiz', name: 'Perfect Score', emoji: '💎', description: 'Complete a timed quiz with 100% accuracy', condition: (s) => s.perfectQuizzes >= 1 },
  { id: 'accuracy_90', name: 'Sharp Mind', emoji: '🧠', description: 'Maintain 90%+ accuracy over 20+ problems', condition: (s) => s.totalSolves >= 20 && s.accuracy >= 90 },
  { id: 'speed_demon', name: 'Speed Demon', emoji: '⏱️', description: 'Complete a 10-question quiz in under 2 minutes', condition: (s) => s.fastestQuiz && s.fastestQuiz < 120 },
  { id: 'night_owl', name: 'Night Owl', emoji: '🦉', description: 'Solve a problem after midnight', condition: (s) => s.nightSolves >= 1 },
];

// ─── State ──────────────────────────────────────────────────────

const GAMIFY_KEY = 'mathmate_gamification';

function getState() {
  try {
    return JSON.parse(localStorage.getItem(GAMIFY_KEY)) || defaultState();
  } catch { return defaultState(); }
}

function defaultState() {
  return {
    xp: 0,
    totalSolves: 0,
    bestStreak: 0,
    currentStreak: 0,
    categoriesUsed: 0,
    categories: {},
    perfectQuizzes: 0,
    fastestQuiz: null,
    nightSolves: 0,
    badges: [],
    xpLog: [], // Recent XP events
  };
}

function saveState(state) {
  localStorage.setItem(GAMIFY_KEY, JSON.stringify(state));
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Award XP for an action.
 * @returns {{ xp: number, newBadges: Array, levelUp: boolean, state: object }}
 */
export function awardXP(action, metadata = {}) {
  const state = getState();
  const xpAmount = XP_REWARDS[action] || 0;
  const oldLevel = getLevel(state.xp);

  state.xp += xpAmount;

  // Track action-specific stats
  if (action.startsWith('solve_')) {
    state.totalSolves++;
    state.currentStreak++;
    if (state.currentStreak > state.bestStreak) state.bestStreak = state.currentStreak;
    
    if (metadata.category) {
      state.categories[metadata.category] = (state.categories[metadata.category] || 0) + 1;
      state.categoriesUsed = Object.keys(state.categories).length;
    }

    // Check if solving at night
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) state.nightSolves++;

    // Streak bonuses
    if (state.currentStreak === 5) state.xp += XP_REWARDS.streak_5;
    if (state.currentStreak === 10) state.xp += XP_REWARDS.streak_10;
    if (state.currentStreak === 25) state.xp += XP_REWARDS.streak_25;
  }

  if (action === 'quiz_perfect') {
    state.perfectQuizzes++;
    if (metadata.timeSeconds && (!state.fastestQuiz || metadata.timeSeconds < state.fastestQuiz)) {
      state.fastestQuiz = metadata.timeSeconds;
    }
  }

  // Log XP event
  state.xpLog.unshift({ action, xp: xpAmount, time: Date.now() });
  if (state.xpLog.length > 20) state.xpLog = state.xpLog.slice(0, 20);

  // Check new badges
  const newBadges = [];
  for (const badge of BADGE_DEFINITIONS) {
    if (!state.badges.includes(badge.id) && badge.condition(state)) {
      state.badges.push(badge.id);
      newBadges.push(badge);
      state.xp += 50; // Bonus XP for earning a badge
    }
  }

  const newLevel = getLevel(state.xp);
  const levelUp = newLevel.level > oldLevel.level;

  saveState(state);

  return { xp: xpAmount, newBadges, levelUp, newLevel, state };
}

/**
 * Record a wrong answer (breaks streak).
 */
export function breakStreak() {
  const state = getState();
  state.currentStreak = 0;
  saveState(state);
}

/**
 * Get current level info.
 */
export function getLevel(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xp) current = level;
    else break;
  }
  const nextLevel = LEVELS.find(l => l.xp > xp) || current;
  const progress = nextLevel.xp > current.xp
    ? ((xp - current.xp) / (nextLevel.xp - current.xp)) * 100
    : 100;
  return { ...current, nextXp: nextLevel.xp, progress };
}

/**
 * Get full gamification state for UI.
 */
export function getGamificationState() {
  const state = getState();
  const level = getLevel(state.xp);
  const earnedBadges = BADGE_DEFINITIONS.filter(b => state.badges.includes(b.id));
  const lockedBadges = BADGE_DEFINITIONS.filter(b => !state.badges.includes(b.id));
  return { ...state, level, earnedBadges, lockedBadges, allBadges: BADGE_DEFINITIONS };
}

/**
 * Reset all gamification data.
 */
export function resetGamification() {
  localStorage.removeItem(GAMIFY_KEY);
}
