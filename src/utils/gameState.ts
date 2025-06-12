// src/utils/gameState.ts
// Utility functions for managing persistent game state using localStorage

import { ChessPiece } from '@/types/chess';

// Storage keys
const TUTORIAL_COMPLETED_KEY = 'spellcheck_tutorial_completed';
const SOLVED_PUZZLE_IDS_KEY = 'spellcheck_solved_puzzle_ids';
const PUZZLE_STATS_KEY = 'spellcheck_puzzle_stats';
const GLOBAL_STATS_KEY = 'spellcheck_global_stats';

// Check if running on client side
const isBrowser = typeof window !== 'undefined';

// Type definitions for the enhanced stats system
export interface PuzzleStats {
  solved: boolean;
  hintsUsed: number; // 0-2
  revealUsed: boolean;
  clearButtonPresses: number;
  piecePresses: Record<string, number>; // e.g. "white-pawn": 3, "black-knight": 1
}

export interface GlobalStats {
  daysPlayed: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayDate?: string; // ISO date string
}

export interface DailyResults {
  short?: PuzzleStats;
  medium?: PuzzleStats;
  long?: PuzzleStats;
}

// Helper function to get piece key for tracking
export const getPieceKey = (piece: ChessPiece): string => {
  return `${piece.color}-${piece.type}`;
};

// Helper function to get piece unicode symbols for sharing
const PIECE_UNICODE: Record<string, string> = {
  'white-pawn': '♙',
  'black-pawn': '♟',
  'white-knight': '♘',
  'black-knight': '♞',
  'white-bishop': '♗',
  'black-bishop': '♝',
  'white-rook': '♖',
  'black-rook': '♜',
  'white-queen': '♕',
  'black-queen': '♛',
  'white-king': '♔', // Not used in game but included for completeness
  'black-king': '♚', // Not used in game but included for completeness
};

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

// Legacy solved puzzle IDs (for backward compatibility)
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
  const stats = getPuzzleStats(puzzleId);
  return stats?.solved || false;
};

// Enhanced puzzle stats functions
export const getPuzzleStats = (puzzleId: string): PuzzleStats | undefined => {
  if (!isBrowser) return undefined;
  const stored = localStorage.getItem(PUZZLE_STATS_KEY);
  if (!stored) return undefined;
  
  try {
    const allStats = JSON.parse(stored);
    return allStats[puzzleId] || undefined;
  } catch (e) {
    console.error('Error parsing puzzle stats from localStorage:', e);
    return undefined;
  }
};

export const setPuzzleStats = (puzzleId: string, stats: PuzzleStats): void => {
  if (!isBrowser) return;
  
  let allStats: Record<string, PuzzleStats> = {};
  const stored = localStorage.getItem(PUZZLE_STATS_KEY);
  if (stored) {
    try {
      allStats = JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing existing puzzle stats:', e);
    }
  }
  
  allStats[puzzleId] = stats;
  localStorage.setItem(PUZZLE_STATS_KEY, JSON.stringify(allStats));
};

export const markPuzzleSolved = (puzzleId: string): void => {
  const existingStats = getPuzzleStats(puzzleId) || {
    solved: false,
    hintsUsed: 0,
    revealUsed: false,
    clearButtonPresses: 0,
    piecePresses: {},
  };
  
  existingStats.solved = true;
  setPuzzleStats(puzzleId, existingStats);
  
  // Also update legacy system for backward compatibility
  if (!isBrowser) return;
  const solved = getSolvedPuzzleIds();
  if (!solved.has(puzzleId)) {
    solved.add(puzzleId);
    localStorage.setItem(SOLVED_PUZZLE_IDS_KEY, JSON.stringify(Array.from(solved)));
  }
};

export const incrementHintUsed = (puzzleId: string): void => {
  // Only track if puzzle hasn't been solved yet
  if (isPuzzleSolved(puzzleId)) return;
  
  const stats = getPuzzleStats(puzzleId) || {
    solved: false,
    hintsUsed: 0,
    revealUsed: false,
    clearButtonPresses: 0,
    piecePresses: {},
  };
  
  stats.hintsUsed = Math.min(stats.hintsUsed + 1, 2); // Cap at 2
  setPuzzleStats(puzzleId, stats);
};

export const markRevealUsed = (puzzleId: string): void => {
  // Only track if puzzle hasn't been solved yet
  if (isPuzzleSolved(puzzleId)) return;
  
  const stats = getPuzzleStats(puzzleId) || {
    solved: false,
    hintsUsed: 0,
    revealUsed: false,
    clearButtonPresses: 0,
    piecePresses: {},
  };
  
  stats.revealUsed = true;
  setPuzzleStats(puzzleId, stats);
};

export const incrementClearButtonPress = (puzzleId: string): void => {
  // Only track if puzzle hasn't been solved yet
  if (isPuzzleSolved(puzzleId)) return;
  
  const stats = getPuzzleStats(puzzleId) || {
    solved: false,
    hintsUsed: 0,
    revealUsed: false,
    clearButtonPresses: 0,
    piecePresses: {},
  };
  
  stats.clearButtonPresses += 1;
  setPuzzleStats(puzzleId, stats);
};

export const incrementPiecePress = (puzzleId: string, piece: ChessPiece): void => {
  // Only track if puzzle hasn't been solved yet
  if (isPuzzleSolved(puzzleId)) return;
  
  const stats = getPuzzleStats(puzzleId) || {
    solved: false,
    hintsUsed: 0,
    revealUsed: false,
    clearButtonPresses: 0,
    piecePresses: {},
  };
  
  const pieceKey = getPieceKey(piece);
  stats.piecePresses[pieceKey] = (stats.piecePresses[pieceKey] || 0) + 1;
  setPuzzleStats(puzzleId, stats);
};

// Global stats functions
export const getGlobalStats = (): GlobalStats => {
  if (!isBrowser) return { daysPlayed: 0, currentStreak: 0, maxStreak: 0 };
  
  const stored = localStorage.getItem(GLOBAL_STATS_KEY);
  if (!stored) return { daysPlayed: 0, currentStreak: 0, maxStreak: 0 };
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing global stats from localStorage:', e);
    return { daysPlayed: 0, currentStreak: 0, maxStreak: 0 };
  }
};

export const setGlobalStats = (stats: GlobalStats): void => {
  if (!isBrowser) return;
  localStorage.setItem(GLOBAL_STATS_KEY, JSON.stringify(stats));
};

export const updateStreakForDate = (dateString: string): void => {
  const stats = getGlobalStats();
  const today = new Date(dateString).toDateString();
  const lastPlayDate = stats.lastPlayDate ? new Date(stats.lastPlayDate).toDateString() : null;
  
  if (lastPlayDate === today) {
    // Already played today, no changes needed
    return;
  }
  
  if (!lastPlayDate) {
    // First time playing
    stats.daysPlayed = 1;
    stats.currentStreak = 1;
    stats.maxStreak = Math.max(stats.maxStreak, 1);
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (lastPlayDate === yesterdayString) {
      // Played yesterday, continue streak
      stats.currentStreak += 1;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    } else {
      // Streak broken, start new streak
      stats.currentStreak = 1;
    }
    stats.daysPlayed += 1;
  }
  
  stats.lastPlayDate = dateString;
  setGlobalStats(stats);
};

// Daily puzzle functions
export const getDailyResults = (): DailyResults => {
  // For daily puzzles, we need to get the puzzle IDs for that date
  // This function would need to be called with the actual puzzle IDs
  // For now, return empty results
  return {};
};

export const getDailyResultsForPuzzles = (shortId: string, mediumId: string, longId: string): DailyResults => {
  return {
    short: getPuzzleStats(shortId) || undefined,
    medium: getPuzzleStats(mediumId) || undefined,
    long: getPuzzleStats(longId) || undefined,
  };
};

// Share text generation
export const generateShareText = (dateString: string, dailyResults: DailyResults): string => {
  const date = new Date(dateString);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}${getOrdinalSuffix(date.getDate())}, ${date.getFullYear()}`;
  
  let shareText = `SpellCheck ${formattedDate}:\n`;
  
  // Add results for each puzzle
  const puzzleOrder: (keyof DailyResults)[] = ['short', 'medium', 'long'];
  for (const puzzleType of puzzleOrder) {
    const stats = dailyResults[puzzleType];
    if (stats) {
      shareText += formatPuzzleResult(stats) + '\n';
    } else {
      shareText += '❌\n'; // Not attempted
    }
  }
  
  // Add total piece presses
  const totalPiecePresses = calculateTotalPiecePresses(dailyResults);
  shareText += formatPiecePresses(totalPiecePresses);
  
  return shareText;
};

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

const formatPuzzleResult = (stats: PuzzleStats): string => {
  let result = '';
  
  // Add hint emojis
  for (let i = 0; i < stats.hintsUsed; i++) {
    result += '💡';
  }
  
  // Add completion emoji
  if (stats.revealUsed) {
    result += '👁️';
  } else if (stats.solved) {
    result += '✅';
  }
  
  return result || '❌'; // If no result, show X
};

const calculateTotalPiecePresses = (dailyResults: DailyResults): Record<string, number> => {
  const total: Record<string, number> = {};
  
  Object.values(dailyResults).forEach(stats => {
    if (stats?.piecePresses) {
      Object.entries(stats.piecePresses).forEach(([piece, count]) => {
        if (typeof count === 'number') {
          total[piece] = (total[piece] || 0) + count;
        }
      });
    }
  });
  
  return total;
};

const formatPiecePresses = (piecePresses: Record<string, number>): string => {
  // Define the order: pawns, knights, bishops, rooks, queens
  const pieceOrder = [
    'white-pawn', 'black-pawn',
    'white-knight', 'black-knight',
    'white-bishop', 'black-bishop',
    'white-rook', 'black-rook',
    'white-queen', 'black-queen',
  ];
  
  let result = '';
  
  for (const pieceKey of pieceOrder) {
    const count = piecePresses[pieceKey];
    if (!count || count === 0) continue; // Skip if not used
    
    const symbol = PIECE_UNICODE[pieceKey];
    if (!symbol) continue;
    
    if (count <= 3) {
      // Show individual symbols
      result += symbol.repeat(count);
    } else {
      // Show symbol with count
      result += `${symbol}x${count}`;
    }
  }
  
  return result;
}; 