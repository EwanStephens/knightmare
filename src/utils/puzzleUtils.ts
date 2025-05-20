import path from 'path';
import { customAlphabet } from 'nanoid';
import fs from 'fs/promises';

const NANOID_LENGTH = 7;
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', NANOID_LENGTH);

export async function generatePuzzleId(
  targetWordLength: number,
  extraLetters: number,
  checkExists: (id: string) => Promise<boolean>
): Promise<string> {
  let id: string;
  let fullId: string;
  do {
    id = nanoid();
    fullId = `${targetWordLength}-${extraLetters}-${id}`;
  } while (await checkExists(fullId));
  return fullId;
}

export function getPuzzlePathFromId(id: string): string {
  // id format: <targetWordLength>-<extraLetters>-<nanoID>
  const [wordLength] = id.split('-');
  return path.join('src', 'puzzles', `${wordLength}_letter`, `puzzle_${id}.json`);
}

export async function checkPuzzleIdExists(id: string): Promise<boolean> {
  const puzzlePath = getPuzzlePathFromId(id);
  try {
    await fs.access(puzzlePath);
    return true;
  } catch {
    return false;
  }
} 