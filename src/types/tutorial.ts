import { Square } from './chess';

export type TutorialStep = {
  id: string;
  text: string;
  target?: string; // CSS selector for highlighting specific UI elements
  trigger?: 'load' | 'click' | 'select-piece' | 'capture';
  triggerData?: {
    position?: string; // Position like 'a2'
    pieceType?: string; // Like 'rook', 'pawn'
    currentWord?: string; // Current word progress like 'B', 'BO', etc.
  };
  nextStepId?: string | null; // Next step or null if this is the last step in a sequence
  position?: 'top' | 'bottom'; // Position of the modal
};

export type TutorialLevel = {
  levelNumber: number;
  targetWord: string;
  initialBoardSetup: {
    position: string;
    pieceType: string;
    pieceColor: 'white' | 'black';
    letter: string;
  }[];
  tutorialSteps: TutorialStep[];
  startingStepId: string;
  congratsMessage?: string;
};

export type TutorialState = {
  currentLevelIndex: number;
  currentStepId: string | null;
  completedStepIds: string[];
  isModalOpen: boolean;
  showIntroScreen: boolean;
  highlightedPosition: string | null;
  currentWord: string; // Track the current word being built
}; 