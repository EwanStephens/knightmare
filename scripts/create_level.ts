import { getAndUseRandomWord } from '../src/level_creator/wordbankManager';
import { generateBoard } from '../src/level_creator/boardGenerator';
import { findLongestWords } from '../src/level_creator/validator';
import { serializeLevel } from '../src/level_creator/serializer';

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
  // TODO: Implement getAndUseRandomWord
  // const targetWord = await getAndUseRandomWord(wordLength);
  // console.log(`[Level Creator] Picked target word: ${targetWord}`);

  // 2. Generate the board
  // TODO: Implement generateBoard
  // const board = await generateBoard(targetWord, extraLetters);
  // console.log('[Level Creator] Board generated.');

  // 3. Validate and find longest words
  // TODO: Implement findLongestWords
  // const longestWords = await findLongestWords(board);
  // console.log(`[Level Creator] Longest words found: ${longestWords.join(', ')}`);

  // 4. Serialize to JSON
  // TODO: Implement serializeLevel
  // await serializeLevel(board, longestWords, `src/levels/level_${targetWord}.json`);
  // console.log('[Level Creator] Level serialized to JSON.');
}

main().catch(err => {
  console.error('[Level Creator] Error:', err);
  process.exit(1);
}); 