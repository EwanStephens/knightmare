import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import { getDateForPuzzleId, getDailyPuzzlesForDate, getPuzzleTypeForId } from '@/utils/calendar';
import ChessBoard from '@/components/ChessBoard';
import { createEmptyBoard } from '@/utils/board';
import { algebraicToPosition } from '@/utils/chess';
import { LoadedLevel } from '@/types/level';
import { ChessPiece } from '@/types/chess';
import { getUnusedHintSquares, getFirstLetterHintSquare, getRevealAnswerPath } from '@/utils/hints';

function getPuzzlePathFromId(id: string): string {
  const [wordLength] = id.split('-');
  return path.join(process.cwd(), 'src', 'puzzles', `${wordLength}_letter`, `puzzle_${id}.json`);
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

export default async function PuzzlePage({ params }: { params: Promise<{ puzzle: string }> }) {
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
    // If hints fail, just don't show them
    hintSquares = null;
    firstLetterSquare = null;
    revealPath = null;
  }

  // Find the next puzzle in the daily sequence (if any)
  const puzzleDate = getDateForPuzzleId(puzzleId);
  const puzzleType = getPuzzleTypeForId(puzzleId);
  const todayStr = new Date().toISOString().slice(0, 10);

  let header = '';
  let isFuture = false;
  if (puzzleDate) {
    if (puzzleDate === todayStr) {
      header = `Daily Puzzle${puzzleType ? ' – ' + puzzleType.charAt(0).toUpperCase() + puzzleType.slice(1) : ''}`;
    } else if (puzzleDate < todayStr) {
      header = `${formatDateHeader(puzzleDate)}${puzzleType ? ' – ' + puzzleType.charAt(0).toUpperCase() + puzzleType.slice(1) : ''}`;
    } else {
      isFuture = true;
    }
  } else {
    header = 'Puzzle';
  }

  if (isFuture) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">This puzzle is from the future!</h1>
        <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg text-lg text-center">
          <p>Whoa there, time traveler. This puzzle hasn&apos;t been released yet. Please be patient and try again on the correct day. The chessboard of destiny awaits, but not just yet.</p>
        </div>
      </main>
    );
  }

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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">{header}</h1>
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
        <ChessBoard
          levelData={levelData}
          nextPuzzleId={nextPuzzleId}
          congratsMessage={congratsMessage}
          puzzleId={puzzleId}
          {...(hintSquares && firstLetterSquare && revealPath ? {
            hintSquares,
            firstLetterSquare,
            revealPath
          } : {})}
        />
      </div>
    </main>
  );
} 