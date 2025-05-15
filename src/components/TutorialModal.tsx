'use client';

import { useState, useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';

export default function TutorialModal() {
  const { 
    tutorialState, 
    currentStep, 
    goToNextStep, 
    closeModal,
    startTutorial
  } = useTutorial();
  
  const { isModalOpen, showIntroScreen } = tutorialState;

  // Intro screen content
  if (showIntroScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => {}} />
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 z-10 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">Welcome to Knightmare!</h2>
          <p className="mb-6">
            Knightmare is a word-building puzzle game that combines chess mechanics with word creation. 
            Capture pieces using legal chess moves to build the target word.
          </p>
          <div className="flex justify-end">
            <button
              onClick={startTutorial}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Start Tutorial
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Regular tutorial step modal
  if (!currentStep) return null;
  
  // Determine position of the modal (default to top if not specified)
  const position = currentStep.position || 'top';
  
  return (
    <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 flex justify-center ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
      {/* No full-screen overlay - this allows visibility of the board */}
      <div className={`bg-white ${position === 'top' ? 'rounded-b-lg' : 'rounded-t-lg'} p-4 max-w-md w-full mx-4 z-10 shadow-xl ${position === 'top' ? 'mt-0 border-b' : 'mb-0 border-t'} border-gray-200 bg-opacity-90`}>
        <p className="mb-4">{currentStep.text}</p>
        <div className="flex justify-end">
          {currentStep.nextStepId ? (
            <button
              onClick={goToNextStep}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 