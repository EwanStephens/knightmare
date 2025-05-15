import { TutorialLevel } from '@/types/tutorial';
import { Square, ChessPiece } from '@/types/chess';
import { positionToAlgebraic } from '@/utils/chess';

/**
 * Loads a tutorial level from JSON file
 */
export async function loadTutorialLevel(levelNumber: number): Promise<TutorialLevel> {
  try {
    const level = await import(`../tutorials/tutorial_level_${levelNumber}.json`);
    return level.default || level;
  } catch (error) {
    console.error(`Failed to load tutorial level ${levelNumber}:`, error);
    throw new Error(`Tutorial level ${levelNumber} could not be loaded.`);
  }
}

/**
 * Creates a board from a tutorial level definition
 */
export function createBoardFromTutorial(tutorialLevel: TutorialLevel): Square[][] {
  // Create empty 5x5 board
  const emptyBoard: Square[][] = Array(5)
    .fill(null)
    .map((_, row) =>
      Array(5)
        .fill(null)
        .map((_, col) => ({
          piece: null,
          position: positionToAlgebraic(row, col),
          isHighlighted: false,
          isSelected: false,
          isLegalMove: false,
        }))
    );

  // Place pieces according to tutorial data
  tutorialLevel.initialBoardSetup.forEach(piece => {
    const { row, col } = {
      row: 5 - parseInt(piece.position.charAt(1)), // Convert rank to row (0-4)
      col: piece.position.charCodeAt(0) - 97, // Convert file ('a'-'e') to col (0-4)
    };

    if (row >= 0 && row < 5 && col >= 0 && col < 5) {
      emptyBoard[row][col].piece = {
        type: piece.pieceType as ChessPiece['type'],
        color: piece.pieceColor,
        letter: piece.letter,
      };
    }
  });

  return emptyBoard;
} 