'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  getGlobalStats, 
  getDailyResultsForPuzzles, 
  generateShareText, 
  updateStreakForDate,
  GlobalStats,
  DailyResults 
} from '@/utils/gameState';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  congratsMessage: string;
  isDailyPuzzle?: boolean;
  puzzleType?: 'short' | 'medium' | 'long' | null;
  date?: string;
  shortPuzzleId?: string;
  mediumPuzzleId?: string;
  longPuzzleId?: string;
  nextPath?: string;
}

export default function CompletionModal({
  isOpen,
  onClose,
  congratsMessage,
  isDailyPuzzle = false,
  date,
  shortPuzzleId,
  mediumPuzzleId,
  longPuzzleId,
  nextPath,
}: CompletionModalProps) {
  const router = useRouter();
  const [shareTextCopied, setShareTextCopied] = useState(false);
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Get stats for daily puzzles
  const globalStats: GlobalStats = getGlobalStats();
  let dailyResults: DailyResults = {};
  let shareText = '';

  if (isDailyPuzzle && date && shortPuzzleId && mediumPuzzleId && longPuzzleId) {
    // Update streak for today if this is a daily puzzle completion
    updateStreakForDate(date);
    
    // Get daily results
    dailyResults = getDailyResultsForPuzzles(shortPuzzleId, mediumPuzzleId, longPuzzleId);
    
    // Generate share text
    shareText = generateShareText(date, dailyResults);
  }

  const handleShare = async () => {
    if (!shareText) return;
    
    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: 'SpellCheck Results',
          text: shareText,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        setShareTextCopied(true);
        setTimeout(() => setShareTextCopied(false), 2000);
      }
    } catch (error) {
      // If sharing/clipboard fails, just copy to clipboard as fallback
      try {
        await navigator.clipboard.writeText(shareText);
        setShareTextCopied(true);
        setTimeout(() => setShareTextCopied(false), 2000);
      } catch (clipboardError) {
        console.error('Failed to share or copy to clipboard:', error, clipboardError);
      }
    }
  };

  const handleNextLevel = () => {
    if (nextPath) {
      router.push(nextPath);
    } else {
      router.push('/');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-jet-light rounded-lg modal-shadow dark:text-white p-8 flex flex-col items-center gap-6 min-w-[320px] max-w-[90vw] max-w-md transition-colors duration-200 relative">
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
          aria-label="Close"
        >
          ×
        </button>
        
        <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          {congratsMessage || `Congratulations!`}
        </div>

        {/* Show stats for daily puzzles */}
        {isDailyPuzzle && (
          <div className="w-full">
            {/* Global stats */}
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold mb-3">Your Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-spell-blue">{globalStats.daysPlayed}</div>
                  <div className="text-gray-600 dark:text-gray-400">Days Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-spell-blue">{globalStats.currentStreak}</div>
                  <div className="text-gray-600 dark:text-gray-400">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-spell-blue">{globalStats.maxStreak}</div>
                  <div className="text-gray-600 dark:text-gray-400">Max Streak</div>
                </div>
              </div>
            </div>

            {/* Today's results */}
            <div className="mb-6 text-center">
              <h3 className="text-lg font-semibold mb-3">Today&apos;s Results</h3>
              <div className="flex justify-center gap-4 text-2xl">
                <div className="text-center">
                  <div className="mb-1">{formatPuzzleResultEmoji(dailyResults.short)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Short</div>
                </div>
                <div className="text-center">
                  <div className="mb-1">{formatPuzzleResultEmoji(dailyResults.medium)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Medium</div>
                </div>
                <div className="text-center">
                  <div className="mb-1">{formatPuzzleResultEmoji(dailyResults.long)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Long</div>
                </div>
              </div>
            </div>

            {/* Share button */}
            <div className="mb-4">
              <button
                onClick={handleShare}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 cursor-pointer"
              >
                {shareTextCopied ? 'Copied!' : 'Share Results'}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 w-full">
          <button
            className="flex-1 px-4 py-2 bg-spell-blue text-white rounded hover:bg-spell-blue-dark transition-colors duration-200 cursor-pointer"
            onClick={() => router.push('/')}
          >
            Home
          </button>
          {nextPath && (
            <button
              className="flex-1 px-4 py-2 bg-spell-red text-white rounded hover:bg-spell-red-dark transition-colors duration-200 cursor-pointer"
              onClick={handleNextLevel}
            >
              Next Level
            </button>
          )}
          {isDailyPuzzle && !nextPath && (
            <button
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
              onClick={() => window.location.reload()}
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to format puzzle result for display
function formatPuzzleResultEmoji(stats: { solved?: boolean; hintsUsed?: number; revealUsed?: boolean } | undefined): string {
  if (!stats) return '❌';
  
  let result = '';
  
  // Add hint emojis
  for (let i = 0; i < (stats.hintsUsed || 0); i++) {
    result += '💡';
  }
  
  // Add completion emoji
  if (stats.revealUsed) {
    result += '👁️';
  } else if (stats.solved) {
    result += '✅';
  }
  
  return result || '❌';
} 