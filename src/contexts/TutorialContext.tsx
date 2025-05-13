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
    
    setTutorialState(prev => ({
      ...prev,
      currentStepId: currentStep.nextStepId || null,
      completedStepIds: [...prev.completedStepIds, currentStep.id],
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
        setTutorialState(prev => ({
          ...prev,
          currentStepId: afterClearStep.id,
          completedStepIds: [...prev.completedStepIds, afterClearStep.id],
          isModalOpen: true,
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
        }));
      }
      return;
    }
    
    const matchingStep = currentLevel.tutorialSteps.find(step => 
      step.trigger === 'select-piece' && 
      step.triggerData?.position === position &&
      !tutorialState.completedStepIds.includes(step.id)
    );
    
    if (matchingStep) {
      setTutorialState(prev => ({
        ...prev,
        currentStepId: matchingStep.id,
        completedStepIds: [...prev.completedStepIds, matchingStep.id],
        isModalOpen: true,
      }));
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
    setTutorialState(prev => ({
      ...prev,
      showIntroScreen: false,
      currentLevelIndex: 0,
      currentStepId: tutorialLevels[0].startingStepId,
      isModalOpen: true,
    }));
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