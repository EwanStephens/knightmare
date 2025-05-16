'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCompletedLevels, setCurrentLevel } from '@/utils/gameState';

export default function LevelPicker() {
  const router = useRouter();
  const levels = Array.from({ length: 20 }, (_, i) => i + 1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  
  // Load completed levels from localStorage
  useEffect(() => {
    setCompletedLevels(getCompletedLevels());
  }, []);
  
  const handleLevelSelect = (level: number) => {
    // Update current level in localStorage
    setCurrentLevel(level);
    router.push(`/play/${level}`);
  };
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Choose a Level</h1>
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg flex flex-wrap gap-4 justify-center">
        {levels.map(level => {
          const isCompleted = completedLevels.includes(level);
          return (
            <button
              key={level}
              className={`w-20 h-20 text-white text-2xl font-bold rounded-lg transition ${
                isCompleted 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={() => handleLevelSelect(level)}
            >
              {level}
              {isCompleted && (
                <span className="text-sm ml-1">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
} 