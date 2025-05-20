import { getPotentialEmptyCaptureSquares, positionToAlgebraic, algebraicToPosition } from './chess';
import { ChessPiece, Square } from '@/types/chess';

describe('getPotentialEmptyCaptureSquares', () => {
  function makeBoard(pieces: { pos: string, piece: ChessPiece }[]): Square[][] {
    // Create empty 5x5 board
    const board: Square[][] = [];
    for (let row = 0; row < 5; row++) {
      const rowArr: Square[] = [];
      for (let col = 0; col < 5; col++) {
        rowArr.push({
          piece: null,
          position: positionToAlgebraic(row, col),
          isHighlighted: false,
          isSelected: false,
          isLegalMove: false,
        });
      }
      board.push(rowArr);
    }
    for (const { pos, piece } of pieces) {
      const { row, col } = algebraicToPosition(pos);
      board[row][col].piece = piece;
    }
    return board;
  }

  it('white pawn at b2 returns empty a3 and c3 as potential capture squares', () => {
    const board = makeBoard([
      { pos: 'b2', piece: { type: 'pawn', color: 'white', letter: 'P' } },
    ]);
    const pawnPos = algebraicToPosition('b2');
    const pawn = board[pawnPos.row][pawnPos.col].piece!;
    const potentials = getPotentialEmptyCaptureSquares(pawn, pawnPos, board, []);
    const algs = potentials.map(p => positionToAlgebraic(p.row, p.col));
    expect(algs).toContain('a3');
    expect(algs).toContain('c3');
    expect(algs.length).toBe(2);
  });

  it('white pawn at b2 with a3 occupied returns only c3 if c3 is empty', () => {
    const board = makeBoard([
      { pos: 'b2', piece: { type: 'pawn', color: 'white', letter: 'P' } },
      { pos: 'a3', piece: { type: 'rook', color: 'black', letter: 'R' } },
    ]);
    const pawnPos = algebraicToPosition('b2');
    const pawn = board[pawnPos.row][pawnPos.col].piece!;
    const potentials = getPotentialEmptyCaptureSquares(pawn, pawnPos, board, []);
    const algs = potentials.map(p => positionToAlgebraic(p.row, p.col));
    expect(algs).toContain('c3');
    expect(algs).not.toContain('a3');
    expect(algs.length).toBe(1);
  });

  it('non-pawn piece returns empty squares from getLegalMoves', () => {
    const board = makeBoard([
      { pos: 'c3', piece: { type: 'knight', color: 'white', letter: 'N' } },
      { pos: 'b5', piece: { type: 'rook', color: 'black', letter: 'R' } },
      { pos: 'd5', piece: { type: 'bishop', color: 'black', letter: 'B' } },
    ]);
    const knightPos = algebraicToPosition('c3');
    const knight = board[knightPos.row][knightPos.col].piece!;
    const potentials = getPotentialEmptyCaptureSquares(knight, knightPos, board, []);
    // Should include all empty squares a knight can move to
    const algs = potentials.map(p => positionToAlgebraic(p.row, p.col));
    expect(algs).toContain('a2'); // example empty square
    expect(algs).not.toContain('b5'); // occupied by black
    expect(algs).not.toContain('d5'); // occupied by black
  });
}); 