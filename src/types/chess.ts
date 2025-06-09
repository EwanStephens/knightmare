export type PieceColor = 'white' | 'black';

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  letter: string;
}

export interface Square {
  piece: ChessPiece | null;
  position: string; // e.g., 'a1', 'b2', etc.
  isHighlighted: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
}

export interface GameState {
  board: Square[][];
  currentWord: string;
  selectedSquare: string | null;
  previousSquares: string[];
}

export type Position = {
  row: number;
  col: number;
}; 