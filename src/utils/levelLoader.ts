import { Level, LoadedLevel } from '@/types/level';
import { algebraicToPosition } from './chess';
import { createEmptyBoard } from './board';

export const loadLevel = async (levelNumber: number): Promise<LoadedLevel> => {
  // Load the level file
  const levelData: Level = await import(`../levels/level_${levelNumber}.json`).then(m => m.default);
  
  // Create an empty board
  const board = createEmptyBoard();
  
  // Place pieces on the board
  levelData.pieces.forEach(piece => {
    const { position, ...pieceData } = piece;
    const { row, col } = algebraicToPosition(position);
    board[row][col].piece = pieceData;
  });

  // Get the target word (using the first word from targetWords array)
  const targetWord = levelData.targetWords[0];
  
  // Create the congratulation message
  const congratsMessage = `Congratulations!`;

  return {
    board,
    targetWord,
    congratsMessage
  };
}; 