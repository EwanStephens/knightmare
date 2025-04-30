import { useEffect, useState } from 'react';
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

export default function ChessBoard() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelData, setLevelData] = useState<LoadedLevel | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentWord: '',
    selectedSquare: null,
    previousSquares: [],
    message: '',
  });

  useEffect(() => {
    const initializeLevel = async () => {
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
  }, [currentLevel]);

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

    // Helper function for illegal moves
    const handleIllegalMove = () => clearGameBoard('Invalid move!');

    // If a square is already selected, check if new square is a legal capture
    let newPreviousSquares: string[] = [];
    if (gameState.selectedSquare) {
      const startPos = algebraicToPosition(gameState.selectedSquare);
      const startSquare = gameState.board[startPos.row][startPos.col];
      
      if (!startSquare.piece) {
        setGameState(handleIllegalMove());
        return;
      }

      if (!isValidChessCapture(startSquare.piece, startPos, { row, col }, gameState.board, gameState.previousSquares)) {
        setGameState(handleIllegalMove());
        return;
      }
      newPreviousSquares = [...gameState.previousSquares, gameState.selectedSquare];
    } else {
      // Must select a square with a piece for the first selection
      if (!square.piece) {
        setGameState(handleIllegalMove());
        return;
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
    if (newWord === levelData.targetWord) {
      message = levelData.congratsMessage;
      // Only advance to next level if not on the last level
      if (currentLevel < 5) {
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
        }, 2000);
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
    setGameState(clearGameBoard(''));
  };

  if (!levelData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="text-2xl font-bold mb-4">
        Find a {levelData.targetWord.length} letter word
      </div>
      <div className="grid grid-cols-5 gap-1 bg-gray-200 p-2">
        {gameState.board.map((row, rowIndex) =>
          row.map((square, colIndex) => (
            <div
              key={square.position}
              onClick={() => handleSquareClick(square.position)}
              className={`
                w-16 h-16 flex items-center justify-center relative
                ${square.isHighlighted ? 'bg-yellow-200' : ''}
                ${square.isSelected ? 'bg-[#94A3B8]' : ''}
                ${!square.isHighlighted && !square.isSelected ? (rowIndex + colIndex) % 2 === 0 ? 'bg-[#EEEED2]' : 'bg-[#769656]' : ''}
                ${square.piece ? 'hover:bg-opacity-90' : ''}
                cursor-pointer
              `}
            >
              {square.isLegalMove && !square.piece && (
                <div className="absolute w-6 h-6 rounded-full bg-[rgba(50,50,50,0.4)]" />
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
                    <div className="text-4xl font-bold text-[#769656]">
                      {square.piece.letter}
                    </div>
                  ) : (
                    <>
                      <div className="relative z-10">
                        {getPieceComponent(square.piece.type, square.piece.color)}
                      </div>
                      <div className={`absolute top-0.5 right-1 text-lg font-bold ${(rowIndex + colIndex) % 2 === 0 ? 'text-[#769656]' : 'text-[#EEEED2]'}`}>
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

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2 text-4xl font-mono">
          {Array.from(levelData.targetWord).map((_, index) => (
            <span key={index} className="w-8 text-center border-b-4 border-gray-400">
              {index < gameState.currentWord.length ? gameState.currentWord[index] : ''}
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        {gameState.message && (
          <div className={`text-lg ${gameState.message.includes('Congratulations') ? 'text-green-600' : 'text-red-600'}`}>
            {gameState.message}
          </div>
        )}
      </div>
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