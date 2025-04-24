import { Square } from '@/types/chess';
import { positionToAlgebraic } from './chess';

export const createEmptyBoard = (): Square[][] => Array(5)
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