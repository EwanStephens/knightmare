// src/utils/gameState.ts
// Utility functions for managing persistent game state using localStorage

// Storage keys
const TUTORIAL_COMPLETED_KEY = 'knightmare_tutorial_completed';
const COMPLETED_LEVELS_KEY = 'knightmare_completed_levels';
const CURRENT_LEVEL_KEY = 'knightmare_current_level';
const DAILY_PUZZLE_PROGRESS_KEY = 'knightmare_daily_puzzle_progress';

// Check if running on client side
const isBrowser = typeof window !== 'undefined';

// Tutorial functions
export const isTutorialCompleted = (): boolean => {
  if (!isBrowser) return false;
  return localStorage.getItem(TUTORIAL_COMPLETED_KEY) === 'true';
};

export const markTutorialCompleted = (): void => {
  if (!isBrowser) return;
  localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
};

export const markTutorialSkipped = (): void => {
  if (!isBrowser) return;
  localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
};

// Completed levels functions
export const getCompletedLevels = (): number[] => {
  if (!isBrowser) return [];
  const storedLevels = localStorage.getItem(COMPLETED_LEVELS_KEY);
  if (!storedLevels) return [];
  try {
    return JSON.parse(storedLevels);
  } catch (e) {
    console.error('Error parsing completed levels from localStorage:', e);
    return [];
  }
};

export const isLevelCompleted = (level: number): boolean => {
  return getCompletedLevels().includes(level);
};

export const markLevelCompleted = (level: number): void => {
  if (!isBrowser) return;
  const completedLevels = getCompletedLevels();
  if (!completedLevels.includes(level)) {
    completedLevels.push(level);
    localStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(completedLevels));
  }
};

// Current level functions
export const getCurrentLevel = (): number => {
  if (!isBrowser) return 1;
  const storedLevel = localStorage.getItem(CURRENT_LEVEL_KEY);
  if (!storedLevel) return 1;
  try {
    const level = parseInt(storedLevel, 10);
    return isNaN(level) ? 1 : level;
  } catch {
    return 1;
  }
};

export const setCurrentLevel = (level: number): void => {
  if (!isBrowser) return;
  localStorage.setItem(CURRENT_LEVEL_KEY, level.toString());
};

// Update current level when completing a level
export const updateLevelOnCompletion = (level: number): void => {
  if (!isBrowser) return;
  markLevelCompleted(level);
  
  // Set next level as current level if this isn't the last level
  if (level < 20) {
    setCurrentLevel(level + 1);
  }
};

// Daily puzzle progress
export interface DailyPuzzleProgress {
  short?: boolean;
  medium?: boolean;
  long?: boolean;
}

export function getDailyPuzzleProgress(date: string): DailyPuzzleProgress {
  if (!isBrowser) return {};
  const stored = localStorage.getItem(DAILY_PUZZLE_PROGRESS_KEY);
  if (!stored) return {};
  try {
    const allProgress: { [date: string]: DailyPuzzleProgress } = JSON.parse(stored);
    return allProgress[date] || {};
  } catch {
    return {};
  }
}

export function setDailyPuzzleProgress(date: string, progress: DailyPuzzleProgress): void {
  if (!isBrowser) return;
  const stored = localStorage.getItem(DAILY_PUZZLE_PROGRESS_KEY);
  let allProgress: { [date: string]: DailyPuzzleProgress } = {};
  if (stored) {
    try {
      allProgress = JSON.parse(stored);
    } catch {}
  }
  allProgress[date] = { ...allProgress[date], ...progress };
  localStorage.setItem(DAILY_PUZZLE_PROGRESS_KEY, JSON.stringify(allProgress));
}

export function isDailyPuzzleCompleted(date: string, type: 'short' | 'medium' | 'long'): boolean {
  return !!getDailyPuzzleProgress(date)[type];
} 