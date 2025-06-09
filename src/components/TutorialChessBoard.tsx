'use client';

import { useEffect, useState } from 'react';
import ChessBoard from './ChessBoard';
import { useTutorial } from '@/contexts/TutorialContext';
import { LoadedLevel } from '@/types/level';
import { createBoardFromTutorial } from '@/utils/tutorialLoader';
import CompletionModal from './CompletionModal';
import { markTutorialCompleted } from '@/utils/gameState';

export default function TutorialChessBoard() {
  const { currentLevel, handlePieceSelect, tutorialState } = useTutorial();
  const [tutorialLevel, setTutorialLevel] = useState<LoadedLevel | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const { highlightedPosition } = tutorialState;

  // Create a level from tutorial data
  useEffect(() => {
    if (!currentLevel) return;

    const board = createBoardFromTutorial(currentLevel);
    
    // Create loaded level object with tutorial data
    const level: LoadedLevel = {
      board,
      targetWord: currentLevel.targetWord,
      congratsMessage: currentLevel.congratsMessage || `Congratulations! You found the word ${currentLevel.targetWord}!`,
    };

    setTutorialLevel(level);
  }, [currentLevel]);

  // Handle level completion callback from ChessBoard
  const handleLevelComplete = () => {
    // If this is the last tutorial level, show the completion modal
    if (currentLevel?.levelNumber === 3) {
      setShowCompleteModal(true);
      markTutorialCompleted();
    }
    // For levels 1 and 2, the ChessBoard will handle the simple success feedback and auto-navigation
  };

  // Handle next level navigation
  const handleCloseModal = () => {
    setShowCompleteModal(false);
  };

  // Notify the tutorial system about piece selection
  const handlePieceSelected = (position: string, currentWord: string) => {
    console.log(`TutorialChessBoard passing to context: position=${position}, currentWord=${currentWord}`);
    handlePieceSelect(position, currentWord);
  };

  if (!tutorialLevel) {
    return <div className="flex items-center justify-center h-64">Loading tutorial...</div>;
  }
  
  // Calculate the next tutorial level path
  const nextPath = currentLevel?.levelNumber && currentLevel.levelNumber < 3 
    ? `/tutorial/${currentLevel.levelNumber + 1}` 
    : undefined;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Main content, blurred when modal is open */}
      <div className={showCompleteModal ? "filter blur-sm pointer-events-none transition-all duration-200" : "transition-all duration-200"}>
        <ChessBoard 
          tutorialMode={true}
          tutorialLevel={tutorialLevel}
          tutorialLevelNumber={currentLevel?.levelNumber}
          onPieceSelected={handlePieceSelected}
          onLevelComplete={handleLevelComplete}
          highlightedPosition={highlightedPosition}
        />
      </div>
      
      {/* Use the shared CompletionModal component */}
      <CompletionModal 
        isOpen={showCompleteModal}
        onClose={handleCloseModal}
        congratsMessage={tutorialLevel.congratsMessage}
        targetWord={tutorialLevel.targetWord}
        {...(nextPath ? { nextPath } : {})}
      />
    </div>
  );
} 