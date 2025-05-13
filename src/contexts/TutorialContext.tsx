'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TutorialLevel, TutorialState, TutorialStep } from '@/types/tutorial';
import { tutorialLevels } from '@/data/tutorialData';

type TutorialContextType = {
  tutorialState: TutorialState;
  currentLevel: TutorialLevel | null;
  currentStep: TutorialStep | null;
  goToNextStep: () => void;
  handlePieceSelect: (position: string) => void;
  advanceToNextLevel: () => void;
  resetTutorial: () => void;
  closeModal: () => void;
  openModal: () => void;
  startTutorial: () => void;
};

const initialTutorialState: TutorialState = {
  currentLevelIndex: 0,
  currentStepId: null,
  completedStepIds: [],
  isModalOpen: true,
  showIntroScreen: true,
  highlightedPosition: null,
};

const TutorialContext = createContext<TutorialContextType | null>(null);

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [tutorialState, setTutorialState] = useState<TutorialState>(initialTutorialState);

  const currentLevel = tutorialState.currentLevelIndex < tutorialLevels.length
    ? tutorialLevels[tutorialState.currentLevelIndex]
    : null;

  const currentStep = currentLevel && tutorialState.currentStepId
    ? currentLevel.tutorialSteps.find(step => step.id === tutorialState.currentStepId) || null
    : null;

  // Initialize the tutorial with the first level and step
  useEffect(() => {
    if (currentLevel && !tutorialState.currentStepId) {
      setTutorialState(prev => ({
        ...prev,
        currentStepId: currentLevel.startingStepId,
      }));
    }
  }, [currentLevel, tutorialState.currentStepId]);

  const goToNextStep = () => {
    if (!currentStep || !currentStep.nextStepId) return;
    
    // Find the next step
    const nextStep = currentLevel?.tutorialSteps.find(step => step.id === currentStep.nextStepId);
    
    // Check if we need to highlight a piece
    let highlightPosition = null;
    if (nextStep?.triggerData?.position) {
      highlightPosition = nextStep.triggerData.position;
    }
    
    setTutorialState(prev => ({
      ...prev,
      currentStepId: currentStep.nextStepId || null,
      completedStepIds: [...prev.completedStepIds, currentStep.id],
      highlightedPosition: highlightPosition,
    }));
  };

  const handlePieceSelect = (position: string) => {
    if (!currentLevel) return;
    
    // Handle special actions
    if (position === 'clear') {
      // Find the next step that should be triggered after clear
      const afterClearStep = currentLevel.tutorialSteps.find(step => 
        step.id === 'level2-after-clear' && 
        !tutorialState.completedStepIds.includes(step.id)
      );
      
      if (afterClearStep) {
        // Check if we need to highlight a position
        const highlightPosition = afterClearStep.triggerData?.position || null;
        
        setTutorialState(prev => ({
          ...prev,
          currentStepId: afterClearStep.id,
          completedStepIds: [...prev.completedStepIds, afterClearStep.id],
          isModalOpen: true,
          highlightedPosition: highlightPosition,
        }));
      }
      return;
    }
    
    if (position === 'complete') {
      // Find level completion step
      const completeStep = currentLevel.tutorialSteps.find(step =>
        step.id === 'level3-complete' &&
        !tutorialState.completedStepIds.includes(step.id)
      );
      
      if (completeStep) {
        setTutorialState(prev => ({
          ...prev,
          currentStepId: completeStep.id,
          completedStepIds: [...prev.completedStepIds, completeStep.id],
          isModalOpen: true,
          highlightedPosition: null,
        }));
      }
      return;
    }
    
    // If we're selecting a position that was highlighted, find the matching step
    const matchingStep = currentLevel.tutorialSteps.find(step => 
      step.trigger === 'select-piece' && 
      step.triggerData?.position === position &&
      !tutorialState.completedStepIds.includes(step.id)
    );
    
    if (matchingStep) {
      // If this step has a next step that should highlight something, get that position
      const nextStepId = matchingStep.nextStepId;
      let nextHighlightPosition = null;
      
      if (nextStepId) {
        const nextStep = currentLevel.tutorialSteps.find(step => step.id === nextStepId);
        if (nextStep?.triggerData?.position) {
          nextHighlightPosition = nextStep.triggerData.position;
        }
      }
      
      setTutorialState(prev => ({
        ...prev,
        currentStepId: matchingStep.id,
        completedStepIds: [...prev.completedStepIds, matchingStep.id],
        isModalOpen: true,
        highlightedPosition: nextHighlightPosition,
      }));
    } else {
      // Just clear the highlighted position if we selected something else
      if (tutorialState.highlightedPosition) {
        setTutorialState(prev => ({
          ...prev,
          highlightedPosition: null,
        }));
      }
    }
  };

  const advanceToNextLevel = () => {
    const nextLevelIndex = tutorialState.currentLevelIndex + 1;
    
    if (nextLevelIndex < tutorialLevels.length) {
      const nextLevel = tutorialLevels[nextLevelIndex];
      setTutorialState({
        currentLevelIndex: nextLevelIndex,
        currentStepId: nextLevel.startingStepId,
        completedStepIds: [],
        isModalOpen: true,
        showIntroScreen: false,
        highlightedPosition: null,
      });
    }
  };

  const resetTutorial = () => {
    setTutorialState(initialTutorialState);
  };

  const closeModal = () => {
    setTutorialState(prev => ({
      ...prev,
      isModalOpen: false,
    }));
  };

  const openModal = () => {
    setTutorialState(prev => ({
      ...prev,
      isModalOpen: true,
    }));
  };

  const startTutorial = () => {
    const firstLevel = tutorialLevels[0];
    // Find the first step that has a position to highlight
    const startingStep = firstLevel.tutorialSteps.find(
      step => step.id === firstLevel.startingStepId
    );
    const highlightPosition = startingStep?.triggerData?.position || null;
    
    setTutorialState({
      currentLevelIndex: 0,
      currentStepId: firstLevel.startingStepId,
      completedStepIds: [],
      isModalOpen: true,
      showIntroScreen: false,
      highlightedPosition: highlightPosition,
    });
  };

  return (
    <TutorialContext.Provider
      value={{
        tutorialState,
        currentLevel,
        currentStep,
        goToNextStep,
        handlePieceSelect,
        advanceToNextLevel,
        resetTutorial,
        closeModal,
        openModal,
        startTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}; 