'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TutorialRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/tutorial/1');
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
      <p className="text-gray-700 dark:text-gray-300">Redirecting to tutorial...</p>
    </main>
  );
} 