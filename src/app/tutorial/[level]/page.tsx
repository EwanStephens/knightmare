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
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <TutorialProvider initialLevel={levelNumber}>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-8">Knightmare Tutorial</h1>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <TutorialChessBoard />
        </div>
        <TutorialModal />
      </main>
    </TutorialProvider>
  );
} 