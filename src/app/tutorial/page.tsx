'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TutorialRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/tutorial/1');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Redirecting to tutorial...
    </div>
  );
} 