import { getAndUseRandomWord, moveWordBackToUnused } from '../src/utils/wordbankManager';
import { generateBoard, GeneratedBoardResult } from '../src/level_creator/boardGenerator';
import { findLongestWords, ValidationResult } from '../src/level_creator/validator';
import { serializeLevel } from '../src/level_creator/serializer';
import path from 'path';
import fs from 'fs/promises';
import { generatePuzzleId, getPuzzlePathFromId, checkPuzzleIdExists } from '../src/utils/puzzleUtils';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export async function createLevelWithTargetWord(targetWord: string, extraLetters: number, fromWordbank: boolean, testMode = false) {
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
      // Move word back to unused if fromWordbank and not testMode
      if (fromWordbank && !testMode) await moveWordBackToUnused(targetWord.length, targetWord);
      console.error(`[Level Creator] Board generation failed: ${err}.` + (fromWordbank && !testMode ? ' Target word moved back to unused.' : ''));
      return { success: false, error: err };
    }

    // 2. Validate and find longest words
    const validation: ValidationResult = await findLongestWords(board, targetWord);
    console.log(`[Level Creator] Longest words found: ${validation.longestWords.join(', ')}`);

    // 3. Handle validation result
    if (!validation.isValid) {
      if (!testMode) {
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
      }
      // Move word back to unused if fromWordbank and not testMode
      if (fromWordbank && !testMode) await moveWordBackToUnused(targetWord.length, targetWord);
      console.error(`[Level Creator] Validation failed: ${validation.reason}.` + (!testMode ? ' Puzzle saved.' : ' (test mode, not saved)') + (fromWordbank && !testMode ? ' Target word moved back to unused.' : ''));
      return { success: false, error: validation.reason };
    }

    // 4. Output to puzzles directory with new ID logic
    if (!testMode) {
      const puzzleId = await generatePuzzleId(targetWord.length, extraLetters, checkPuzzleIdExists);
      const puzzlePath = getPuzzlePathFromId(puzzleId);
      const puzzlesDir = path.dirname(puzzlePath);
      await fs.mkdir(puzzlesDir, { recursive: true });
      await serializeLevel(board, validation.longestWords, puzzlePath, { targetPath, legalCaptures });
      console.log(`[Level Creator] Level serialized to ${puzzlePath}`);
      return { success: true, puzzleId };
    } else {
      console.log('[Level Creator] Test mode: not serializing puzzle or updating wordbank.');
      return { success: true, test: true };
    }
  } catch (err) {
    console.error('[Level Creator] Error:', err);
    return { success: false, error: err };
  }
}

export async function createLevelWithWordLength(wordLength: number, extraLetters: number, testMode = false) {
  try {
    let targetWord;
    if (!testMode) {
      targetWord = await getAndUseRandomWord(wordLength);
    } else {
      // In test mode, pick a word but don't update the wordbank
      const filePath = path.join(__dirname, `../src/data/wordbanks/${wordLength}_letter_words.json`);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const wordbank = JSON.parse(fileContent);
      if (!wordbank.unused_words || wordbank.unused_words.length === 0) {
        throw new Error(`No unused words available for length ${wordLength}`);
      }
      targetWord = wordbank.unused_words[Math.floor(Math.random() * wordbank.unused_words.length)];
    }
    return await createLevelWithTargetWord(targetWord, extraLetters, !testMode, testMode);
  } catch (err) {
    console.error('[Level Creator] Error picking word from wordbank:', err);
    return { success: false, error: err };
  }
}

// CLI usage with yargs
if (require.main === module) {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('word', {
      type: 'string',
      describe: 'Explicit target word to use for the puzzle',
      conflicts: 'wordLength',
    })
    .option('word-length', {
      type: 'number',
      describe: 'Length of the word to pick from the wordbank',
      conflicts: 'word',
    })
    .option('extra-letters', {
      type: 'number',
      describe: 'Number of additional random letters to add to the board',
      default: 0,
    })
    .option('test', {
      type: 'boolean',
      describe: 'Test mode (no wordbank or file writes)',
      default: false,
    })
    .check(argv => {
      if ((argv.word && argv.wordLength) || (!argv.word && !argv.wordLength)) {
        throw new Error('You must specify exactly one of --word or --word-length.');
      }
      if (argv.wordLength && (typeof argv.wordLength !== 'number' || isNaN(argv.wordLength))) {
        throw new Error('--word-length must be a number.');
      }
      if (typeof argv.extraLetters !== 'number' || isNaN(argv.extraLetters) || argv.extraLetters < 0) {
        throw new Error('--extra-letters must be a non-negative number.');
      }
      return true;
    })
    .help('h')
    .alias('h', 'help')
    .parseSync();

  if (argv.word) {
    // Mode: --word <targetWord>
    const explicitTargetWord = argv.word;
    const extraLetters = argv.extraLetters as number;
    createLevelWithTargetWord(explicitTargetWord, extraLetters, false, argv.test).then(result => {
      if (result.success) {
        if (argv.test) {
          console.log(`[Level Creator] Test mode complete.`);
        } else {
          console.log(`[Level Creator] Success! Puzzle ID: ${result.puzzleId}`);
        }
      } else {
        console.error(`[Level Creator] Failed: ${result.error}`);
        process.exit(1);
      }
    });
  } else if (argv.wordLength) {
    // Mode: --word-length <wordLength>
    const wordLength = argv.wordLength as number;
    const extraLetters = argv.extraLetters as number;
    createLevelWithWordLength(wordLength, extraLetters, argv.test).then(result => {
      if (result.success) {
        if (argv.test) {
          console.log(`[Level Creator] Test mode complete.`);
        } else {
          console.log(`[Level Creator] Success! Puzzle ID: ${result.puzzleId}`);
        }
      } else {
        console.error(`[Level Creator] Failed: ${result.error}`);
        process.exit(1);
      }
    });
  }
} 