// This client component handles all date logic for daily puzzles.
// Desired behavior: Daily puzzles should transition at midnight LOCAL TIME for the user (browser),
// not the server's timezone. All date logic and daily puzzle gating is handled here for this reason.

"use client";

import { useMemo, useState, useEffect } from 'react';
import ChessBoard from '@/components/ChessBoard';
import DailyPuzzleTabs from '@/components/DailyPuzzleTabs';
import { getSolvedPuzzleIds } from '@/utils/gameState';
import type { LoadedLevel } from '@/types/level';
import type { DailyPuzzles } from '@/utils/calendar';

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
  dailyPuzzleIds: DailyPuzzles | null;
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
  dailyPuzzleIds,
}: PuzzleClientProps) {
  
  // Use a single Date instance for both todayStr and the log
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toLocaleDateString('en-CA'), [today]);
  console.log('[PuzzleClient] todayStr:', todayStr, '| local datetime:', today.toString());

  // State for tracking solved puzzles with automatic updates
  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState<Set<string>>(new Set());

  // Use state to track if we're on the client to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // Initialize solved puzzle IDs
    setSolvedPuzzleIds(getSolvedPuzzleIds());
  }, []);

  // Callback to handle puzzle completion and update tabs
  const handlePuzzleCompleted = (completedPuzzleId: string) => {
    setSolvedPuzzleIds(prev => new Set([...prev, completedPuzzleId]));
  };

  // Callback for level completion that handles tab updates for daily puzzles
  const handleLevelComplete = () => {
    if (puzzleId && puzzleDate) {
      // For daily puzzles, update the tabs automatically
      handlePuzzleCompleted(puzzleId);
    }
  };

  // Get daily puzzles
  const dailyPuzzles = useMemo(() => {
    if (!puzzleDate) return null;
    return dailyPuzzleIds;
  }, [puzzleDate, dailyPuzzleIds]);

  // Check if this puzzle is from the future
  let isFuture = false;
  if (puzzleDate) {
    isFuture = puzzleDate > todayStr;
  }

  // Determine which tabs should be available - only show correct state after client mount
  const showTabs = isClient && dailyPuzzles && puzzleType;

  if (isFuture) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-jet">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">This puzzle is from the future!</h1>
        <div className="bg-white dark:bg-jet-light p-8 rounded-lg shadow-lg text-lg text-center">
          <p>Whoa there, time traveler. This puzzle hasn&apos;t been released yet. Please be patient and try again on the correct day. The chessboard of destiny awaits, but not just yet.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center px-2 py-8 bg-white dark:bg-jet">
      {/* Tabs for daily puzzles */}
      {showTabs && (
        <DailyPuzzleTabs
          dailyPuzzles={dailyPuzzles}
          currentPuzzleType={puzzleType}
          solvedPuzzleIds={solvedPuzzleIds}
        />
      )}
      
      <div>
        <ChessBoard
          levelData={levelData}
          nextPuzzleId={nextPuzzleId}
          congratsMessage={congratsMessage}
          puzzleId={puzzleId}
          isDailyPuzzle={!!puzzleDate}
          puzzleType={puzzleType}
          onLevelComplete={handleLevelComplete}
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