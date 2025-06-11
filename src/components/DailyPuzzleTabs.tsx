'use client';

import { useRouter } from 'next/navigation';
import type { DailyPuzzles } from '@/utils/calendar';

interface DailyPuzzleTabsProps {
  dailyPuzzles: DailyPuzzles;
  currentPuzzleType: 'short' | 'medium' | 'long';
  solvedPuzzleIds: Set<string>;
}

export default function DailyPuzzleTabs({
  dailyPuzzles,
  currentPuzzleType,
  solvedPuzzleIds
}: DailyPuzzleTabsProps) {
  const router = useRouter();

  const isShortSolved = solvedPuzzleIds.has(dailyPuzzles.short);
  const isMediumSolved = solvedPuzzleIds.has(dailyPuzzles.medium);
  const isLongSolved = solvedPuzzleIds.has(dailyPuzzles.long);

  const handleTabClick = (tabType: 'short' | 'medium' | 'long') => {
    // Allow navigation to short always, medium if short is solved, long if medium is solved
    if (tabType === 'short' || 
        (tabType === 'medium' && isShortSolved) || 
        (tabType === 'long' && isMediumSolved)) {
      const targetPuzzleId = dailyPuzzles[tabType];
      router.push(`/puzzle/${targetPuzzleId}`);
    }
  };

  return (
    <div className="flex gap-1 mb-6 bg-cream dark:bg-jet-light rounded-lg p-1">
      <button
        onClick={() => handleTabClick('short')}
        className={`px-4 py-2 rounded-md font-bold transition-colors duration-200 ${
          currentPuzzleType === 'short'
            ? 'bg-white dark:bg-jet text-gray-900 dark:text-white shadow-sm'
            : isShortSolved
            ? 'text-asparagus dark:text-asparagus hover:text-asparagus-dark dark:hover:text-asparagus-dark'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Short {isShortSolved ? '✓' : ''}
      </button>
      
      <button
        onClick={() => handleTabClick('medium')}
        disabled={!isShortSolved}
        className={`px-4 py-2 rounded-md font-bold transition-colors duration-200 ${
          currentPuzzleType === 'medium'
            ? 'bg-white dark:bg-jet text-gray-900 dark:text-white shadow-sm'
            : isShortSolved
            ? isMediumSolved
              ? 'text-asparagus dark:text-asparagus hover:text-asparagus-dark dark:hover:text-asparagus-dark'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }`}
      >
        Medium {isMediumSolved ? '✓' : ''}
      </button>
      
      <button
        onClick={() => handleTabClick('long')}
        disabled={!isMediumSolved}
        className={`px-4 py-2 rounded-md font-bold transition-colors duration-200 ${
          currentPuzzleType === 'long'
            ? 'bg-white dark:bg-jet text-gray-900 dark:text-white shadow-sm'
            : isMediumSolved
            ? isLongSolved
              ? 'text-asparagus dark:text-asparagus hover:text-asparagus-dark dark:hover:text-asparagus-dark'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }`}
      >
        Long {isLongSolved ? '✓' : ''}
      </button>
    </div>
  );
} 