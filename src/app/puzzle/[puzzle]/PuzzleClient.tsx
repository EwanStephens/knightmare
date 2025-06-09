// This client component handles all date logic for daily puzzles.
// Desired behavior: Daily puzzles should transition at midnight LOCAL TIME for the user (browser),
// not the server's timezone. All date logic and daily puzzle gating is handled here for this reason.

"use client";

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChessBoard from '@/components/ChessBoard';
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
  dailyPuzzleIds,
}: PuzzleClientProps) {
  const router = useRouter();
  
  // Use a single Date instance for both todayStr and the log
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => today.toLocaleDateString('en-CA'), [today]);
  console.log('[PuzzleClient] todayStr:', todayStr, '| local datetime:', today.toString());

  // Get daily puzzles and solved status for tabs
  const dailyPuzzles = useMemo(() => {
    if (!puzzleDate) return null;
    return dailyPuzzleIds;
  }, [puzzleDate, dailyPuzzleIds]);

  const solvedPuzzleIds = useMemo(() => getSolvedPuzzleIds(), []);

  // Use state to track if we're on the client to avoid hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine header and if this puzzle is from the future
  let header = 'Puzzle';
  let isFuture = false;
  if (puzzleDate) {
    if (puzzleDate === todayStr) {
      header = 'Daily Puzzle';
    } else if (puzzleDate < todayStr) {
      header = formatDateHeader(puzzleDate);
    } else {
      isFuture = true;
    }
  }

  // Determine which tabs should be available - only show correct state after client mount
  const showTabs = dailyPuzzles && puzzleType;
  const isShortSolved = isClient && dailyPuzzles ? solvedPuzzleIds.has(dailyPuzzles.short) : false;
  const isMediumSolved = isClient && dailyPuzzles ? solvedPuzzleIds.has(dailyPuzzles.medium) : false;
  const isLongSolved = isClient && dailyPuzzles ? solvedPuzzleIds.has(dailyPuzzles.long) : false;
  
  const handleTabClick = (tabType: 'short' | 'medium' | 'long') => {
    if (!dailyPuzzles) return;
    
    // Allow navigation to short always, medium if short is solved, long if medium is solved
    if (tabType === 'short' || 
        (tabType === 'medium' && isShortSolved) || 
        (tabType === 'long' && isMediumSolved)) {
      const targetPuzzleId = dailyPuzzles[tabType];
      router.push(`/puzzle/${targetPuzzleId}`);
    }
  };

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
    <main className="flex-1 w-full flex flex-col items-center justify-center px-2 py-8">
      <h1 className="text-2xl font-bold mb-4 dark:text-white text-center">{header}</h1>
      
      {/* Tabs for daily puzzles */}
      {showTabs && (
        <div className="flex gap-1 mb-6 bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
          <button
            onClick={() => handleTabClick('short')}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              puzzleType === 'short'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : isShortSolved
                ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Short {isShortSolved ? '✓' : ''}
          </button>
          
          <button
            onClick={() => handleTabClick('medium')}
            disabled={!isShortSolved}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              puzzleType === 'medium'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : isShortSolved
                ? isMediumSolved
                  ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Medium {isMediumSolved ? '✓' : ''}
          </button>
          
          <button
            onClick={() => handleTabClick('long')}
            disabled={!isMediumSolved}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              puzzleType === 'long'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : isMediumSolved
                ? isLongSolved
                  ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Long {isLongSolved ? '✓' : ''}
          </button>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
        <ChessBoard
          levelData={levelData}
          nextPuzzleId={nextPuzzleId}
          congratsMessage={congratsMessage}
          puzzleId={puzzleId}
          isDailyPuzzle={!!puzzleDate}
          puzzleType={puzzleType}
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