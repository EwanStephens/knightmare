'use client';

import { TutorialProvider } from '@/contexts/TutorialContext';
import TutorialChessBoard from '@/components/TutorialChessBoard';
import TutorialModal from '@/components/TutorialModal';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TutorialLevelPage() {
  const router = useRouter();
  const params = useParams();
  const levelParam = params?.level as string;
  const levelNumber = parseInt(levelParam, 10);
  const [isValidLevel, setIsValidLevel] = useState(true);

  // Validate level number
  useEffect(() => {
    if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 3) {
      setIsValidLevel(false);
      router.push('/tutorial/1'); // Redirect to first tutorial level if invalid
    }
  }, [levelNumber, router]);

  if (!isValidLevel) {
    return <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800"><p className="dark:text-white">Redirecting...</p></main>;
  }

  return (
    <TutorialProvider initialLevel={levelNumber}>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Spell Check Tutorial</h1>
        <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <TutorialChessBoard />
        </div>
        <TutorialModal />
      </main>
    </TutorialProvider>
  );
} 