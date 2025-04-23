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
  board: Square[][]
): boolean => {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;
  const targetSquare = board[end.row][end.col];

  // Can't capture same color
  if (targetSquare.piece?.color === piece.color) {
    return false;
  }

  // Must capture a piece of the opposite color
  if (!targetSquare.piece || targetSquare.piece.color === piece.color) {
    return false;
  }

  switch (piece.type) {
    case 'pawn':
      // White pawns move up (negative row diff), black pawns move down (positive row diff)
      const correctDirection = piece.color === 'white' ? rowDiff < 0 : rowDiff > 0;
      // Pawns can only capture diagonally
      return correctDirection && Math.abs(colDiff) === 1 && Math.abs(rowDiff) === 1;

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

export const getLegalMoves = (
  piece: ChessPiece,
  position: Position,
  board: Square[][]
): Position[] => {
  const legalMoves: Position[] = [];

  // Check all squares on the board
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const targetPos = { row, col };
      if (isValidChessMove(piece, position, targetPos, board)) {
        legalMoves.push(targetPos);
      }
    }
  }

  return legalMoves;
}; 