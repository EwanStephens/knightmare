import { LETTER_FREQUENCY } from './letterFrequency';

// Get unused hint squares for a puzzle
export async function getUnusedHintSquares(puzzleId: string): Promise<string[]> {
  // 1. Open the puzzle JSON file
  // 2. Figure out which squares are unused (not on targetPath)
  // 3. Pick a third of the unused squares, rounded up
  // 4. Prefer squares with more legalCaptures, then by letter frequency, then by order in file
  return [];
}

// Get the first letter hint square for a puzzle
export async function getFirstLetterHintSquare(puzzleId: string): Promise<string> {
  // 1. Open the puzzle JSON file
  // 2. Return the first square of the targetPath
  return '';
}

// Get the reveal answer path for a puzzle
export async function getRevealAnswerPath(puzzleId: string): Promise<string[]> {
  // 1. Open the puzzle JSON file
  // 2. Return the targetPath array
  return [];
} 