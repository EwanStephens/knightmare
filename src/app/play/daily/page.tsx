import { getDailyPuzzlesForDate, DailyPuzzles } from '@/utils/calendar';
import DailyPuzzleClient from './DailyPuzzleClient';

function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

export default function DailyPuzzlePage() {
  const today = getTodayString();
  const puzzles: DailyPuzzles | null = getDailyPuzzlesForDate(today);
  return <DailyPuzzleClient puzzles={puzzles} date={today} />;
} 