'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChessBoard from './ChessBoard';
import { useTutorial } from '@/contexts/TutorialContext';
import { LoadedLevel } from '@/types/level';
import { createBoardFromTutorial } from '@/utils/tutorialLoader';

export default function TutorialChessBoard() {
  const router = useRouter();
  const { currentLevel, handlePieceSelect, advanceToNextLevel, tutorialState } = useTutorial();
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
    // Check if this is the final level (level 3)
    if (currentLevel?.levelNumber === 3) {
      // We're at the final level, set the completion message
      handlePieceSelect('complete'); // Trigger any completion-related steps
    }
    
    // Show the completion modal
    setShowCompleteModal(true);
  };

  // Handle next level navigation
  const handleNextLevel = () => {
    setShowCompleteModal(false);
    const nextLevel = currentLevel!.levelNumber + 1;
    
    if (nextLevel <= 3) {
      // Navigate to the next tutorial level
      router.push(`/tutorial/${nextLevel}`);
    } else {
      // If all tutorial levels are completed, go back to home
      router.push('/');
    }
  };

  // Notify the tutorial system about piece selection
  const handlePieceSelected = (position: string) => {
    handlePieceSelect(position);
  };

  if (!tutorialLevel) {
    return <div className="flex items-center justify-center h-64">Loading tutorial...</div>;
  }

  return (
    <>
      <ChessBoard 
        initialLevel={currentLevel?.levelNumber || 1} 
        tutorialMode={true}
        tutorialLevel={tutorialLevel}
        onPieceSelected={handlePieceSelected}
        onLevelComplete={handleLevelComplete}
        highlightedPosition={highlightedPosition}
      />
      
      {/* Custom completion modal for tutorial levels */}
      {showCompleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => {}} />
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-6 min-w-[320px] z-10">
            <div className="text-2xl font-bold text-green-700">{tutorialLevel.congratsMessage}</div>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => router.push('/')}
              >
                Home
              </button>
              {currentLevel?.levelNumber && currentLevel.levelNumber < 3 && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleNextLevel}
                >
                  Next Level
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 