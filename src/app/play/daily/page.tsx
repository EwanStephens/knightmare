"use client";

import { useEffect } from 'react';
import { getDailyPuzzlesForDate } from '@/utils/calendar';
import { getSolvedPuzzleIds } from '@/utils/gameState';
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
    const solved = getSolvedPuzzleIds();
    let target = puzzles.short;
    if (!solved.has(puzzles.short)) {
      target = puzzles.short;
    } else if (!solved.has(puzzles.medium)) {
      target = puzzles.medium;
    } else if (!solved.has(puzzles.long)) {
      target = puzzles.long;
    } else {
      // All done, go to long for congrats, with modal pre-loaded
      target = `${puzzles.long}?showComplete=1`;
    }
    router.replace(`/puzzle/${target}`);
  }, [router]);
  return <div className="min-h-screen flex items-center justify-center">Redirecting to your daily puzzle...</div>;
} 