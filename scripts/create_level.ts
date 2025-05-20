import { getAndUseRandomWord } from '../src/level_creator/wordbankManager';
import { generateBoard, GeneratedBoardResult } from '../src/level_creator/boardGenerator';
import { findLongestWords } from '../src/level_creator/validator';
import { serializeLevel } from '../src/level_creator/serializer';
import fs from 'fs/promises';
import path from 'path';

async function getNextLevelNumber(): Promise<number> {
  const levelsDir = path.join(__dirname, '../src/levels');
  const files = await fs.readdir(levelsDir);
  const numbers = files
    .map(f => /^level_(\d+)\.json$/.exec(f))
    .filter(Boolean)
    .map(match => parseInt(match![1], 10));
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

async function main() {
  const [,, wordLengthArg, extraLettersArg] = process.argv;
  if (!wordLengthArg || !extraLettersArg) {
    console.error('Usage: ts-node scripts/create_level.ts <wordLength> <extraLetters>');
    process.exit(1);
  }
  const wordLength = parseInt(wordLengthArg, 10);
  const extraLetters = parseInt(extraLettersArg, 10);
  if (isNaN(wordLength) || isNaN(extraLetters)) {
    console.error('Both arguments must be numbers.');
    process.exit(1);
  }

  console.log(`[Level Creator] Starting with word length ${wordLength} and ${extraLetters} extra letters.`);

  // 1. Pick a target word
  const targetWord = await getAndUseRandomWord(wordLength);
  console.log(`[Level Creator] Picked target word: ${targetWord}`);

  // 2. Generate the board
  const { board, targetPath, legalCaptures }: GeneratedBoardResult = await generateBoard(targetWord, extraLetters);
  console.log('[Level Creator] Board generated.');

  // 3. Validate and find longest words
  const longestWords = await findLongestWords(board, targetWord);
  console.log(`[Level Creator] Longest words found: ${longestWords.join(', ')}`);

  // 4. Serialize to JSON
  const nextLevelNum = await getNextLevelNumber();
  await serializeLevel(board, longestWords, `src/levels/level_${nextLevelNum}.json`, { targetPath, legalCaptures });
  console.log('[Level Creator] Level serialized to JSON.');
}

main().catch(err => {
  console.error('[Level Creator] Error:', err);
  process.exit(1);
}); 