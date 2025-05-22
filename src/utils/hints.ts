import { LETTER_FREQUENCY } from './letterFrequency';
import fs from 'fs';
import path from 'path';

function getPuzzlePathFromId(puzzleId: string): string {
  const [wordLength] = puzzleId.split('-');
  return path.join(process.cwd(), 'src', 'puzzles', `${wordLength}_letter`, `puzzle_${puzzleId}.json`);
}

function getLetterFrequencyRank(letter: string): number {
  const idx = LETTER_FREQUENCY.findIndex(lf => lf.letter === letter.toUpperCase());
  return idx === -1 ? LETTER_FREQUENCY.length : idx;
}

// Get unused hint squares for a puzzle
export async function getUnusedHintSquares(puzzleId: string): Promise<string[]> {
  const puzzlePath = getPuzzlePathFromId(puzzleId);
  const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf-8'));
  const targetPath: string[] = puzzleData.targetPath;
  const legalCaptures: Record<string, number> = puzzleData.legalCaptures || {};
  const allSquares: { position: string; letter: string }[] = puzzleData.pieces.map((p: any) => ({ position: p.position, letter: p.letter }));
  const unusedSquares = allSquares.filter(sq => !targetPath.includes(sq.position));

  // Sort unused squares by legalCaptures desc, then by letter frequency, then by order in file
  const sorted = unusedSquares.sort((a, b) => {
    const capA = legalCaptures[a.position] || 0;
    const capB = legalCaptures[b.position] || 0;
    if (capB !== capA) return capB - capA;
    const freqA = getLetterFrequencyRank(a.letter);
    const freqB = getLetterFrequencyRank(b.letter);
    if (freqA !== freqB) return freqA - freqB;
    return allSquares.findIndex(s => s.position === a.position) - allSquares.findIndex(s => s.position === b.position);
  });

  const numHints = Math.ceil(unusedSquares.length / 3);
  return sorted.slice(0, numHints).map(sq => sq.position);
}

// Get the first letter hint square for a puzzle
export async function getFirstLetterHintSquare(puzzleId: string): Promise<string> {
  const puzzlePath = getPuzzlePathFromId(puzzleId);
  const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf-8'));
  const targetPath: string[] = puzzleData.targetPath;
  return targetPath[0];
}

// Get the reveal answer path for a puzzle
export async function getRevealAnswerPath(puzzleId: string): Promise<string[]> {
  const puzzlePath = getPuzzlePathFromId(puzzleId);
  const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf-8'));
  return puzzleData.targetPath;
} 