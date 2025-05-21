import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import { getDateForPuzzleId, getDailyPuzzlesForDate } from '@/utils/calendar';
import ChessBoard from '@/components/ChessBoard';

function getPuzzlePathFromId(id: string): string {
  const [wordLength] = id.split('-');
  return path.join(process.cwd(), 'src', 'puzzles', `${wordLength}_letter`, `puzzle_${id}.json`);
}

export default function PuzzlePage({ params }: { params: { puzzle: string } }) {
  const puzzleId = params.puzzle;
  const puzzlePath = getPuzzlePathFromId(puzzleId);
  let puzzleData;
  try {
    puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf-8'));
  } catch {
    notFound();
  }

  // Find the next puzzle in the daily sequence (if any)
  const date = getDateForPuzzleId(puzzleId);
  let nextPuzzleId: string | null = null;
  if (date) {
    const daily = getDailyPuzzlesForDate(date);
    if (daily) {
      if (daily.short === puzzleId) nextPuzzleId = daily.medium;
      else if (daily.medium === puzzleId) nextPuzzleId = daily.long;
      else nextPuzzleId = null;
    }
  }

  // Prepare props for ChessBoard
  const targetWord = puzzleData.targetWords[0];
  const congratsMessage = `Congratulations! You found the word ${targetWord}!`;
  // ...construct board as in levelLoader.ts if needed...

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Daily Puzzle</h1>
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-lg">
        <ChessBoard
          tutorialMode={false}
          tutorialLevel={{
            board: [], // TODO: build board from puzzleData.pieces
            targetWord,
            congratsMessage,
          }}
          onLevelComplete={undefined} // TODO: handle next puzzle navigation client-side
        />
      </div>
      {/* TODO: Add Next button if nextPuzzleId exists, and handle navigation client-side */}
    </main>
  );
} 