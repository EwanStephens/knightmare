'use client';

import { useEffect, useRef } from 'react';
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
  const highlightRef = useRef<HTMLDivElement | null>(null);

  // Effect to handle target highlighting
  useEffect(() => {
    if (!currentStep?.target || !isModalOpen) return;

    // Try to find the element using the selector
    let targetElements;
    
    // Handle the special case for buttons with specific text
    if (currentStep.target.includes(':contains(')) {
      const textMatch = currentStep.target.match(/:contains\(['"]?([^'"]+)['"]?\)/);
      if (textMatch && textMatch[1]) {
        const buttonText = textMatch[1];
        // Look for buttons specifically if the selector includes 'button'
        const selector = currentStep.target.includes('button') ? 'button' : '*';
        const allElements = document.querySelectorAll(selector);
        targetElements = Array.from(allElements).filter(element => 
          element.textContent?.trim() === buttonText.trim()
        );
      }
    } else {
      // Regular CSS selector
      targetElements = document.querySelectorAll(currentStep.target);
    }
    
    if (targetElements && targetElements.length > 0) {
      const targetElement = targetElements[0] as HTMLElement;
      
      // Create a highlight overlay
      if (!highlightRef.current) {
        const highlightDiv = document.createElement('div');
        highlightDiv.style.position = 'fixed'; // Use fixed positioning for better alignment
        highlightDiv.style.zIndex = '40';
        highlightDiv.style.pointerEvents = 'none';
        highlightDiv.style.border = '2px solid #FFDF00';
        highlightDiv.style.borderRadius = '4px';
        highlightDiv.style.animation = 'pulse 1.5s infinite';
        document.body.appendChild(highlightDiv);
        
        // Add the animation style
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 223, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 223, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 223, 0, 0); }
          }
        `;
        document.head.appendChild(style);
        
        highlightRef.current = highlightDiv;
      }
      
      // Position the highlight using getBoundingClientRect for accurate positioning
      const rect = targetElement.getBoundingClientRect();
      const highlight = highlightRef.current;
      highlight.style.left = `${rect.left - 4}px`;
      highlight.style.top = `${rect.top - 4}px`;
      highlight.style.width = `${rect.width + 8}px`;
      highlight.style.height = `${rect.height + 8}px`;
      highlight.style.display = 'block';
    }
    
    return () => {
      // Clean up highlight on unmount or when target changes
      if (highlightRef.current) {
        highlightRef.current.style.display = 'none';
      }
    };
  }, [currentStep, isModalOpen]);

  // Clean up highlight on component unmount
  useEffect(() => {
    return () => {
      if (highlightRef.current) {
        highlightRef.current.remove();
        highlightRef.current = null;
      }
    };
  }, []);

  // Intro screen content
  if (showIntroScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}>
        <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50" onClick={() => {}} />
        <div 
          className="bg-white dark:bg-jet-lighter rounded-lg p-6 max-w-md w-full mx-4 z-10 dark:text-white"
          style={{
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <h2 className="text-2xl font-bold mb-4">Welcome to SpellCheck!</h2>
          <p className="mb-6">
            SpellCheck is a word-building puzzle game that combines chess mechanics with word creation. 
            Capture pieces using legal chess moves to build the target word.
          </p>
          <div className="flex justify-end">
            <button
              onClick={startTutorial}
              className="px-4 py-2 bg-spell-blue text-white rounded hover:bg-spell-blue-dark transition-colors"
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
      <div 
        className={`bg-white dark:bg-jet-lighter ${position === 'top' ? 'rounded-b-lg' : 'rounded-t-lg'} p-4 max-w-md w-full mx-4 z-10 bg-opacity-95 dark:bg-opacity-95 dark:text-white`}
        style={{
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <p className="mb-4">{currentStep.text}</p>
        <div className="flex justify-end">
          {currentStep.nextStepId ? (
            <button
              onClick={goToNextStep}
              className="px-4 py-2 bg-spell-blue text-white rounded hover:bg-spell-blue-dark transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-spell-blue text-white rounded hover:bg-spell-blue-dark transition-colors"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}