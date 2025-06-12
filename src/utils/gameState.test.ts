// src/utils/gameState.test.ts
// Simple test for share text generation

import { generateShareText, DailyResults, GlobalStats } from './gameState';

// Mock global stats for testing
const mockGlobalStats: GlobalStats = {
  daysPlayed: 15,
  currentStreak: 7,
  maxStreak: 10
};

// Test the share text generation
function testShareTextGeneration() {
  const testDate = '2025-06-12';
  
  // Test case 1: All puzzles completed with different combinations
  const dailyResults1: DailyResults = {
    short: {
      solved: true,
      hints: 0,
      reveal: false,
      clears: 2,
      piecePresses: {
        'wP': 1,
        'bP': 1,
      },
    },
    medium: {
      solved: true,
      hints: 1,
      reveal: false,
      clears: 1,
      piecePresses: {
        'bP': 2,
        'wN': 4,
        'bB': 7,
      },
    },
    long: {
      solved: false,
      hints: 2,
      reveal: true,
      clears: 3,
      piecePresses: {
        'wP': 1,
        'bN': 3,
        'wR': 12,
        'bQ': 2,
      },
    },
  };

  const result1 = generateShareText(testDate, dailyResults1, mockGlobalStats);
  console.log('Test 1 - Mixed results:');
  console.log(result1);
  console.log('---');

  // Test case 2: Perfect results (no hints, all solved)
  const dailyResults2: DailyResults = {
    short: {
      solved: true,
      hints: 0,
      reveal: false,
      clears: 0,
      piecePresses: {
        'wP': 3,
        'bP': 2,
      },
    },
    medium: {
      solved: true,
      hints: 0,
      reveal: false,
      clears: 0,
      piecePresses: {
        'wB': 2,
        'bB': 1,
      },
    },
    long: {
      solved: true,
      hints: 0,
      reveal: false,
      clears: 0,
      piecePresses: {
        'wQ': 5,
      },
    },
  };

  const result2 = generateShareText(testDate, dailyResults2, mockGlobalStats);
  console.log('Test 2 - Perfect results:');
  console.log(result2);
  console.log('---');

  // Test case 3: No streak (should not show streak)
  const noStreakStats: GlobalStats = {
    daysPlayed: 1,
    currentStreak: 1,
    maxStreak: 1
  };
  const result3 = generateShareText(testDate, dailyResults2, noStreakStats);
  console.log('Test 3 - No streak:');
  console.log(result3);
  console.log('---');

  // Expected format validation
  console.log('Expected format:');
  console.log('SpellCheck June 12th, 2025:');
  console.log('✅');
  console.log('💡✅');
  console.log('💡💡👁️');
  console.log('♙♙♟♟♟♘x4♗♗♝x7♜♕x12♛♛');
  console.log('🔥7');
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testShareTextGeneration();
}

export { testShareTextGeneration }; 