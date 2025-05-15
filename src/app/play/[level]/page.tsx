'use client';

import { useEffect } from 'react';
import ChessBoard from '@/components/ChessBoard';
import { setCurrentLevel } from '@/utils/gameState';
import { useParams } from 'next/navigation';

export default function PlayLevelPage() {
  const params = useParams();
  const level = parseInt(params.level as string, 10);
  
  useEffect(() => {
    // Update current level in localStorage when visiting this page directly
    setCurrentLevel(level);
  }, [level]);
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Level {level}</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <ChessBoard initialLevel={level}/>
      </div>
    </main>
  );
} 