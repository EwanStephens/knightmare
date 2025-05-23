import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import { getDateForPuzzleId, getDailyPuzzlesForDate, getPuzzleTypeForId } from '@/utils/calendar';
import { createEmptyBoard } from '@/utils/board';
import { algebraicToPosition } from '@/utils/chess';
import { LoadedLevel } from '@/types/level';
import { ChessPiece } from '@/types/chess';
import { getUnusedHintSquares, getFirstLetterHintSquare, getRevealAnswerPath } from '@/utils/hints';

// Dynamically import the client-side PuzzleClient component
const PuzzleClient = dynamic(() => import('./PuzzleClient'), { ssr: false });

function getPuzzlePathFromId(id: string): string {
  const [wordLength] = id.split('-');
  return path.join(process.cwd(), 'src', 'puzzles', `${wordLength}_letter`, `puzzle_${id}.json`);
}

export default async function PuzzlePage({ params }: { params: Promise<{ puzzle: string }> }) {
  // Server-side: Only load puzzle data and related info, do NOT do any date logic here
  // This avoids timezone bugs due to server/client differences
  const { puzzle: puzzleId } = await params;
  const puzzlePath = getPuzzlePathFromId(puzzleId);
  let puzzleData;
  try {
    puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf-8'));
  } catch {
    notFound();
  }

  // Fetch hint/reveal info
  let hintSquares: string[] | null = null;
  let firstLetterSquare: string | null = null;
  let revealPath: string[] | null = null;
  try {
    hintSquares = await getUnusedHintSquares(puzzleId);
    firstLetterSquare = await getFirstLetterHintSquare(puzzleId);
    revealPath = await getRevealAnswerPath(puzzleId);
  } catch {
    hintSquares = null;
    firstLetterSquare = null;
    revealPath = null;
  }

  // Find the next puzzle in the daily sequence (if any)
  const puzzleDate = getDateForPuzzleId(puzzleId);
  const puzzleType = getPuzzleTypeForId(puzzleId);

  // Prepare props for ChessBoard
  const targetWord = puzzleData.targetWords[0];
  let congratsMessage = `Congratulations! You found the word ${targetWord}!`;
  // If this is today's long puzzle, add extra congrats
  const daily = getDailyPuzzlesForDate(todayStr);
  if (daily && daily.long === puzzleId) {
    congratsMessage += ' You completed all the daily puzzles! See you tomorrow.';
  }

  // Build the board from pieces
  const board = createEmptyBoard();
  puzzleData.pieces.forEach((piece: { position: string; type: string; color: string; letter: string }) => {
    const { position, ...pieceData } = piece;
    const { row, col } = algebraicToPosition(position);
    board[row][col].piece = pieceData as ChessPiece;
  });

  const levelData: LoadedLevel = {
    board,
    targetWord,
    congratsMessage,
  };

  // Find the next puzzle in the daily sequence (if any)
  let nextPuzzleId: string | null = null;
  if (puzzleDate) {
    const daily = getDailyPuzzlesForDate(puzzleDate);
    if (daily) {
      if (daily.short === puzzleId) nextPuzzleId = daily.medium;
      else if (daily.medium === puzzleId) nextPuzzleId = daily.long;
      else nextPuzzleId = null;
    }
  }

  // Pass all loaded data to the client-side PuzzleClient
  // All date logic and header rendering is handled client-side to ensure correct timezone behavior
  return (
    <PuzzleClient
      puzzleId={puzzleId}
      puzzleDate={puzzleDate}
      puzzleType={puzzleType}
      levelData={levelData}
      nextPuzzleId={nextPuzzleId}
      congratsMessage={congratsMessage}
      hintSquares={hintSquares}
      firstLetterSquare={firstLetterSquare}
      revealPath={revealPath}
    />
  );
} 