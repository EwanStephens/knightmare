import { ChessPiece, PieceType, Position, Square } from '../types/chess';
import { positionToAlgebraic, getSquaresOnPath, getPotentialEmptyCaptureSquares, getLegalCaptures } from '../utils/chess';
import { randomWeightedLetter } from '../utils/letterFrequency';

const PIECE_TYPES: PieceType[] = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
const PIECE_COLORS: ('white' | 'black')[] = ['white', 'black'];

function randomPieceType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

function oppositePieceColor(color: 'white' | 'black'): 'white' | 'black' {
  return color === 'white' ? 'black' : 'white';
}

function randomBoardPosition(): Position {
  return { row: Math.floor(Math.random() * 5), col: Math.floor(Math.random() * 5) };
}

function createEmptyBoard(): Square[][] {
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
  return board;
}

function dumpBoard(board: Square[][]): string {
  let out = '';
  for (let row = 0; row < 5; row++) {
    let line = '';
    for (let col = 0; col < 5; col++) {
      const sq = board[row][col];
      if (sq.piece) {
        line += `${sq.piece.letter}${sq.piece.type[0].toUpperCase()}${sq.piece.color[0].toUpperCase()} `;
      } else {
        line += ' .  ';
      }
    }
    out += line.trimEnd() + '\n';
  }
  return out;
}

export interface GeneratedBoardResult {
  board: Square[][];
  targetPath: string[]; // algebraic positions in order for the target word
  legalCaptures: Record<string, number>; // position -> number of legal captures
}

export async function generateBoard(targetWord: string, extraLetters: number): Promise<GeneratedBoardResult> {
  let attempts = 0;
  while (attempts < 10) {
    attempts++;
    console.log(`[BoardGenerator] Attempt ${attempts} to generate board for word: ${targetWord}`);
    const board = createEmptyBoard();
    const previousSquares: string[] = [];
    const targetPath: string[] = [];
    let success = true;

    // 1. Pick a random starting square
    const start: Position = randomBoardPosition();
    const startSquare = board[start.row][start.col];
    const startPieceType = randomPieceType();
    const startColor: 'white' | 'black' = PIECE_COLORS[Math.floor(Math.random() * 2)];
    startSquare.piece = {
      type: startPieceType,
      color: startColor,
      letter: targetWord[0].toUpperCase(),
    };
    previousSquares.push(startSquare.position);
    targetPath.push(startSquare.position);

    let currentPos = start;
    let currentColor = startColor;

    for (let i = 1; i < targetWord.length; i++) {
      // 2. Find legal moves for current piece
      const currentPiece = board[currentPos.row][currentPos.col].piece!;
      const legalMoves = getPotentialEmptyCaptureSquares(
        currentPiece,
        currentPos,
        board,
        previousSquares
      ).filter(pos => {
        const posAlg = positionToAlgebraic(pos.row, pos.col);
        return !previousSquares.includes(posAlg);
      });
      if (legalMoves.length === 0) {
        console.warn(`[BoardGenerator] No legal moves for piece at ${positionToAlgebraic(currentPos.row, currentPos.col)}. Restarting...`);
        console.log('[BoardGenerator] Current board state:\n' + dumpBoard(board));
        success = false;
        break;
      }
      // 3. Pick a random legal move
      const nextPos = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      // 4. If bishop/rook/queen, add squares on path
      if (['bishop', 'rook', 'queen'].includes(currentPiece.type)) {
        const onPath = getSquaresOnPath(currentPos, nextPos);
        for (const sq of onPath) {
          const sqAlg = positionToAlgebraic(sq.row, sq.col);
          if (!previousSquares.includes(sqAlg)) previousSquares.push(sqAlg);
        }
      }
      // 5. Find a piece of the opposite color with at least one legal move
      const nextColor = oppositePieceColor(currentColor);
      let foundPiece = false;
      let nextPiece: ChessPiece | null = null;
      const pieceTypesShuffled = PIECE_TYPES.slice().sort(() => Math.random() - 0.5);
      for (const pt of pieceTypesShuffled) {
        const candidate: ChessPiece = {
          type: pt,
          color: nextColor,
          letter: targetWord[i].toUpperCase(),
        };
        // Temporarily place the piece
        board[nextPos.row][nextPos.col].piece = candidate;
        const moves = getPotentialEmptyCaptureSquares(candidate, nextPos, board, previousSquares);
        // Remove the piece after checking
        board[nextPos.row][nextPos.col].piece = null;
        if (moves.length > 0) {
          nextPiece = candidate;
          foundPiece = true;
          break;
        }
      }
      if (!foundPiece) {
        console.warn(`[BoardGenerator] No valid piece for next square at ${positionToAlgebraic(nextPos.row, nextPos.col)} after trying all types. Restarting...`);
        console.log('[BoardGenerator] Current board state:\n' + dumpBoard(board));
        success = false;
        break;
      }
      // 6. Place the piece and update state
      board[nextPos.row][nextPos.col].piece = nextPiece;
      previousSquares.push(positionToAlgebraic(nextPos.row, nextPos.col));
      targetPath.push(positionToAlgebraic(nextPos.row, nextPos.col));
      currentPos = nextPos;
      currentColor = nextColor;
    }
    if (!success) continue;

    // 7. Fill in extra letters
    let emptySquares: Position[] = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const alg = positionToAlgebraic(row, col);
        if (!previousSquares.includes(alg)) {
          emptySquares.push({ row, col });
        }
      }
    }
    // Shuffle and pick extraLetters
    emptySquares = emptySquares.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(extraLetters, emptySquares.length); i++) {
      const pos = emptySquares[i];
      const pieceType = randomPieceType();
      const color = PIECE_COLORS[Math.floor(Math.random() * 2)];
      const letter = randomWeightedLetter();
      board[pos.row][pos.col].piece = {
        type: pieceType,
        color,
        letter,
      };
    }
    console.log('[BoardGenerator] Board successfully generated.');
    console.log('[BoardGenerator] Final board state:\n' + dumpBoard(board));
    // Calculate legal captures for each square with a piece
    const legalCaptures: Record<string, number> = {};
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const sq = board[row][col];
        if (sq.piece) {
          const captures = getLegalCaptures(
            sq.piece,
            { row, col },
            board,
            []
          );
          legalCaptures[sq.position] = captures.length;
        }
      }
    }
    // Log the target path
    console.log('[BoardGenerator] Target path:', targetPath.join(' -> '));
    // Log the number of legal captures for each square
    console.log('[BoardGenerator] Legal captures per square:');
    Object.entries(legalCaptures).forEach(([pos, count]) => {
      console.log(`  ${pos}: ${count}`);
    });

    return {
      board,
      targetPath,
      legalCaptures,
    };
  }
  throw new Error('[BoardGenerator] Failed to generate a valid board after 10 attempts.');
} 