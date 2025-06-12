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
      hintsUsed: 0,
      revealUsed: false,
      clearButtonPresses: 2,
      piecePresses: {
        'white-pawn': 1,
        'black-pawn': 1,
      },
    },
    medium: {
      solved: true,
      hintsUsed: 1,
      revealUsed: false,
      clearButtonPresses: 1,
      piecePresses: {
        'black-pawn': 2,
        'white-knight': 4,
        'black-bishop': 7,
      },
    },
    long: {
      solved: false,
      hintsUsed: 2,
      revealUsed: true,
      clearButtonPresses: 3,
      piecePresses: {
        'white-pawn': 1,
        'black-knight': 3,
        'white-rook': 12,
        'black-queen': 2,
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
      hintsUsed: 0,
      revealUsed: false,
      clearButtonPresses: 0,
      piecePresses: {
        'white-pawn': 3,
        'black-pawn': 2,
      },
    },
    medium: {
      solved: true,
      hintsUsed: 0,
      revealUsed: false,
      clearButtonPresses: 0,
      piecePresses: {
        'white-bishop': 2,
        'black-bishop': 1,
      },
    },
    long: {
      solved: true,
      hintsUsed: 0,
      revealUsed: false,
      clearButtonPresses: 0,
      piecePresses: {
        'white-queen': 5,
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