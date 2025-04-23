import { useEffect, useState } from 'react';
import { ChessPiece, GameState, Position, Square } from '@/types/chess';
import { algebraicToPosition, getLegalMoves, positionToAlgebraic, isValidChessCapture } from '@/utils/chess';
import '@/styles/chess.css';

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

// Set up the tutorial level
const tutorialSetup = () => {
  const board = createEmptyBoard();
  
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

// Set up the second level
const secondLevelSetup = () => {
  const board = createEmptyBoard();
  
  // Place the pieces for the second level
  const pieces: [string, ChessPiece][] = [
    ['c4', { type: 'knight', color: 'black', letter: 'C' }],
    ['d2', { type: 'pawn', color: 'white', letter: 'H' }],
    ['c3', { type: 'bishop', color: 'black', letter: 'E' }],
    ['e5', { type: 'queen', color: 'white', letter: 'C' }],
    ['b5', { type: 'knight', color: 'black', letter: 'K' }],
    ['a3', { type: 'knight', color: 'white', letter: 'M' }],
    ['c2', { type: 'rook', color: 'black', letter: 'A' }],
    ['b2', { type: 'knight', color: 'white', letter: 'T' }],
    ['a4', { type: 'rook', color: 'black', letter: 'E' }],
  ];

  pieces.forEach(([position, piece]) => {
    const { row, col } = algebraicToPosition(position);
    board[row][col].piece = piece;
  });

  return board;
};

// Set up the third level
const thirdLevelSetup = () => {
  const board = createEmptyBoard();
  
  // Place the pieces for the third level
  const pieces: [string, ChessPiece][] = [
    ['d2', { type: 'knight', color: 'black', letter: 'I' }],
    ['b3', { type: 'pawn', color: 'white', letter: 'L' }],
    ['c4', { type: 'knight', color: 'black', letter: 'L' }],
    ['b2', { type: 'pawn', color: 'white', letter: 'U' }],
    ['a3', { type: 'knight', color: 'black', letter: 'M' }],
    ['b1', { type: 'pawn', color: 'white', letter: 'I' }],
    ['a2', { type: 'knight', color: 'black', letter: 'N' }],
    ['b4', { type: 'pawn', color: 'white', letter: 'A' }],
    ['c5', { type: 'knight', color: 'black', letter: 'T' }],
    ['d3', { type: 'pawn', color: 'white', letter: 'E' }]
  ];

  pieces.forEach(([position, piece]) => {
    const { row, col } = algebraicToPosition(position);
    board[row][col].piece = piece;
  });

  return board;
};

interface Level {
  board: Square[][];
  targetWord: string;
  congratsMessage: string;
}

const levels: Level[] = [
  {
    board: tutorialSetup(),
    targetWord: 'BOAT',
    congratsMessage: 'Congratulations! You found the word BOAT! Moving to level 2...',
  },
  {
    board: secondLevelSetup(),
    targetWord: 'CHECKMATE',
    congratsMessage: 'Congratulations! You found the word CHECKMATE! Moving to level 3...',
  },
  {
    board: thirdLevelSetup(),
    targetWord: 'ILLUMINATE',
    congratsMessage: 'Congratulations! You found the word ILLUMINATE!',
  },
];

export default function ChessBoard() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    board: levels[0].board,
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

    // If a square is already selected, check if new square is a legal capture
    let newPreviousSquares: string[] = [];
    if (gameState.selectedSquare) {
      const startPos = algebraicToPosition(gameState.selectedSquare);
      const startSquare = gameState.board[startPos.row][startPos.col];
      
      if (!startSquare.piece) {
        setGameState(handleIllegalMove());
        return;
      }

      if (!isValidChessCapture(startSquare.piece, startPos, { row, col }, gameState.board)) {
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
    const legalMoves = getLegalMoves(square.piece!, { row, col }, gameState.board);

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
    const level = levels[currentLevel];
    if (gameState.currentWord === level.targetWord) {
      if (currentLevel < levels.length - 1) {
        // Move to next level
        setTimeout(() => {
          setCurrentLevel(currentLevel + 1);
          setGameState({
            board: levels[currentLevel + 1].board,
            currentWord: '',
            selectedSquare: null,
            previousSquares: [],
            message: '',
          });
        }, 2000);
      }
      setGameState({
        ...gameState,
        message: level.congratsMessage,
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
                ${(rowIndex + colIndex) % 2 === 0 ? 'bg-[#EEEED2]' : 'bg-[#769656]'}
                ${square.piece ? 'hover:bg-opacity-90' : ''}
                ${square.isSelected ? 'ring-2 ring-blue-500' : ''}
                ${square.isLegalMove ? 'ring-2 ring-green-500' : ''}
                ${square.isHighlighted ? 'bg-yellow-200' : ''}
                cursor-pointer
              `}
            >
              {square.piece && (
                <>
                  <div className="relative z-10">
                    {getPieceComponent(square.piece.type, square.piece.color)}
                  </div>
                  <div className={`absolute top-0.5 right-1 text-lg font-bold ${(rowIndex + colIndex) % 2 === 0 ? 'text-[#769656]' : 'text-[#EEEED2]'}`}>
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

function getPieceComponent(type: ChessPiece['type'], color: ChessPiece['color']) {
  const symbols: Record<ChessPiece['type'], string> = {
    pawn: color === 'white' ? 'p' : 'o',
    knight: color === 'white' ? 'n' : 'm',
    bishop: color === 'white' ? 'b' : 'v',
    rook: color === 'white' ? 'r' : 't',
    queen: color === 'white' ? 'q' : 'w',
    king: color === 'white' ? 'k' : 'l',
  };
  return (
    <div style={{ fontFamily: 'Chess7' }} className="text-5xl">
      {symbols[type]}
    </div>
  );
} 