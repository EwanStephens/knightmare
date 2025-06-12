"use client";

import { useEffect } from 'react';
import { getDailyPuzzlesForDate } from '@/utils/calendar';
import { isPuzzleSolved } from '@/utils/gameState';
import { useRouter } from 'next/navigation';

function getTodayString() {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');
  console.log('[DailyRedirectPage] todayStr:', todayStr, '| local datetime:', today.toString());
  return todayStr;
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
    
    let target = puzzles.short;
    if (!isPuzzleSolved(puzzles.short)) {
      target = puzzles.short;
    } else if (!isPuzzleSolved(puzzles.medium)) {
      target = puzzles.medium;
    } else {
      target = puzzles.long;
    }
    router.replace(`/puzzle/${target}`);
  }, [router]);
  return <main className="flex flex-col items-center w-full max-w-md mx-auto px-2 sm:px-0">Redirecting to your daily puzzle...</main>;
} 