// src/utils/gameState.ts
// Utility functions for managing persistent game state using localStorage

// Storage keys
const TUTORIAL_COMPLETED_KEY = 'knightmare_tutorial_completed';
const COMPLETED_LEVELS_KEY = 'knightmare_completed_levels';
const CURRENT_LEVEL_KEY = 'knightmare_current_level';
const SOLVED_PUZZLE_IDS_KEY = 'knightmare_solved_puzzle_ids';

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

// Solved puzzle IDs (for daily/unique puzzles)
export const getSolvedPuzzleIds = (): Set<string> => {
  if (!isBrowser) return new Set();
  const stored = localStorage.getItem(SOLVED_PUZZLE_IDS_KEY);
  if (!stored) return new Set();
  try {
    const arr = JSON.parse(stored);
    if (Array.isArray(arr)) {
      return new Set(arr);
    }
    return new Set();
  } catch (e) {
    console.error('Error parsing solved puzzle IDs from localStorage:', e);
    return new Set();
  }
};

export const isPuzzleSolved = (puzzleId: string): boolean => {
  return getSolvedPuzzleIds().has(puzzleId);
};

export const markPuzzleSolved = (puzzleId: string): void => {
  if (!isBrowser) return;
  const solved = getSolvedPuzzleIds();
  if (!solved.has(puzzleId)) {
    solved.add(puzzleId);
    localStorage.setItem(SOLVED_PUZZLE_IDS_KEY, JSON.stringify(Array.from(solved)));
  }
}; 