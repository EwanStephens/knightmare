'use client';

import ChessBoard from '@/components/ChessBoard';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Knightmare</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <ChessBoard />
      </div>
    </main>
  );
}
