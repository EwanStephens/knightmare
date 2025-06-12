// This server component loads puzzle data and passes it to the client-side PuzzleClient.
// Desired behavior: Daily puzzles should transition at midnight LOCAL TIME for the client (user's browser),
// not the server's timezone. All date logic and daily puzzle gating is handled in PuzzleClient.tsx.

import PuzzleClient from './PuzzleClient';
import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import { getDateForPuzzleId, getDailyPuzzlesForDate, getPuzzleTypeForId } from '@/utils/calendar';
import { createEmptyBoard } from '@/utils/board';
import { algebraicToPosition } from '@/utils/chess';
import { LoadedLevel } from '@/types/level';
import { ChessPiece } from '@/types/chess';
import { getUnusedHintSquares, getFirstLetterHintSquare, getRevealAnswerPath } from '@/utils/hints';

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
  const daily = puzzleDate ? getDailyPuzzlesForDate(puzzleDate) : null;

  // Prepare props for ChessBoard
  const targetWord = puzzleData.targetWords[0];
  let congratsMessage = `Congratulations!`;

  // If this is the long puzzle for the day, add extra congrats
  if (daily && puzzleType === 'long') {
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

  // Determine nextPuzzleId based on puzzleType
  let nextPuzzleId: string | null = null;
  if (daily && puzzleType) {
    if (puzzleType === 'short') nextPuzzleId = daily.medium;
    else if (puzzleType === 'medium') nextPuzzleId = daily.long;
    else nextPuzzleId = null;
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
      dailyPuzzleIds={daily}
    />
  );
} 