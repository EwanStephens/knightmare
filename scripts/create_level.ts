import { getAndUseRandomWord, moveWordBackToUnused } from '../src/utils/wordbankManager';
import { generateBoard, GeneratedBoardResult } from '../src/level_creator/boardGenerator';
import { findLongestWords, ValidationResult } from '../src/level_creator/validator';
import { serializeLevel } from '../src/level_creator/serializer';
import path from 'path';
import fs from 'fs/promises';
import { generatePuzzleId, getPuzzlePathFromId, checkPuzzleIdExists } from '../src/utils/puzzleUtils';

export async function createLevelWithTargetWord(targetWord: string, extraLetters: number, fromWordbank: boolean) {
  try {
    console.log(`[Level Creator] Starting with target word '${targetWord}' (length ${targetWord.length}) and ${extraLetters} extra letters.`);

    // 1. Generate the board (with error handling)
    let board, targetPath, legalCaptures;
    try {
      const result: GeneratedBoardResult = await generateBoard(targetWord, extraLetters);
      board = result.board;
      targetPath = result.targetPath;
      legalCaptures = result.legalCaptures;
      console.log('[Level Creator] Board generated.');
    } catch (err) {
      // Move word back to unused if fromWordbank
      if (fromWordbank) await moveWordBackToUnused(targetWord.length, targetWord);
      console.error(`[Level Creator] Board generation failed: ${err}.` + (fromWordbank ? ' Target word moved back to unused.' : ''));
      return { success: false, error: err };
    }

    // 2. Validate and find longest words
    const validation: ValidationResult = await findLongestWords(board, targetWord);
    console.log(`[Level Creator] Longest words found: ${validation.longestWords.join(', ')}`);

    // 3. Handle validation result
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
      // Move word back to unused if fromWordbank
      if (fromWordbank) await moveWordBackToUnused(targetWord.length, targetWord);
      console.error(`[Level Creator] Validation failed: ${validation.reason}. Puzzle saved to ${filename}.` + (fromWordbank ? ' Target word moved back to unused.' : ''));
      return { success: false, error: validation.reason };
    }

    // 4. Output to puzzles directory with new ID logic
    const puzzleId = await generatePuzzleId(targetWord.length, extraLetters, checkPuzzleIdExists);
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

export async function createLevelWithWordLength(wordLength: number, extraLetters: number) {
  try {
    const targetWord = await getAndUseRandomWord(wordLength);
    return await createLevelWithTargetWord(targetWord, extraLetters, true);
  } catch (err) {
    console.error('[Level Creator] Error picking word from wordbank:', err);
    return { success: false, error: err };
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  let wordLength: number | undefined;
  let extraLetters: number | undefined;
  let explicitTargetWord: string | undefined;

  if (args[0] === '--word') {
    // Mode: --word <targetWord> <extraLetters>
    if (args.length !== 3) {
      console.error('Usage: ts-node scripts/create_level.ts --word <targetWord> <extraLetters>');
      process.exit(1);
    }
    explicitTargetWord = args[1];
    extraLetters = parseInt(args[2], 10);
    if (!explicitTargetWord || isNaN(extraLetters)) {
      console.error('Usage: ts-node scripts/create_level.ts --word <targetWord> <extraLetters>');
      process.exit(1);
    }
    createLevelWithTargetWord(explicitTargetWord, extraLetters, false).then(result => {
      if (result.success) {
        console.log(`[Level Creator] Success! Puzzle ID: ${result.puzzleId}`);
      } else {
        console.error(`[Level Creator] Failed: ${result.error}`);
        process.exit(1);
      }
    });
  } else {
    // Mode: <wordLength> <extraLetters>
    if (args.length !== 2) {
      console.error('Usage: ts-node scripts/create_level.ts <wordLength> <extraLetters>');
      console.error('   or: ts-node scripts/create_level.ts --word <targetWord> <extraLetters>');
      process.exit(1);
    }
    wordLength = parseInt(args[0], 10);
    extraLetters = parseInt(args[1], 10);
    if (isNaN(wordLength) || isNaN(extraLetters)) {
      console.error('Both arguments must be numbers.');
      process.exit(1);
    }
    createLevelWithWordLength(wordLength, extraLetters).then(result => {
      if (result.success) {
        console.log(`[Level Creator] Success! Puzzle ID: ${result.puzzleId}`);
      } else {
        console.error(`[Level Creator] Failed: ${result.error}`);
        process.exit(1);
      }
    });
  }
} 