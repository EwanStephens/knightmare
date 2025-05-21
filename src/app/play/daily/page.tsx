import { getDailyPuzzlesForDate } from '@/utils/calendar';
import { redirect } from 'next/navigation';

function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export default function DailyRedirectPage() {
  const today = getTodayString();
  const puzzles = getDailyPuzzlesForDate(today);
  if (!puzzles || !puzzles.short) {
    // Optionally render a fallback or error page
    return <div className="min-h-screen flex items-center justify-center">No daily puzzle found for today.</div>;
  }
  redirect(`/puzzle/${puzzles.short}`);
} 