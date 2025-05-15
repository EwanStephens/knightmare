'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TutorialLevel, TutorialState, TutorialStep } from '@/types/tutorial';
import { loadTutorialLevel } from '@/utils/tutorialLoader';

type TutorialContextType = {
  tutorialState: TutorialState;
  currentLevel: TutorialLevel | null;
  currentStep: TutorialStep | null;
  goToNextStep: () => void;
  handlePieceSelect: (position: string, currentWord?: string) => void;
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
  currentWord: '',
};

const TutorialContext = createContext<TutorialContextType | null>(null);

type TutorialProviderProps = {
  children: ReactNode;
  initialLevel?: number;
};

export const TutorialProvider = ({ children, initialLevel = 1 }: TutorialProviderProps) => {
  const [tutorialLevels, setTutorialLevels] = useState<TutorialLevel[]>([]);
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    ...initialTutorialState,
    currentLevelIndex: initialLevel - 1,
  });

  // Load tutorial levels
  useEffect(() => {
    const loadLevels = async () => {
      try {
        const level1 = await loadTutorialLevel(1);
        const level2 = await loadTutorialLevel(2);
        const level3 = await loadTutorialLevel(3);
        setTutorialLevels([level1, level2, level3]);
      } catch (error) {
        console.error("Failed to load tutorial levels:", error);
      }
    };
    
    loadLevels();
  }, []);

  const currentLevel = tutorialState.currentLevelIndex < tutorialLevels.length && tutorialLevels.length > 0
    ? tutorialLevels[tutorialState.currentLevelIndex]
    : null;

  const currentStep = currentLevel && tutorialState.currentStepId
    ? currentLevel.tutorialSteps.find(step => step.id === tutorialState.currentStepId) || null
    : null;

  // Initialize the tutorial with the first level and step
  useEffect(() => {
    if (currentLevel && !tutorialState.currentStepId && tutorialLevels.length > 0) {
      setTutorialState(prev => ({
        ...prev,
        currentStepId: currentLevel.startingStepId,
        // Don't show intro screen when navigating directly to a level
        showIntroScreen: initialLevel === 1 ? prev.showIntroScreen : false,
        currentWord: '',
      }));
    }
  }, [currentLevel, tutorialState.currentStepId, tutorialLevels.length, initialLevel]);

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

  const handlePieceSelect = (position: string, currentWord = '') => {
    if (!currentLevel) return;
    
    // Update current word in state
    setTutorialState(prev => ({
      ...prev,
      currentWord: currentWord,
    }));
    
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
          currentWord: '',
        }));
      }
      return;
    }
    
    // Find a matching step based on the position and current word progress
    // Instead of hardcoding the conditions, we'll use the triggerData from the step
    const matchingStep = currentLevel.tutorialSteps.find(step => {
      // Skip steps we've already completed
      if (tutorialState.completedStepIds.includes(step.id)) return false;
      
      // Check if this step matches our current situation (position + word progress)
      return step.triggerData?.position === position && 
             (!step.triggerData?.currentWord || step.triggerData.currentWord === currentWord);
    });
    
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
        currentWord: '',
      });
    }
  };

  const resetTutorial = () => {
    setTutorialState({
      ...initialTutorialState,
      currentLevelIndex: initialLevel - 1,
    });
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
    if (tutorialLevels.length === 0) return;
    
    const firstLevel = tutorialLevels[0];
    
    setTutorialState({
      currentLevelIndex: 0,
      currentStepId: firstLevel.startingStepId,
      completedStepIds: [],
      isModalOpen: true,
      showIntroScreen: false,
      highlightedPosition: null, // Don't highlight on first step
      currentWord: '',
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