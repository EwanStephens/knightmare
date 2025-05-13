import { TutorialLevel } from "@/types/tutorial";

export const tutorialLevels: TutorialLevel[] = [
  // Level 1 - BOAT
  {
    levelNumber: 1,
    targetWord: "BOAT",
    initialBoardSetup: [
      { position: "a2", pieceType: "rook", pieceColor: "white", letter: "B" },
      { position: "c2", pieceType: "bishop", pieceColor: "black", letter: "O" },
      { position: "d3", pieceType: "queen", pieceColor: "white", letter: "A" },
      { position: "e3", pieceType: "pawn", pieceColor: "black", letter: "T" }
    ],
    tutorialSteps: [
      {
        id: "level1-intro",
        text: "Welcome to Knightmare! In this game, you'll use chess pieces to build words. The goal for each level is shown at the top of the screen.",
        target: ".level-title",
        trigger: "load",
        nextStepId: "level1-select-rook",
        triggerData: { position: "a2" }
      },
      {
        id: "level1-select-rook",
        text: "Let's start by selecting the white rook.",
        trigger: "load",
        triggerData: { position: "a2" },
        nextStepId: null
      },
      {
        id: "level1-rook-selected",
        text: "Great job! Notice how the letter 'B' appears at the bottom of the screen. As you select pieces, their letters will form your word.",
        trigger: "select-piece",
        triggerData: { position: "a2" },
        nextStepId: "level1-rook-moves"
      },
      {
        id: "level1-rook-moves",
        text: "Rooks move horizontally and vertically on the board. The highlighted squares show where your piece can move.",
        trigger: "load",
        nextStepId: "level1-select-bishop",
        triggerData: { position: "c2" }
      },
      {
        id: "level1-select-bishop",
        text: "Now, capture the black bishop.",
        trigger: "load",
        triggerData: { position: "c2" },
        nextStepId: null
      },
      {
        id: "level1-bishop-captured",
        text: "Perfect! This was a legal capture because white pieces must capture black pieces. Notice how your word is now 'BO'.",
        trigger: "select-piece",
        triggerData: { position: "c2" },
        nextStepId: "level1-bishop-moves"
      },
      {
        id: "level1-bishop-moves",
        text: "Bishops move diagonally across the board.",
        trigger: "load",
        nextStepId: "level1-select-queen",
        triggerData: { position: "d3" }
      },
      {
        id: "level1-select-queen",
        text: "Can you figure out which piece to capture next? Remember, black pieces must capture white pieces.",
        trigger: "load",
        triggerData: { position: "d3" },
        nextStepId: null
      },
      {
        id: "level1-queen-captured",
        text: "Well done! You captured the white queen. Queens are very powerful - they can move horizontally, vertically, or diagonally.",
        trigger: "select-piece",
        triggerData: { position: "d3" },
        nextStepId: "level1-select-pawn"
      },
      {
        id: "level1-select-pawn",
        text: "Now try to find the final piece to complete the word BOAT.",
        trigger: "load",
        triggerData: { position: "e3" },
        nextStepId: null
      }
    ],
    startingStepId: "level1-intro"
  },
  
  // Level 2 - CHECK
  {
    levelNumber: 2,
    targetWord: "CHECK",
    initialBoardSetup: [
      { position: "a2", pieceType: "queen", pieceColor: "black", letter: "K" },
      { position: "b2", pieceType: "pawn", pieceColor: "white", letter: "H" },
      { position: "b5", pieceType: "pawn", pieceColor: "black", letter: "A" },
      { position: "c3", pieceType: "pawn", pieceColor: "black", letter: "E" },
      { position: "c4", pieceType: "knight", pieceColor: "black", letter: "C" },
      { position: "d2", pieceType: "rook", pieceColor: "white", letter: "C" },
      { position: "e4", pieceType: "bishop", pieceColor: "black", letter: "U" }
    ],
    tutorialSteps: [
      {
        id: "level2-intro",
        text: "In this level, the target word is 5 letters, but there are 7 pieces on the board. Not all pieces will be used in the solution - you need to figure out which ones to include.",
        trigger: "load",
        nextStepId: "level2-try-bishop"
      },
      {
        id: "level2-try-bishop",
        text: "Let's try selecting the black bishop with the letter 'U'.",
        trigger: "load",
        triggerData: { position: "e4" },
        nextStepId: null
      },
      {
        id: "level2-bishop-selected",
        text: "Uh oh, there are no pieces that the black bishop can capture, so this can't be the right first letter. Let's clear our answer using the Clear button and try again.",
        trigger: "select-piece",
        triggerData: { position: "e4" },
        nextStepId: null
      },
      {
        id: "level2-after-clear",
        text: "Let's try selecting the black knight with the letter 'C' instead.",
        trigger: "load",
        triggerData: { position: "c4" },
        nextStepId: null
      },
      {
        id: "level2-knight-selected",
        text: "Knights move in an L-shape: 2 squares in one direction and then 1 square perpendicular to that direction. Notice there are 2 legal captures. Try to figure out which one to make.",
        trigger: "select-piece",
        triggerData: { position: "c4" },
        nextStepId: null
      },
      {
        id: "level2-pawn-captured",
        text: "Great! Pawns capture diagonally. White pawns move up the board. Now, try to figure out which piece to capture next.",
        trigger: "select-piece",
        triggerData: { position: "b2" },
        nextStepId: null
      },
      {
        id: "level2-black-pawn-captured",
        text: "Good choice! Black pawns move down the board. Keep trying to figure out the next piece to capture.",
        trigger: "select-piece",
        triggerData: { position: "c3" },
        nextStepId: null
      },
      {
        id: "level2-rook-captured",
        text: "Nice move! Since the white pawn (H) has already been captured, that square is now empty, and the rook is free to capture the black queen to complete the word.",
        trigger: "select-piece",
        triggerData: { position: "d2" },
        nextStepId: null
      }
    ],
    startingStepId: "level2-intro"
  },
  
  // Level 3 - FINISH
  {
    levelNumber: 3,
    targetWord: "FINISH",
    initialBoardSetup: [
      { position: "b1", pieceType: "rook", pieceColor: "black", letter: "I" },
      { position: "b4", pieceType: "knight", pieceColor: "white", letter: "F" },
      { position: "c2", pieceType: "queen", pieceColor: "black", letter: "I" },
      { position: "c3", pieceType: "pawn", pieceColor: "black", letter: "H" },
      { position: "d1", pieceType: "knight", pieceColor: "white", letter: "S" },
      { position: "d3", pieceType: "bishop", pieceColor: "white", letter: "N" },
      { position: "d5", pieceType: "rook", pieceColor: "black", letter: "U" }
    ],
    tutorialSteps: [
      {
        id: "level3-intro",
        text: "Let's see if you can solve this one yourself!",
        trigger: "load",
        nextStepId: null
      },
      {
        id: "level3-complete",
        text: "Congratulations on completing the tutorial!",
        trigger: "load",
        nextStepId: null
      }
    ],
    startingStepId: "level3-intro"
  }
]; 