'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChessPiece, GameState, Position, Square } from '@/types/chess';
import { algebraicToPosition, getLegalMoves, positionToAlgebraic, isValidChessCapture } from '@/utils/chess';
import { loadLevel } from '@/utils/levelLoader';
import { LoadedLevel } from '@/types/level';
import '@/styles/chess.css';
import chessPieces from '../../public/img/chesspieces/standard';

const createEmptyBoard = (): Square[][] => Array(5)
  .fill(null)
  .map((_, row) =>
    Array(5)
      .fill(null)
      .map((_, col) => ({
        piece: null,
        position: positionToAlgebraic(row, col),
        isHighlighted: false,
        isSelected: false,
        isLegalMove: false,
      }))
  );

// Add prop type
interface ChessBoardProps {
  initialLevel?: number;
  tutorialMode?: boolean;
  tutorialLevel?: LoadedLevel;
  onPieceSelected?: (position: string) => void;
  onLevelComplete?: () => void;
  highlightedPosition?: string | null;
}

export default function ChessBoard({ 
  initialLevel = 1, 
  tutorialMode = false,
  tutorialLevel,
  onPieceSelected,
  onLevelComplete,
  highlightedPosition
}: ChessBoardProps) {
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [levelData, setLevelData] = useState<LoadedLevel | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentWord: '',
    selectedSquare: null,
    previousSquares: [],
    message: '',
  });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [illegalMoveSquare, setIllegalMoveSquare] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeLevel = async () => {
      // If in tutorial mode, use the provided level data
      if (tutorialMode && tutorialLevel) {
        setLevelData(tutorialLevel);
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

      // Otherwise load the level normally
      const loadedLevel = await loadLevel(currentLevel);
      setLevelData(loadedLevel);
      setGameState(prevState => ({
        ...prevState,
        board: loadedLevel.board,
        currentWord: '',
        selectedSquare: null,
        previousSquares: [],
        message: '',
      }));
    };

    initializeLevel();
  }, [currentLevel, tutorialMode, tutorialLevel]);

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
    if (!levelData) return;

    const { row, col } = algebraicToPosition(position);
    const square = gameState.board[row][col];

    // In tutorial mode, notify when a piece is selected
    if (tutorialMode && onPieceSelected && square.piece) {
      onPieceSelected(position);
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
    let completed = false;
    if (newWord === levelData.targetWord) {
      message = levelData.congratsMessage || `Congratulations! You found the word ${levelData.targetWord}!`;
      completed = true;
      
      // If in tutorial mode, call the completion callback before showing modal
      if (tutorialMode && onLevelComplete) {
        onLevelComplete();
      } else {
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
      onPieceSelected('clear');
    }
  };

  if (!levelData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Main content, blurred when modal is open */}
      <div className={showCompleteModal ? "filter blur-sm pointer-events-none transition-all duration-200" : "transition-all duration-200"}>
        <div className="flex flex-col items-center gap-4 sm:gap-6 md:gap-8 w-full px-2 sm:px-4">
          <div className="text-xl sm:text-2xl font-bold my-2 sm:my-4 level-title">
            Find a {levelData.targetWord.length} letter word
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
                    style={{ 
                      // Set a CSS variable that can be used to scale the letter size
                      "--square-size": "100%" 
                    } as React.CSSProperties}
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
                              fontSize: "calc(var(--square-size) * 2)",
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
                                fontSize: "calc(var(--square-size) * 1)",
                                marginTop: "calc(var(--square-size) * 0.03)",
                                marginRight: "calc(var(--square-size) * 0.03)"
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
                // Container for the letters - creating a reference size
                "--answer-container-width": "100%",
                height: "2.5rem"
              } as React.CSSProperties}
            >
              {Array.from(levelData.targetWord).map((_, index) => {
                // Dynamically calculate sizes based on word length
                const letterWidth = Math.max(100 / levelData.targetWord.length, 6);
                
                return (
                  <span 
                    key={index} 
                    className="text-center border-b-4 border-gray-400 mx-[2px] sm:mx-1 flex justify-center items-end"
                    style={{ 
                      width: `${letterWidth}%`, 
                      minWidth: '1rem',
                      maxWidth: '2.5rem',
                      height: '100%',
                      fontSize: 'calc(var(--answer-container-width) * 20   / var(--word-length))',
                      '--word-length': levelData.targetWord.length
                    } as React.CSSProperties}
                  >
                    {index < gameState.currentWord.length ? gameState.currentWord[index] : '\u00A0'}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 sm:mt-4">
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
      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-6 min-w-[320px]">
            <div className="text-2xl font-bold text-green-700">Congratulations! You found the word {levelData.targetWord}!</div>
            <div className="flex gap-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => router.push('/')}
              >
                Home
              </button>
              {currentLevel < 20 && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    setShowCompleteModal(false);
                    router.push(`/play/${currentLevel + 1}`);
                  }}
                >
                  Next Level
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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