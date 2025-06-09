import { ChessPiece, Square } from './chess';

export interface LevelPiece extends ChessPiece {
  position: string;
}

export interface Level {
  pieces: LevelPiece[];
  targetWords: string[];
}

export interface LoadedLevel {
  board: Square[][];
  targetWord: string;
  congratsMessage: string;
} 