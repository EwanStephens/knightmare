'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
}: CompletionModalProps) {
  const router = useRouter();
  const [shareTextCopied, setShareTextCopied] = useState(false);
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ daysPlayed: 0, currentStreak: 0, maxStreak: 0 });
  const [dailyResults, setDailyResults] = useState<DailyResults>({});
  const [shareText, setShareText] = useState('');
  
  // Effect to handle stats and streak updates when modal opens
  useEffect(() => {
    if (isOpen && isDailyPuzzle && date && shortPuzzleId && mediumPuzzleId && longPuzzleId && !streakUpdated) {
      // Update streak for today only once when the modal first opens
      updateStreakForDate(date);
      setStreakUpdated(true);
      // Get the latest global stats after streak update
      const stats = getGlobalStats();
      setGlobalStats(stats);
      // Get daily results
      const results = getDailyResultsForPuzzles(shortPuzzleId, mediumPuzzleId, longPuzzleId);
      setDailyResults(results);
      // Generate share text with the updated stats
      const text = generateShareText(date, results);
      setShareText(text);
    } else if (isOpen && !isDailyPuzzle) {
      // For non-daily puzzles, just get the current stats
      const stats = getGlobalStats();
      setGlobalStats(stats);
    }
  }, [isOpen, isDailyPuzzle, date, shortPuzzleId, mediumPuzzleId, longPuzzleId, streakUpdated]);
  
  // Reset streak updated state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStreakUpdated(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
                  <div className="text-2xl font-bold text-spell-blue dark:text-spell-blue-light">{globalStats.daysPlayed}</div>
                  <div className="text-gray-600 dark:text-gray-400">Days Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-spell-blue dark:text-spell-blue-light">{globalStats.currentStreak}</div>
                  <div className="text-gray-600 dark:text-gray-400">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-spell-blue dark:text-spell-blue-light">{globalStats.maxStreak}</div>
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

            {/* Share and Home buttons side by side */}
            <div className="mb-4 flex flex-row gap-4 justify-center">
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-asparagus text-white rounded hover:bg-asparagus-dark transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-lg align-middle"
                  style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24' }}
                >
                  share
                </span>
                {shareTextCopied ? 'Copied!' : 'Share'}
              </button>
              <button
                className="px-4 py-2 bg-spell-blue text-white rounded hover:bg-spell-blue-dark transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
                onClick={() => router.push('/')}
              >
                <span
                  className="material-symbols-outlined text-lg align-middle"
                  style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24' }}
                >
                  home
                </span>
                Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format puzzle result for display
function formatPuzzleResultEmoji(stats: { solved?: boolean; hints?: number; reveal?: boolean } | undefined): string {
  if (!stats) return '❌';
  
  let result = '';
  
  // Add hint emojis
  for (let i = 0; i < (stats.hints || 0); i++) {
    result += '💡';
  }
  
  // Add completion emoji
  if (stats.reveal) {
    result += '👁️';
  } else if (stats.solved) {
    result += '✅';
  }
  
  return result || '❌';
} 