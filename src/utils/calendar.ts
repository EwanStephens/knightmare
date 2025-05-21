import calendarData from '@/data/calendar/calendar.json';

export interface DailyPuzzles {
  short: string;
  medium: string;
  long: string;
}

interface CalendarPuzzleInfo {
  date: string;
  length: number;
  type: 'short' | 'medium' | 'long';
}

interface CalendarData {
  dates: { [date: string]: DailyPuzzles };
  puzzles: { [puzzleId: string]: CalendarPuzzleInfo };
}

export function getDailyPuzzlesForDate(date: string): DailyPuzzles | null {
  return (calendarData as CalendarData).dates[date] || null;
}

export function getDateForPuzzleId(puzzleId: string): string | null {
  return (calendarData as CalendarData).puzzles[puzzleId]?.date || null;
}

export function getPuzzleTypeForId(puzzleId: string): 'short' | 'medium' | 'long' | null {
  return (calendarData as CalendarData).puzzles[puzzleId]?.type || null;
} 