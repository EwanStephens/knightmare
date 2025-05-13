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
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => {}} />
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

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeModal} />
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 z-10 shadow-xl">
        <p className="mb-6">{currentStep.text}</p>
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