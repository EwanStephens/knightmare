import { getAndUseRandomWord, moveWordBackToUnused } from '../src/level_creator/wordbankManager';
import { generateBoard, GeneratedBoardResult } from '../src/level_creator/boardGenerator';
import { findLongestWords, ValidationResult } from '../src/level_creator/validator';
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

  // 2. Generate the board (with error handling)
  let board, targetPath, legalCaptures;
  try {
    const result: GeneratedBoardResult = await generateBoard(targetWord, extraLetters);
    board = result.board;
    targetPath = result.targetPath;
    legalCaptures = result.legalCaptures;
    console.log('[Level Creator] Board generated.');
  } catch (err) {
    // Move word back to unused if board generation fails
    await moveWordBackToUnused(wordLength, targetWord);
    console.error(`[Level Creator] Board generation failed: ${err}. Target word moved back to unused.`);
    process.exit(1);
  }

  // 3. Validate and find longest words
  const validation: ValidationResult = await findLongestWords(board, targetWord);
  console.log(`[Level Creator] Longest words found: ${validation.longestWords.join(', ')}`);

  // 4. Handle validation result
  if (!validation.isValid) {
    // Save to interesting directory
    const interestingDir = path.join(__dirname, '../src/interesting');
    await fs.mkdir(interestingDir, { recursive: true });
    const filename = path.join(interestingDir, `failed_${targetWord}_${Date.now()}.json`);
    await serializeLevel(board, validation.longestWords, filename, {
      targetPath,
      legalCaptures,
      reason: validation.reason,
      numTargetWordPaths: validation.numTargetWordPaths,
    } as any);
    // Move word back to unused
    await moveWordBackToUnused(wordLength, targetWord);
    console.error(`[Level Creator] Validation failed: ${validation.reason}. Puzzle saved to ${filename}. Target word moved back to unused.`);
    process.exit(1);
  }
  // TODO: Update to use new puzzle directory/ID logic
  const nextLevelNum = await getNextLevelNumber();
  await serializeLevel(board, validation.longestWords, `src/levels/level_${nextLevelNum}.json`, { targetPath, legalCaptures });
  console.log('[Level Creator] Level serialized to JSON.');
}

main().catch(err => {
  console.error('[Level Creator] Error:', err);
  process.exit(1);
}); 