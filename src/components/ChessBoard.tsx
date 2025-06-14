'use client';

import { useEffect, useState } from 'react';
import { ChessPiece, GameState } from '@/types/chess';
import { algebraicToPosition, getLegalMoves, positionToAlgebraic, isValidChessCapture } from '@/utils/chess';
import { LoadedLevel } from '@/types/level';
import chessPieces from '../../public/img/chesspieces/standard';
import CompletionModal from './CompletionModal';
import { 
  markPuzzleSolved, 
  isPuzzleSolved, 
  incrementHintUsed, 
  markRevealUsed, 
  incrementClearButtonPress, 
  incrementPiecePress 
} from '@/utils/gameState';

// Add enum for hint step
enum HintStep {
  None = 0,
  CrossOut = 1,
  FirstLetter = 2,
  Reveal = 3
}

// Add prop type
interface ChessBoardProps {
  levelData?: LoadedLevel; // Required for non-tutorial mode
  tutorialMode?: boolean;
  tutorialLevel?: LoadedLevel;
  onPieceSelected?: (position: string, word: string) => void;
  onLevelComplete?: () => void;
  highlightedPosition?: string | null;
  nextPuzzleId?: string | null;
  congratsMessage?: string;
  puzzleId?: string;
  hintSquares?: string[];
  firstLetterSquare?: string;
  revealPath?: string[];
  isDailyPuzzle?: boolean;
  puzzleType?: 'short' | 'medium' | 'long' | null;
  date?: string;
  shortPuzzleId?: string;
  mediumPuzzleId?: string;
  longPuzzleId?: string;
}

export default function ChessBoard({ 
  levelData,
  tutorialMode = false,
  tutorialLevel,
  onPieceSelected,
  onLevelComplete,
  highlightedPosition,
  nextPuzzleId,
  congratsMessage,
  puzzleId,
  hintSquares,
  firstLetterSquare,
  revealPath,
  isDailyPuzzle,
  puzzleType,
  date,
  shortPuzzleId,
  mediumPuzzleId,
  longPuzzleId,
}: ChessBoardProps) {
  const [gameLevelData, setGameLevelData] = useState<LoadedLevel | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentWord: '',
    selectedSquare: null,
    previousSquares: [],
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [illegalMoveSquare, setIllegalMoveSquare] = useState<string | null>(null);
  const [hintStep, setHintStep] = useState<HintStep>(HintStep.None);
  const [greyedOutSquares, setGreyedOutSquares] = useState<string[]>([]);
  const [highlightedHintSquare, setHighlightedHintSquare] = useState<string | null>(null);
  const [revealedPath, setRevealedPath] = useState<string[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showWaveAnimation, setShowWaveAnimation] = useState(false);
  const [waveAnimationLetterIndex, setWaveAnimationLetterIndex] = useState(0);

  // Function to setup the board in a completed state for already solved puzzles
  const setupCompletedBoardState = (levelData: LoadedLevel, revealPath: string[]) => {
    const lastPosition = revealPath[revealPath.length - 1];
    const previousPositions = revealPath.slice(0, -1);
    
    // Get the piece at the last position to calculate legal moves
    const { row: lastRow, col: lastCol } = algebraicToPosition(lastPosition);
    const lastSquare = levelData.board[lastRow][lastCol];
    const legalMoves = lastSquare.piece ? getLegalMoves(lastSquare.piece, { row: lastRow, col: lastCol }, levelData.board, previousPositions) : [];
    
    setGameState(prevState => ({
      ...prevState,
      currentWord: levelData.targetWord,
      selectedSquare: lastPosition, // Set the last position as selected
      previousSquares: previousPositions, // All squares except the last one
      board: prevState.board.map(row =>
        row.map(sq => ({
          ...sq,
          isSelected: sq.position === lastPosition, // Last position is selected
          isLegalMove: legalMoves.some(move => positionToAlgebraic(move.row, move.col) === sq.position), // Show legal moves from last position
          isHighlighted: previousPositions.includes(sq.position), // Highlight the path excluding last square
        }))
      ),
    }));
  };

  useEffect(() => {
    // If in tutorial mode, use the provided level data
    if (tutorialMode && tutorialLevel) {
      setGameLevelData(tutorialLevel);
      setGameState(prevState => ({
        ...prevState,
        board: tutorialLevel.board,
        currentWord: '',
        selectedSquare: null,
        previousSquares: [],
      }));
      return;
    }
    // Otherwise, use the provided levelData prop
    if (levelData) {
      setGameLevelData(levelData);
      setGameState(prevState => ({
        ...prevState,
        board: levelData.board,
        currentWord: '',
        selectedSquare: null,
        previousSquares: [],
      }));
    }
  }, [levelData, tutorialMode, tutorialLevel]);

  useEffect(() => {
    if (puzzleId && typeof window !== 'undefined' && gameLevelData) {
      if (isPuzzleSolved(puzzleId)) {
        // For already solved puzzles, load the completed state with path shown
        if (revealPath) {
          setupCompletedBoardState(gameLevelData, revealPath);
        } else {
          // Fallback if no solution path is available
          setGameState(prevState => ({
            ...prevState,
            currentWord: gameLevelData.targetWord,
            selectedSquare: null,
            previousSquares: [],
            board: prevState.board.map(row =>
              row.map(sq => ({
                ...sq,
                isSelected: false,
                isLegalMove: false,
                isHighlighted: false,
              }))
            ),
          }));
        }
        
        // For long daily puzzles, show the completion modal
        if (isDailyPuzzle && puzzleType === 'long') {
          setTimeout(() => {
            setShowCompleteModal(true);
          }, 200);
        }
      }
    }
  }, [puzzleId, gameLevelData, isDailyPuzzle, puzzleType, revealPath]);

  const clearGameBoard = () => {
    return {
      ...gameState,
      board: gameState.board.map(row =>
        row.map(sq => ({
          ...sq,
          isSelected: false,
          isLegalMove: false,
          isHighlighted: false,
        }))
      ),
      selectedSquare: null,
      currentWord: '',
      previousSquares: [],
    };
  };

  const triggerIllegalMoveFlash = (position: string) => {
    setIllegalMoveSquare(position);
    setTimeout(() => {
      setIllegalMoveSquare(null);
      setTimeout(() => {
        setIllegalMoveSquare(position);
        setTimeout(() => setIllegalMoveSquare(null), 200);
      }, 200);
    }, 200);
  };

  const handleSquareClick = (position: string) => {
    if (!gameLevelData) return;

    const { row, col } = algebraicToPosition(position);
    const square = gameState.board[row][col];

    // In tutorial mode, notify when a piece is selected
    if (tutorialMode && onPieceSelected && square.piece) {
      onPieceSelected(position, gameState.currentWord + (square.piece?.letter || ''));
    }

    // If a square is already selected, check if new square is a legal capture
    let newPreviousSquares: string[] = [];
    if (gameState.selectedSquare) {
      // Ignore clicks on the already selected square
      if (gameState.selectedSquare === position) {
        return;
      }

      const startPos = algebraicToPosition(gameState.selectedSquare);
      const startSquare = gameState.board[startPos.row][startPos.col];
      
      if (!startSquare.piece) {
        return; // Ignore if somehow the selected square has no piece
      }

      // Check if it's a legal capture
      if (!isValidChessCapture(startSquare.piece, startPos, { row, col }, gameState.board, gameState.previousSquares)) {
        triggerIllegalMoveFlash(position);
        return; // Don't track illegal moves
      }

      newPreviousSquares = [...gameState.previousSquares, gameState.selectedSquare];
    } else {
      // First selection: must be a square with a piece
      if (!square.piece) {
        triggerIllegalMoveFlash(position);
        return; // Don't track illegal moves
      }
    }

    // Only track piece press for non-tutorial mode and valid moves
    if (!tutorialMode && puzzleId && square.piece) {
      incrementPiecePress(puzzleId, square.piece);
    }

    // Add new letter to word
    const newWord = gameState.currentWord + (square.piece?.letter || '');

    // Calculate legal moves from new square
    const legalMoves = getLegalMoves(square.piece!, { row, col }, gameState.board, newPreviousSquares);

    // Update board state
    const newBoard = gameState.board.map(row =>
      row.map(sq => ({
        ...sq,
        isSelected: sq.position === position,
        isLegalMove: legalMoves.some(
          move => positionToAlgebraic(move.row, move.col) === sq.position
        ),
        isHighlighted: newPreviousSquares.includes(sq.position),
      }))
    );

    // Check if word matches target
    if (newWord === gameLevelData.targetWord) {
      // Always call the completion callback if provided
      if (onLevelComplete) {
        onLevelComplete();
      }
      // Mark puzzle as solved in localStorage for non-tutorial mode
      if (!tutorialMode && puzzleId) {
        markPuzzleSolved(puzzleId);
      }
      
      // Handle completion based on mode
      if (tutorialMode) {
        // For all tutorial levels, show wave animation and then use callback
        // Set the completed word and start wave animation
        setGameState({
          ...gameState,
          board: newBoard,
          currentWord: newWord,
          selectedSquare: null,
          previousSquares: newPreviousSquares,
        });
        
        // Always use callback for tutorial completion to let context handle progression
        startWaveAnimation(newWord, undefined, false, true);
        return; // Exit early to avoid duplicate setGameState
      } else {
        // For daily puzzles, show wave animation for all types, then modal only for long
        if (isDailyPuzzle) {
          // Set the completed word and start wave animation
          setGameState({
            ...gameState,
            board: newBoard,
            currentWord: newWord,
            selectedSquare: null,
            previousSquares: newPreviousSquares,
          });
          
          // Start wave animation
          if (puzzleType === 'long') {
            // For long puzzles, show completion modal after wave animation
            startWaveAnimation(newWord, undefined, true);
          } else {
            // For short/medium puzzles, navigate to next puzzle after wave animation
            if (nextPuzzleId) {
              startWaveAnimation(newWord, `/puzzle/${nextPuzzleId}`);
            } else {
              startWaveAnimation(newWord);
            }
          }
          return; // Exit early to avoid duplicate setGameState
        } else {
          // Regular behavior for non-daily puzzles
          setTimeout(() => {
            setShowCompleteModal(true);
          }, 200);
        }
      }
    }

    setGameState({
      ...gameState,
      board: newBoard,
      currentWord: newWord,
      selectedSquare: position,
      previousSquares: newPreviousSquares,
    });
  };

  const handleCancel = () => {
    // Track clear button press for non-tutorial mode
    if (!tutorialMode && puzzleId) {
      incrementClearButtonPress(puzzleId);
    }

    // Clear the revealed path first to ensure board renders correctly
    setRevealedPath([]);
    
    const newState = clearGameBoard();
    setGameState(newState);
    
    // If we're clearing after a reveal, preserve hints but ensure clean state
    if (hintStep === HintStep.Reveal) {
      // Go back to the first letter hint state (preserve the first two hints)
      setHintStep(HintStep.FirstLetter);
      setHighlightedHintSquare(firstLetterSquare || null); // Re-highlight the first letter
    }
    
    // Notify tutorial system of clear action in tutorial mode
    if (tutorialMode && onPieceSelected) {
      onPieceSelected('clear', '');
    }
  };

  // Improved wave animation for success feedback
  const startWaveAnimation = (targetWord: string, navigationUrl?: string, showCompletionModal = false, useCallback = false) => {
    setShowWaveAnimation(true);
    setWaveAnimationLetterIndex(0);
    
    let letterIndex = 0;
    const animateNextLetter = () => {
      setWaveAnimationLetterIndex(letterIndex);
      letterIndex++;
      
      if (letterIndex < targetWord.length) {
        setTimeout(animateNextLetter, 10); // delay between letters
      } else {
        // Animation complete, handle next action after a short delay
        if (useCallback && onLevelComplete) {
          setTimeout(() => {
            setShowWaveAnimation(false);
            onLevelComplete();
          }, 1500);
        } else if (navigationUrl) {
          setTimeout(() => {
            window.location.href = navigationUrl;
          }, 1500);
        } else if (showCompletionModal) {
          setTimeout(() => {
            setShowWaveAnimation(false);
            setShowCompleteModal(true);
          }, 1500);
        } else {
          setTimeout(() => {
            setShowWaveAnimation(false);
          }, 1500);
        }
      }
    };
    
    setTimeout(animateNextLetter, 10); // Initial delay before starting animation
  };

  // Factored out reveal logic
  const reveal = () => {
    if (!revealPath) return;
    
    // Track reveal usage for non-tutorial mode
    if (!tutorialMode && puzzleId) {
      markRevealUsed(puzzleId);
    }
    
    setHintStep(HintStep.Reveal);
    setIsRevealing(true);
    setRevealedPath([]);
    setGameState(prevState => ({
      ...prevState,
      currentWord: '',
    }));
    let i = 0;
    const revealNext = () => {
      setRevealedPath(path => {
        const nextIndex = path.length;
        if (nextIndex < revealPath.length) {
          const newPath = [...path, revealPath[nextIndex]];
          setGameState(prevState => {
            const newWord = (gameLevelData?.targetWord || '').slice(0, newPath.length);
            return {
              ...prevState,
              currentWord: newWord,
            };
          });
          return newPath;
        }
        return path;
      });
      i++;
      if (i < revealPath.length) {
        setTimeout(revealNext, 1000);
      } else {
        // Reveal animation complete, now transition to normal state and show wave animation
        setIsRevealing(false); // Reset revealing state immediately
        
        // Reset hint state back to FirstLetter to preserve the previous hints
        setHintStep(HintStep.FirstLetter);
        setHighlightedHintSquare(firstLetterSquare || null);
        
        if (!tutorialMode && puzzleId) {
          markPuzzleSolved(puzzleId);
        }
        // Always call the completion callback if provided
        if (onLevelComplete) {
          onLevelComplete();
        }
        
        // Show wave animation for the completed word
        const targetWord = gameLevelData?.targetWord || '';
        
        // For daily puzzles, handle different types
        if (isDailyPuzzle && puzzleType !== 'long') {
          // Auto-navigate to next puzzle after wave animation for short/medium
          if (nextPuzzleId) {
            startWaveAnimation(targetWord, `/puzzle/${nextPuzzleId}`);
          } else {
            startWaveAnimation(targetWord);
          }
        } else {
          // For non-daily puzzles or long daily puzzles, show completion modal after wave animation
          startWaveAnimation(targetWord, undefined, true);
        }
      }
    };
    if (revealPath.length > 0) {
      setTimeout(revealNext, 500);
    }
  };

  const handleHintClick = async () => {
    if (hintStep === HintStep.None && hintSquares) {
      // Track first hint usage for non-tutorial mode
      if (!tutorialMode && puzzleId) {
        incrementHintUsed(puzzleId);
      }
      setGreyedOutSquares(hintSquares);
      setHintStep(HintStep.CrossOut);
    } else if (hintStep === HintStep.CrossOut && firstLetterSquare) {
      // Track second hint usage for non-tutorial mode
      if (!tutorialMode && puzzleId) {
        incrementHintUsed(puzzleId);
      }
      setHighlightedHintSquare(firstLetterSquare);
      setHintStep(HintStep.FirstLetter);
    } else if (hintStep === HintStep.FirstLetter && revealPath) {
      setHighlightedHintSquare(null); // Clear first letter hint before reveal
      handleCancel(); // Clear board state before reveal
      reveal();
    }
  };

  // Reset hint state when board changes (e.g. on replay)
  useEffect(() => {
    setHintStep(HintStep.None);
    setGreyedOutSquares([]);
    setHighlightedHintSquare(null);
    setRevealedPath([]);
    setIsRevealing(false);
    setShowWaveAnimation(false);
    setWaveAnimationLetterIndex(0);
  }, [levelData]);

  if (!gameLevelData) {
    return <div>Loading...</div>;
  }

  // Determine if we should blur the main content
  const shouldBlurContent = showCompleteModal;

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Main content, blurred when modal is open */}
      <div className={shouldBlurContent ? "filter blur-sm pointer-events-none transition-all duration-200" : "transition-all duration-200"}>
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full px-2 sm:px-4">
          <div className="text-xl sm:text-2xl font-bold my-2 sm:my-4">
            Find a {gameLevelData.targetWord.length} letter word
          </div>
          {/* Responsive chessboard grid - constrained to viewport with max size */}
          <div className="aspect-square mx-auto w-[min(75dvw,40dvh)] min-w-50 min-h-50 max-w-120 max-h-120">
            <div className="grid grid-cols-5 gap-0.5 sm:gap-1 bg-gray-200 w-full h-full">
              {gameState.board.map((row, rowIndex) =>
                row.map((square, colIndex) => {
                  const isGreyedOut = greyedOutSquares.includes(square.position);
                  const isHintHighlight = highlightedHintSquare === square.position;
                  const isReveal = revealedPath.includes(square.position);
                  const revealIndex = revealedPath.indexOf(square.position);
                  const isRevealCurrent = isReveal && revealIndex === revealedPath.length - 1;
                  const isRevealPrev = isReveal && revealIndex !== revealedPath.length - 1;
                  // For first letter hint: show piece+letter with yellow ring/pulse, not just letter
                  // Only show just the letter if part of revealed path (i.e. after reveal starts)
                  return (
                    <div
                      key={square.position}
                      onClick={() => !isRevealing && handleSquareClick(square.position)}
                      className={`
                        aspect-square flex items-center justify-center relative
                        transition-colors duration-200
                        ${illegalMoveSquare === square.position ? 'bg-spell-red' : ''}
                        ${tutorialMode && highlightedPosition === square.position ? 'ring-4 ring-yellow-400 z-10' : ''}
                        ${(isHintHighlight && !isReveal) ? 'ring-4 ring-yellow-400 z-10' : ''}
                        ${isRevealCurrent ? 'bg-[#94A3B8]' : ''}
                        ${isRevealPrev ? 'bg-yellow-200' : ''}
                        ${square.isHighlighted && !isRevealPrev ? 'bg-yellow-200' : ''}
                        ${square.isSelected && !isRevealCurrent ? 'bg-[#94A3B8]' : ''}
                        ${!square.isHighlighted && !square.isSelected && !isReveal && illegalMoveSquare !== square.position ? 
                          (rowIndex + colIndex) % 2 === 0 ? 'bg-cream' : 'bg-asparagus' : ''}
                        ${square.piece ? 'hover:bg-opacity-90' : ''}
                        cursor-pointer
                        ${isGreyedOut ? 'opacity-40 grayscale relative' : ''}
                      `}
                    >
                      {((tutorialMode && highlightedPosition === square.position) || (isHintHighlight && !isReveal)) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="absolute inset-0 animate-pulse bg-yellow-400 opacity-20 rounded-md"></div>
                        </div>
                      )}
                      {square.isLegalMove && !square.piece && (
                        <div className="absolute w-1/4 h-1/4 rounded-full bg-[rgba(50,50,50,0.4)]" />
                      )}
                      {square.isLegalMove && square.piece && (
                        <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 100 100">
                          <path
                            d="M 0 35 A 35 35 0 0 1 35 0 L 0 0 Z"
                            fill="rgba(50,50,50,0.4)"
                          />
                          <path
                            d="M 65 0 A 35 35 0 0 1 100 35 L 100 0 Z"
                            fill="rgba(50,50,50,0.4)"
                          />
                          <path
                            d="M 0 65 A 35 35 0 0 0 35 100 L 0 100 Z"
                            fill="rgba(50,50,50,0.4)"
                          />
                          <path
                            d="M 65 100 A 35 35 0 0 0 100 65 L 100 100 Z"
                            fill="rgba(50,50,50,0.4)"
                          />
                        </svg>
                      )}
                      {square.piece && (
                        <>
                          {/* Show just the letter if part of revealed path or if square.isHighlighted (clicked path), else show piece+letter */}
                          {(isRevealPrev || (square.isHighlighted && !isRevealCurrent)) ? (
                            <div 
                              className="font-bold text-asparagus z-20 flex items-center justify-center"
                              style={{
                                fontSize: "max(24px, min(8dvw, 4dvh))",
                                width: "100%",
                                height: "100%"
                              }}
                            >
                              {square.piece.letter}
                            </div>
                          ) : (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="w-[75%] h-[75%]">
                                  {getPieceComponent(square.piece.type, square.piece.color)}
                                </div>
                              </div>
                              <div 
                                className={`absolute top-0 right-0 z-20 font-bold ${(rowIndex + colIndex) % 2 === 0 ? 'text-asparagus' : 'text-cream'}`}
                                style={{
                                  fontSize: "max(14px, min(4dvw, 2dvh))",
                                  top: "max(2px, min(1dvw, 0.5dvh))",
                                  right: "max(2px, min(1dvw, 0.5dvh))"
                                }}
                              >
                                {square.piece.letter}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 sm:gap-4 w-full max-w-[90vmin] sm:max-w-[80vmin] md:max-w-[75vmin] mx-auto">
            <div 
              className="flex whitespace-nowrap justify-center items-center font-mono w-full relative pt-4 pb-2"
              style={{ 
                height: "max(60px, min(8dvh, 10dvw))"
              }}
            >
              {Array.from(gameLevelData.targetWord).map((_, index) => {
                // Dynamically calculate sizes based on word length
                const letterWidth = Math.max(100 / gameLevelData.targetWord.length, 6);
                const isWaving = showWaveAnimation && index <= waveAnimationLetterIndex;
                
                return (
                  <span 
                    key={index} 
                    className={`text-center border-b-4 border-gray-400 mx-[2px] sm:mx-1 flex justify-center items-center transition-transform duration-200 ease-out ${
                      isWaving ? 'wave-letter' : ''
                    }`}
                    style={{ 
                      width: `${letterWidth}%`, 
                      minWidth: '1rem',
                      maxWidth: '3rem',
                      height: '80%',
                      minHeight: '40px',
                      // Calculate font size based on viewport with minimum size guarantee
                      fontSize: `max(20px, min(${Math.min(12, 60/gameLevelData.targetWord.length)}dvw, ${Math.min(6, 30/gameLevelData.targetWord.length)}dvh))`,
                      animationDelay: isWaving ? `${index * 150}ms` : '0ms'
                    }}
                  >
                    {index < gameState.currentWord.length ? gameState.currentWord[index] : '\u00A0'}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-4 mt-1 sm:mt-2">
              <button
                onClick={handleCancel}
                disabled={isRevealing}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base md:text-lg bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200 ${isRevealing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Clear
              </button>
              {hintSquares && firstLetterSquare && revealPath && (
                <button
                  onClick={handleHintClick}
                  disabled={isRevealing}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base md:text-lg rounded transition-colors duration-200
                    ${hintStep < HintStep.FirstLetter ? 'bg-spell-blue text-white hover:bg-spell-blue-dark' : 'bg-spell-red text-white hover:bg-spell-red-dark'}
                    ${hintStep === HintStep.Reveal ? 'bg-spell-red text-white hover:bg-spell-red-dark' : ''}
                    ${isRevealing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {hintStep < HintStep.FirstLetter ? 'Hint' : hintStep === HintStep.FirstLetter ? 'Reveal' : 'Revealing...'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Completion Modal using the shared component */}
      <CompletionModal 
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        congratsMessage={congratsMessage || gameLevelData.congratsMessage}
        isDailyPuzzle={isDailyPuzzle}
        puzzleType={puzzleType}
        date={date}
        shortPuzzleId={shortPuzzleId}
        mediumPuzzleId={mediumPuzzleId}
        longPuzzleId={longPuzzleId}
      />
    </div>
  );
}

function getPieceComponent(type: ChessPiece['type'], color: ChessPiece['color']) {
  const pieceMap = {
    pawn: 'P',
    knight: 'N',
    bishop: 'B',
    rook: 'R',
    queen: 'Q',
    king: 'K'
  };
  const pieceKey = `${color === 'white' ? 'w' : 'b'}${pieceMap[type]}`;
  return chessPieces[pieceKey as keyof typeof chessPieces];
} 