import { useEffect, useState } from 'react';
import { ChessPiece, GameState, Position, Square } from '@/types/chess';
import { algebraicToPosition, getLegalMoves, positionToAlgebraic } from '@/utils/chess';

const initialBoard: Square[][] = Array(5)
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

// Set up the tutorial level
const tutorialSetup = () => {
  const board = JSON.parse(JSON.stringify(initialBoard));
  
  // Place the pieces for the tutorial level
  const pieces: [string, ChessPiece][] = [
    ['a2', { type: 'pawn', color: 'white', letter: 'B' }],
    ['b3', { type: 'knight', color: 'black', letter: 'O' }],
    ['d2', { type: 'bishop', color: 'white', letter: 'A' }],
    ['e1', { type: 'rook', color: 'black', letter: 'T' }],
  ];

  pieces.forEach(([position, piece]) => {
    const { row, col } = algebraicToPosition(position);
    board[row][col].piece = piece;
  });

  return board;
};

export default function ChessBoard() {
  const [gameState, setGameState] = useState<GameState>({
    board: tutorialSetup(),
    currentWord: '',
    selectedSquare: null,
    previousSquares: [],
    message: '',
  });

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
    const { row, col } = algebraicToPosition(position);
    const square = gameState.board[row][col];

    // Helper function for illegal moves
    const handleIllegalMove = () => clearGameBoard('Invalid move!');

    // Must select a square with a piece
    if (!square.piece) {
      setGameState(handleIllegalMove());
      return;
    }

    // If a square is already selected, check if new square is a legal move
    let newPreviousSquares: string[] = [];
    if (gameState.selectedSquare) {
      if (!square.isLegalMove) {
        setGameState(handleIllegalMove());
        return;
      }
      newPreviousSquares = [...gameState.previousSquares, gameState.selectedSquare];
    }

    // Add new letter to word
    const newWord = gameState.currentWord + square.piece.letter;

    // Calculate legal moves from new square
    const legalMoves = getLegalMoves(square.piece, { row, col }, gameState.board);

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

    setGameState({
      ...gameState,
      board: newBoard,
      currentWord: newWord,
      selectedSquare: position,
      previousSquares: newPreviousSquares,
      message: '',
    });
  };

  const handleSubmit = () => {
    if (gameState.currentWord === 'BOAT') {
      setGameState({
        ...gameState,
        message: 'Congratulations! You found the word BOAT!',
        selectedSquare: null,
      });
    } else {
      setGameState(clearGameBoard('Invalid word! Try again.'));
    }
  };

  const handleCancel = () => {
    setGameState(clearGameBoard(''));
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="grid grid-cols-5 gap-1 bg-gray-200 p-2">
        {gameState.board.map((row, rowIndex) =>
          row.map((square, colIndex) => (
            <div
              key={square.position}
              onClick={() => handleSquareClick(square.position)}
              className={`
                w-16 h-16 flex items-center justify-center relative
                ${(rowIndex + colIndex) % 2 === 0 ? 'bg-gray-300' : 'bg-gray-700'}
                ${square.piece ? 'hover:bg-opacity-90' : ''}
                ${square.isSelected ? 'ring-2 ring-blue-500' : ''}
                ${square.isLegalMove ? 'ring-2 ring-green-500' : ''}
                ${square.isHighlighted ? 'bg-yellow-200' : ''}
                cursor-pointer
              `}
            >
              {square.piece && (
                <>
                  <div className={`text-2xl ${square.piece.color === 'white' ? 'text-white' : 'text-black'}`}>
                    {getPieceSymbol(square.piece.type)}
                  </div>
                  <div className={`absolute top-0 right-1 text-sm font-bold ${(rowIndex + colIndex) % 2 === 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                    {square.piece.letter}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-xl font-bold">
          Current Word: {gameState.currentWord}
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Submit
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
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

function getPieceSymbol(type: ChessPiece['type']): string {
  const symbols: Record<ChessPiece['type'], string> = {
    pawn: '♟',
    knight: '♞',
    bishop: '♝',
    rook: '♜',
    queen: '♛',
    king: '♚',
  };
  return symbols[type];
} 