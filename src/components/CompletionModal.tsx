'use client';

import { useRouter } from 'next/navigation';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  congratsMessage: string;
  targetWord: string;
  currentLevel: number;
  nextPath?: string;
  isTutorial?: boolean;
}

export default function CompletionModal({
  isOpen,
  onClose,
  congratsMessage,
  targetWord,
  currentLevel,
  nextPath,
  isTutorial = false
}: CompletionModalProps) {
  const router = useRouter();
  
  if (!isOpen) return null;
  
  // Determine the next path (either tutorial or regular level)
  const handleNextLevel = () => {
    onClose();
    if (nextPath) {
      router.push(nextPath);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-6 min-w-[320px]">
        <div className="text-2xl font-bold text-green-700">
          {congratsMessage || `Congratulations! You found the word ${targetWord}!`}
        </div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => router.push('/')}
          >
            Home
          </button>
          {isTutorial ? (
            currentLevel < 3 && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleNextLevel}
              >
                Next Level
              </button>
            )
          ) : (
            currentLevel < 20 && (
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleNextLevel}
              >
                Next Level
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
} 