// src/utils/gameState.test.ts
// Simple test for share text generation

import { generateShareText, DailyResults } from './gameState';

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

  const result1 = generateShareText(testDate, dailyResults1);
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

  const result2 = generateShareText(testDate, dailyResults2);
  console.log('Test 2 - Perfect results:');
  console.log(result2);
  console.log('---');

  // Expected format validation
  console.log('Expected format:');
  console.log('SpellCheck June 12th, 2025:');
  console.log('✅');
  console.log('💡✅');
  console.log('💡💡👁️');
  console.log('♙♙♟♟♟♘x4♗♗♝x7♜♕x12♛♛');
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testShareTextGeneration();
}

export { testShareTextGeneration }; 