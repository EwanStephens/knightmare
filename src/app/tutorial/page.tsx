'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TutorialRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/tutorial/1');
  }, [router]);

  return (
    <main>
      <p className="text-gray-700 dark:text-gray-300">Redirecting to tutorial...</p>
    </main>
  );
} 