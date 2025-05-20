import { getAndUseRandomWord, moveWordBackToUnused } from '../src/level_creator/wordbankManager';
import { generateBoard, GeneratedBoardResult } from '../src/level_creator/boardGenerator';
import { findLongestWords, ValidationResult } from '../src/level_creator/validator';
import { serializeLevel } from '../src/level_creator/serializer';
import path from 'path';
import fs from 'fs/promises';
import { generatePuzzleId, getPuzzlePathFromId, checkPuzzleIdExists } from '../src/utils/puzzleUtils';

export async function createLevel(wordLength: number, extraLetters: number) {
  try {
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
      return { success: false, error: err };
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
      return { success: false, error: validation.reason };
    }

    // 5. Output to puzzles directory with new ID logic
    const puzzleId = await generatePuzzleId(wordLength, extraLetters, checkPuzzleIdExists);
    const puzzlePath = getPuzzlePathFromId(puzzleId);
    const puzzlesDir = path.dirname(puzzlePath);
    await fs.mkdir(puzzlesDir, { recursive: true });
    await serializeLevel(board, validation.longestWords, puzzlePath, { targetPath, legalCaptures });
    console.log(`[Level Creator] Level serialized to ${puzzlePath}`);
    return { success: true, puzzleId };
  } catch (err) {
    console.error('[Level Creator] Error:', err);
    return { success: false, error: err };
  }
}

// CLI usage
if (require.main === module) {
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
  createLevel(wordLength, extraLetters).then(result => {
    if (result.success) {
      console.log(`[Level Creator] Success! Puzzle ID: ${result.puzzleId}`);
    } else {
      console.error(`[Level Creator] Failed: ${result.error}`);
      process.exit(1);
    }
  });
} 