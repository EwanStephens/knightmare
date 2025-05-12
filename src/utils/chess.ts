import { ChessPiece, PieceType, Position, Square } from '@/types/chess';

export const positionToAlgebraic = (row: number, col: number): string => {
  const file = String.fromCharCode(97 + col); // 'a' through 'e'
  const rank = 5 - row; // Convert to 1-5 rank, inverted because array is 0-based from top
  return `${file}${rank}`;
};

export const algebraicToPosition = (position: string): Position => {
  const file = position.charAt(0).toLowerCase();
  const rank = parseInt(position.charAt(1));
  return {
    row: 5 - rank, // Convert from 1-5 rank to 0-4 array index
    col: file.charCodeAt(0) - 97, // Convert 'a' through 'e' to 0-4
  };
};

export const isValidChessMove = (
  piece: ChessPiece,
  start: Position,
  end: Position,
  board: Square[][],
  previousSquares: string[] = []
): boolean => {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;

  // Pieces can't move to their current square
  if (rowDiff === 0 && colDiff === 0) {
    return false;
  }

  // Check if target square is a previously captured square
  const targetPos = positionToAlgebraic(end.row, end.col);
  if (previousSquares.includes(targetPos)) {
    return false;
  }

  // Check if target square has a piece that hasn't been captured
  const targetSquare = board[end.row][end.col];
  if (targetSquare.piece) {
    // Can only move to a square with a piece if it's of the opposite color
    if (targetSquare.piece.color === piece.color) {
      return false;
    }
  }

  switch (piece.type) {
    case 'pawn':
      // White pawns move up (negative row diff), black pawns move down (positive row diff)
      const correctDirection = piece.color === 'white' ? rowDiff < 0 : rowDiff > 0;
      
      // Forward move
      if (colDiff === 0 && Math.abs(rowDiff) === 1) {
        // Forward moves cannot capture
        if (targetSquare.piece) {
          return false;
        }
        return correctDirection;
      }
      
      // Diagonal move (only if there's a piece to capture)
      if (Math.abs(colDiff) === 1 && Math.abs(rowDiff) === 1) {
        // Must have a piece that hasn't been captured and is of opposite color
        if (!targetSquare.piece) {
          return false;
        }
        return correctDirection && targetSquare.piece.color !== piece.color;
      }
      
      return false;

    case 'knight':
      return (
        (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
        (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
      );

    case 'bishop':
      return Math.abs(rowDiff) === Math.abs(colDiff);

    case 'rook':
      return rowDiff === 0 || colDiff === 0;

    case 'queen':
      return (
        rowDiff === 0 ||
        colDiff === 0 ||
        Math.abs(rowDiff) === Math.abs(colDiff)
      );

    case 'king':
      return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;

    default:
      return false;
  }
};

const getSquaresOnPath = (start: Position, end: Position): Position[] => {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;
  const rowStep = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
  const colStep = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;
  
  // For knights, there are no squares in between
  if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1 || 
      Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2) {
    return [];
  }

  const squares: Position[] = [];
  let currentRow = start.row + rowStep;
  let currentCol = start.col + colStep;
  
  while (currentRow !== end.row || currentCol !== end.col) {
    squares.push({ row: currentRow, col: currentCol });
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return squares;
};

const isPathClear = (
  start: Position,
  end: Position,
  board: Square[][],
  previousSquares: string[]
): boolean => {
  const squaresOnPath = getSquaresOnPath(start, end);
  
  return squaresOnPath.every(square => {
    const algebraicPos = positionToAlgebraic(square.row, square.col);
    return !board[square.row][square.col].piece || previousSquares.includes(algebraicPos);
  });
};

export const isValidChessCapture = (
  piece: ChessPiece,
  start: Position,
  end: Position,
  board: Square[][],
  previousSquares: string[] = []
): boolean => {
  const targetSquare = board[end.row][end.col];

  // Must be a valid chess move first
  if (!isValidChessMove(piece, start, end, board, previousSquares)) {
    return false;
  }

  // Must capture a piece of the opposite color
  if (!targetSquare.piece || targetSquare.piece.color === piece.color) {
    return false;
  }

  // For pawns, captures must be diagonal
  if (piece.type === 'pawn') {
    const colDiff = end.col - start.col;
    return Math.abs(colDiff) === 1;
  }

  // Check if the path to the target is clear
  return isPathClear(start, end, board, previousSquares);
};

export const getLegalMoves = (
  piece: ChessPiece,
  position: Position,
  board: Square[][],
  previousSquares: string[] = []
): Position[] => {
  const legalMoves: Position[] = [];

  // Check all squares on the board
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const targetPos = { row, col };
      // Check if it's a valid chess move and the path is clear
      if (isValidChessMove(piece, position, targetPos, board, previousSquares) && 
          isPathClear(position, targetPos, board, previousSquares)) {
        legalMoves.push(targetPos);
      }
    }
  }

  return legalMoves;
}; 