'use client';

import { TutorialProvider } from '@/contexts/TutorialContext';
import TutorialChessBoard from '@/components/TutorialChessBoard';
import TutorialModal from '@/components/TutorialModal';

export default function Tutorial() {
  return (
    <TutorialProvider>
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