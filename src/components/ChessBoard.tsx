'use client';

import { useEffect, useState } from 'react';
import { ChessPiece, GameState } from '@/types/chess';
import { algebraicToPosition, getLegalMoves, positionToAlgebraic, isValidChessCapture } from '@/utils/chess';
import { LoadedLevel } from '@/types/level';
import '@/styles/chess.css';
import chessPieces from '../../public/img/chesspieces/standard';
import CompletionModal from './CompletionModal';
import { markPuzzleSolved, isPuzzleSolved } from '@/utils/gameState';

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
  puzzleId
}: ChessBoardProps) {
  const [gameLevelData, setGameLevelData] = useState<LoadedLevel | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentWord: '',
    selectedSquare: null,
    previousSquares: [],
    message: '',
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [illegalMoveSquare, setIllegalMoveSquare] = useState<string | null>(null);

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
        message: '',
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
        message: '',
      }));
    }
  }, [levelData, tutorialMode, tutorialLevel]);

  useEffect(() => {
    if (puzzleId && typeof window !== 'undefined') {
      if (isPuzzleSolved(puzzleId)) {
        setShowCompleteModal(true);
      }
    }
  }, [puzzleId]);

  const clearGameBoard = (message: string) => {
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
      message,
    };
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
      const startPos = algebraicToPosition(gameState.selectedSquare);
      const startSquare = gameState.board[startPos.row][startPos.col];
      
      if (!startSquare.piece) {
        return; // Ignore if somehow the selected square has no piece
      }

      // Check if the clicked square is a legal move
      const legalMoves = getLegalMoves(startSquare.piece, startPos, gameState.board, gameState.previousSquares);
      const isLegalMove = legalMoves.some(move => move.row === row && move.col === col);
      if (!isLegalMove) {
        return; // Silently ignore if not a legal move
      }

      // Check if it's a legal capture
      if (!isValidChessCapture(startSquare.piece, startPos, { row, col }, gameState.board, gameState.previousSquares)) {
        // Show error message and flash the square red
        setIllegalMoveSquare(position);
        setTimeout(() => setIllegalMoveSquare(null), 200); // Remove the flash after 200ms
        
        setGameState({
          ...gameState,
          message: "Illegal move. You must capture a piece of the opposite color."
        });
        return;
      }
      
      newPreviousSquares = [...gameState.previousSquares, gameState.selectedSquare];
    } else {
      // Must select a square with a piece for the first selection
      if (!square.piece) {
        return; // Silently ignore if first selection has no piece
      }
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
    let message = '';
    if (newWord === gameLevelData.targetWord) {
      message = congratsMessage || gameLevelData.congratsMessage || `Congratulations! You found the word ${gameLevelData.targetWord}!`;
      // Always call the completion callback if provided
      if (onLevelComplete) {
        onLevelComplete();
      }
      // Mark puzzle as solved in localStorage for non-tutorial mode
      if (!tutorialMode && puzzleId) {
        markPuzzleSolved(puzzleId);
      }
      // Show modal for non-tutorial mode
      if (!tutorialMode) {
        setTimeout(() => {
          setShowCompleteModal(true);
        }, 200);
      }
    }

    setGameState({
      ...gameState,
      board: newBoard,
      currentWord: newWord,
      selectedSquare: position,
      previousSquares: newPreviousSquares,
      message: message,
    });
  };

  const handleCancel = () => {
    const newState = clearGameBoard('');
    setGameState(newState);
    
    // Notify tutorial system of clear action in tutorial mode
    if (tutorialMode && onPieceSelected) {
      onPieceSelected('clear', '');
    }
  };

  if (!gameLevelData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Main content, blurred when modal is open */}
      <div className={showCompleteModal ? "filter blur-sm pointer-events-none transition-all duration-200" : "transition-all duration-200"}>
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full px-2 sm:px-4">
          <div className="text-xl sm:text-2xl font-bold my-2 sm:my-4 level-title">
            Find a {gameLevelData.targetWord.length} letter word
          </div>
          {/* Responsive chessboard grid - constrained to viewport with max size */}
          <div className="aspect-square mx-auto w-[min(75vw,40vh)] min-w-50 min-h-50 max-w-120 max-h-120">
            <div className="grid grid-cols-5 gap-0.5 sm:gap-1 bg-gray-200 w-full h-full">
              {gameState.board.map((row, rowIndex) =>
                row.map((square, colIndex) => (
                  <div
                    key={square.position}
                    onClick={() => handleSquareClick(square.position)}
                    className={`
                      aspect-square flex items-center justify-center relative
                      transition-colors duration-200
                      ${tutorialMode && highlightedPosition === square.position ? 'ring-4 ring-yellow-400 z-10' : ''}
                      ${illegalMoveSquare === square.position ? 'bg-red-500' : ''}
                      ${square.isHighlighted ? 'bg-yellow-200' : ''}
                      ${square.isSelected ? 'bg-[#94A3B8]' : ''}
                      ${!square.isHighlighted && !square.isSelected && illegalMoveSquare !== square.position ? 
                        (rowIndex + colIndex) % 2 === 0 ? 'bg-[#EEEED2]' : 'bg-[#769656]' : ''}
                      ${square.piece ? 'hover:bg-opacity-90' : ''}
                      cursor-pointer
                    `}
                  >
                    {tutorialMode && highlightedPosition === square.position && (
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
                        {square.isHighlighted ? (
                          <div 
                            className="font-bold text-[#769656] z-20 flex items-center justify-center"
                            style={{
                              fontSize: "max(24px, min(8vw, 4vh))",
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
                              className={`absolute top-0 right-0 z-20 font-bold ${(rowIndex + colIndex) % 2 === 0 ? 'text-[#769656]' : 'text-[#EEEED2]'}`}
                              style={{
                                fontSize: "max(14px, min(4vw, 2vh))",
                                top: "max(2px, min(1vw, 0.5vh))",
                                right: "max(2px, min(1vw, 0.5vh))"
                              }}
                            >
                              {square.piece.letter}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 sm:gap-4 w-full max-w-[90vmin] sm:max-w-[80vmin] md:max-w-[75vmin] mx-auto overflow-hidden">
            <div 
              className="flex whitespace-nowrap justify-center items-center font-mono w-full overflow-visible relative"
              style={{ 
                height: "max(50px, min(6vh, 8vw))"
              }}
            >
              {Array.from(gameLevelData.targetWord).map((_, index) => {
                // Dynamically calculate sizes based on word length
                const letterWidth = Math.max(100 / gameLevelData.targetWord.length, 6);
                
                return (
                  <span 
                    key={index} 
                    className="text-center border-b-4 border-gray-400 mx-[2px] sm:mx-1 flex justify-center items-center"
                    style={{ 
                      width: `${letterWidth}%`, 
                      minWidth: '1rem',
                      maxWidth: '3rem',
                      height: '80%',
                      minHeight: '40px',
                      // Calculate font size based on viewport with minimum size guarantee
                      fontSize: `max(20px, min(${Math.min(12, 60/gameLevelData.targetWord.length)}vw, ${Math.min(6, 30/gameLevelData.targetWord.length)}vh))`
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
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base md:text-lg bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
            {gameState.message && !showCompleteModal && !gameState.message.includes('Congratulations') && (
              <div className="text-base sm:text-lg text-red-600 mt-2">{gameState.message}</div>
            )}
          </div>
        </div>
      </div>
      {/* Completion Modal using the shared component */}
      <CompletionModal 
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        congratsMessage={congratsMessage || gameLevelData.congratsMessage}
        targetWord={gameLevelData.targetWord}
        {...(nextPuzzleId ? { nextPath: `/puzzle/${nextPuzzleId}` } : {})}
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