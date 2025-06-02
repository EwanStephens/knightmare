// This client component handles all date logic for daily puzzles.
// Desired behavior: Daily puzzles should transition at midnight LOCAL TIME for the user (browser),
// not the server's timezone. All date logic and daily puzzle gating is handled here for this reason.

"use client";

import { useMemo } from 'react';
import ChessBoard from '@/components/ChessBoard';
import type { LoadedLevel } from '@/types/level';

// Props for PuzzleClient, matching what the server passes
interface PuzzleClientProps {
  puzzleId: string;
  puzzleDate: string | null;
  puzzleType: 'short' | 'medium' | 'long' | null;
  levelData: LoadedLevel;
  nextPuzzleId: string | null;
  congratsMessage: string;
  hintSquares: string[] | null;
  firstLetterSquare: string | null;
  revealPath: string[] | null;
}

// Helper to format date header
function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

/**
 * Client-side component for puzzle page.
 *
 * All date logic and header rendering is done here, using the user's local time.
 * This avoids timezone bugs that occur if the server and client are in different timezones.
 *
 * If the puzzle is from the future (relative to the user's local time), shows a 'time traveler' message.
 * Otherwise, renders the ChessBoard with the correct header and props.
 */
export default function PuzzleClient({
  puzzleId,
  puzzleDate,
  puzzleType,
  levelData,
  nextPuzzleId,
  congratsMessage,
  hintSquares,
  firstLetterSquare,
  revealPath,
}: PuzzleClientProps) {
  // Use a single Date instance for both todayStr and the log
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toLocaleDateString('en-CA'), [today]);
  console.log('[PuzzleClient] todayStr:', todayStr, '| local datetime:', today.toString());

  // Determine header and if this puzzle is from the future
  let header = 'Puzzle';
  let isFuture = false;
  if (puzzleDate) {
    if (puzzleDate === todayStr) {
      header = `Daily Puzzle${puzzleType ? ' – ' + puzzleType.charAt(0).toUpperCase() + puzzleType.slice(1) : ''}`;
    } else if (puzzleDate < todayStr) {
      header = `${formatDateHeader(puzzleDate)}${puzzleType ? ' – ' + puzzleType.charAt(0).toUpperCase() + puzzleType.slice(1) : ''}`;
    } else {
      isFuture = true;
    }
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

  return (
    <main className="flex flex-col items-center w-full mx-auto px-2 sm:px-0">
      <h1 className="text-2xl font-bold mb-4 dark:text-white text-center">{header}</h1>
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