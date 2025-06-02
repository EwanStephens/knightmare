'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isTutorialCompleted, markTutorialSkipped } from '@/utils/gameState';

export default function Home() {
  const router = useRouter();
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);
  
  // Check if tutorial should be shown on first load
  useEffect(() => {
    if (!isTutorialCompleted()) {
      setShowTutorialPrompt(true);
    }
  }, []);

  const handleSkipTutorial = () => {
    markTutorialSkipped();
    setShowTutorialPrompt(false);
  };

  const handleStartTutorial = () => {
    router.push('/tutorial/1');
  };
  
  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-center">SpellCheck</h1>
      
      {showTutorialPrompt ? (
        <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg flex flex-col gap-4 items-center">
          <h2 className="text-2xl font-semibold mb-2 dark:text-white">Would you like to try the tutorial?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">Learn how to play SpellCheck with our guided tutorial.</p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 w-64"
            onClick={handleStartTutorial}
          >
            Start Tutorial
          </button>
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg text-xl font-semibold hover:bg-green-700 w-64"
            onClick={handleSkipTutorial}
          >
            Skip Tutorial
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg flex flex-col gap-4 items-center">
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg text-xl font-semibold hover:bg-green-700 w-64"
            onClick={() => router.push('/play/daily')}
          >
            Daily
          </button>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 w-64"
            onClick={() => router.push('/tutorial')}
          >
            Tutorial
          </button>
        </div>
      )}
    </main>
  );
}
