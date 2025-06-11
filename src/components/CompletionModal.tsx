'use client';

import { useRouter } from 'next/navigation';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  congratsMessage: string;
  targetWord: string;
}

export default function CompletionModal({
  isOpen,
  onClose,
  congratsMessage,
  targetWord,
}: CompletionModalProps) {
  const router = useRouter();
  
  if (!isOpen) return null;
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-jet-light rounded-lg shadow-lg dark:shadow-gray-700 p-8 flex flex-col items-center gap-6 min-w-[320px] transition-colors duration-200 relative border dark:border-gray-600">
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center"
          aria-label="Close"
        >
          ×
        </button>
        
        <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          {congratsMessage || `Congratulations! You found the word ${targetWord}!`}
        </div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
            onClick={() => router.push('/')}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
} 