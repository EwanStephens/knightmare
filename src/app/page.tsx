'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Knightmare</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col gap-4 items-center">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 w-64"
          onClick={() => router.push('/play/1')}
        >
          Start
        </button>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-lg text-xl font-semibold hover:bg-green-700 w-64"
          onClick={() => router.push('/level-picker')}
        >
          Choose level
        </button>
        <button
          className="px-6 py-3 bg-gray-400 text-white rounded-lg text-xl font-semibold hover:bg-gray-500 w-64"
          onClick={() => router.push('/tutorial')}
        >
          Tutorial
        </button>
      </div>
    </main>
  );
}
