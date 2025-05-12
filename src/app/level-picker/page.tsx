'use client';

import { useRouter } from 'next/navigation';

export default function LevelPicker() {
  const router = useRouter();
  const levels = Array.from({ length: 20 }, (_, i) => i + 1);
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Choose a Level</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-wrap gap-4 justify-center">
        {levels.map(level => (
          <button
            key={level}
            className="w-20 h-20 bg-blue-600 text-white text-2xl font-bold rounded-lg hover:bg-blue-700 transition"
            onClick={() => router.push(`/play/${level}`)}
          >
            {level}
          </button>
        ))}
      </div>
    </main>
  );
} 