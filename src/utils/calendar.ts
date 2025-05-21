import calendarDataRaw from '@/data/calendar/calendar.json';

export interface DailyPuzzles {
  short: string;
  medium: string;
  long: string;
}

interface CalendarDates {
  [date: string]: DailyPuzzles;
}

interface CalendarPuzzleInfo {
  date: string;
  length: number;
  type: 'short' | 'medium' | 'long';
}

interface CalendarPuzzles {
  [puzzleId: string]: CalendarPuzzleInfo;
}

interface CalendarData {
  dates: CalendarDates;
  puzzles: CalendarPuzzles;
}

const calendarData = calendarDataRaw as CalendarData;

export function getDailyPuzzlesForDate(date: string): DailyPuzzles | null {
  return calendarData.dates[date] || null;
}

export function getDateForPuzzleId(puzzleId: string): string | null {
  return calendarData.puzzles[puzzleId]?.date || null;
}

export function getPuzzleTypeForId(puzzleId: string): 'short' | 'medium' | 'long' | null {
  return calendarData.puzzles[puzzleId]?.type || null;
} 