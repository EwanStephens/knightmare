import { Level, LoadedLevel } from '@/types/level';
import { algebraicToPosition } from './chess';
import { createEmptyBoard } from './board';

export const loadLevel = async (levelNumber: number): Promise<LoadedLevel> => {
  // Load the level file
  const levelData: Level = await import(`../levels/level${levelNumber}.json`).then(m => m.default);
  
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
  const isLastLevel = levelNumber === 5; // Updated to reflect level 5 as the last level
  const congratsMessage = isLastLevel
    ? `Congratulations! You found the word ${targetWord}!`
    : `Congratulations! You found the word ${targetWord}! Moving to level ${levelNumber + 1}...`;

  return {
    board,
    targetWord,
    congratsMessage
  };
}; 