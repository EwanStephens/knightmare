'use client';

import { useEffect, useState } from 'react';
import ChessBoard from './ChessBoard';
import { useTutorial } from '@/contexts/TutorialContext';
import { LoadedLevel } from '@/types/level';
import { Square } from '@/types/chess';
import { positionToAlgebraic } from '@/utils/chess';

export default function TutorialChessBoard() {
  const { currentLevel, handlePieceSelect, advanceToNextLevel, tutorialState } = useTutorial();
  const [tutorialLevel, setTutorialLevel] = useState<LoadedLevel | null>(null);

  // Create a level from tutorial data
  useEffect(() => {
    if (!currentLevel) return;

    const createBoardFromTutorial = () => {
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
      currentLevel.initialBoardSetup.forEach(piece => {
        const { row, col } = {
          row: 5 - parseInt(piece.position.charAt(1)), // Convert rank to row (0-4)
          col: piece.position.charCodeAt(0) - 97, // Convert file ('a'-'e') to col (0-4)
        };

        if (row >= 0 && row < 5 && col >= 0 && col < 5) {
          emptyBoard[row][col].piece = {
            type: piece.pieceType as any,
            color: piece.pieceColor,
            letter: piece.letter,
          };
        }
      });

      // Create loaded level object with tutorial data
      const level: LoadedLevel = {
        board: emptyBoard,
        targetWord: currentLevel.targetWord,
        congratsMessage: currentLevel.levelNumber === 3 
          ? "Congratulations on completing the tutorial!" 
          : `Congratulations! You found the word ${currentLevel.targetWord}!`,
      };

      setTutorialLevel(level);
    };

    createBoardFromTutorial();
  }, [currentLevel]);

  // Handle level completion callback from ChessBoard
  const handleLevelComplete = () => {
    // Check if this is the final level (level 3)
    if (tutorialState.currentLevelIndex === 2) {
      // We're at the final level, set the completion message
      handlePieceSelect('complete'); // Trigger any completion-related steps
    }
    
    // After a short delay, show the completion modal and advance
    setTimeout(() => {
      advanceToNextLevel();
    }, 1500);
  };

  // Notify the tutorial system about piece selection
  const handlePieceSelected = (position: string) => {
    handlePieceSelect(position);
  };

  if (!tutorialLevel) {
    return <div className="flex items-center justify-center h-64">Loading tutorial...</div>;
  }

  return (
    <ChessBoard 
      initialLevel={currentLevel?.levelNumber || 1} 
      tutorialMode={true}
      tutorialLevel={tutorialLevel}
      onPieceSelected={handlePieceSelected}
      onLevelComplete={handleLevelComplete}
    />
  );
} 