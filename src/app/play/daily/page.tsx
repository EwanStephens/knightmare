"use client";

import { useEffect } from 'react';
import { getDailyPuzzlesForDate } from '@/utils/calendar';
import { getDailyPuzzleProgress } from '@/utils/gameState';
import { useRouter } from 'next/navigation';

function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export default function DailyRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    const today = getTodayString();
    const puzzles = getDailyPuzzlesForDate(today);
    if (!puzzles) {
      router.replace('/');
      return;
    }
    const progress = getDailyPuzzleProgress(today);
    let target = puzzles.short;
    if (progress.short) {
      target = puzzles.medium;
      if (progress.medium) {
        target = puzzles.long;
      }
    }
    if (progress.short && progress.medium && progress.long) {
      // All done, go to long for congrats
      target = puzzles.long;
    }
    router.replace(`/puzzle/${target}`);
  }, [router]);
  return <div className="min-h-screen flex items-center justify-center">Redirecting to your daily puzzle...</div>;
} 