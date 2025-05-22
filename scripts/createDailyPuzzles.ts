import { createLevelWithWordLength } from './create_level';
import { getNumUnusedWords } from '../src/utils/wordbankManager';
import fs from 'fs/promises';
import path from 'path';

const MAX_TOTAL_LETTERS = 22;
const MAX_RETRIES = 10;

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month, day));
}

function formatDate(date: Date): string {
  // Format as YYYY-MM-DD in UTC
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth()).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function randomWeightedChoice<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (r < weights[i]) return items[i];
    r -= weights[i];
  }
  return items[items.length - 1];
}

async function pickWordLength(options: number[]): Promise<number> {
  const counts = await Promise.all(options.map(getNumUnusedWords));
  if (counts.every(c => c === 0)) throw new Error('No unused words available for any length');
  return randomWeightedChoice(options, counts);
}

function getExtraLetters(wordLength: number): number {
  // Add variability, more for longer words
  let base: number;
  let variability: number;
  if (wordLength === 5) { base = 4; variability = 1; }
  else if (wordLength === 6) { base = 3; variability = 1; }
  else if (wordLength === 7) { base = 6; variability = 2; }
  else if (wordLength === 8) { base = 5; variability = 2; }
  else { base = 6; variability = 3; }
  let extra = base + Math.floor((Math.random() - 0.5) * 2 * variability);
  extra = Math.max(0, extra);
  return extra;
}

async function createAndAssignPuzzle(calendar: any, dateStr: string, type: 'short' | 'medium' | 'long', options: number[]) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const wordLength = await pickWordLength(options);
      let extraLetters = getExtraLetters(wordLength);
      if (wordLength + extraLetters > MAX_TOTAL_LETTERS) extraLetters = MAX_TOTAL_LETTERS - wordLength;
      const result = await createLevelWithWordLength(wordLength, extraLetters);
      if (result.success && result.puzzleId) {
        calendar.dates[dateStr][type] = result.puzzleId;
        calendar.puzzles[String(result.puzzleId)] = { date: dateStr, length: wordLength, type };
        return;
      }
      console.warn(`[DailyPuzzles] Attempt ${attempt} failed for ${type} puzzle on ${dateStr}. Error: ${result.error}`);
    } catch (e) {
      console.warn(`[DailyPuzzles] Attempt ${attempt} error for ${type} puzzle on ${dateStr}:`, e);
    }
  }
  throw new Error(`Failed to create ${type} puzzle for ${dateStr} after ${MAX_RETRIES} attempts`);
}

async function main() {
  const [,, startDateStr, endDateStr] = process.argv;
  // if (!startDateStr || !endDateStr) {
  //   console.error('Usage: npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/createDailyPuzzles.ts <start-date> <end-date>');
  //   console.error('  <start-date> and <end-date> must be in YYYY-MM-DD format.');
  //   console.error('  Example: npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/createDailyPuzzles.ts 2025-06-01 2025-06-01');
  //   process.exit(1);
  // }
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);
  // const calendarPath = path.join(__dirname, '../src/data/calendar/calendar.json');
  // let calendar = { dates: {} as Record<string, any>, puzzles: {} as Record<string, any> };
  // try {
  //   const content = await fs.readFile(calendarPath, 'utf-8');
  //   calendar = JSON.parse(content);
  // } catch (e) {
  //   // File may not exist, start fresh
  //   calendar = { dates: {} as Record<string, any>, puzzles: {} as Record<string, any> };
  // }

  console.log(formatDate(startDate));

  for (
    let d = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    d <= endDate;
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
  ) {
    const dateStr = formatDate(d);
    console.log(`[DailyPuzzles] Creating puzzles for ${dateStr}`);
    // if (!calendar.dates[dateStr]) calendar.dates[dateStr] = {};
    // await createAndAssignPuzzle(calendar, dateStr, 'short', [5, 6]);
    // await createAndAssignPuzzle(calendar, dateStr, 'medium', [7, 8]);
    // await createAndAssignPuzzle(calendar, dateStr, 'long', [9, 10, 11, 12, 13, 14, 15]);
    // await fs.mkdir(path.dirname(calendarPath), { recursive: true });
    // await fs.writeFile(calendarPath, JSON.stringify(calendar, null, 2), 'utf-8');
    // console.log(`[DailyPuzzles] Created puzzles for ${dateStr}: short=${calendar.dates[dateStr].short}, medium=${calendar.dates[dateStr].medium}, long=${calendar.dates[dateStr].long}`);
  }
}

if (require.main === module) {
  main();
} 