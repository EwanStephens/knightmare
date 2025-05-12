import fs from 'fs/promises';
import path from 'path';

export type Wordbank = {
  unused_words: string[];
  used_words: string[];
};

function getWordbankFilename(length: number): string {
  return path.join(__dirname, `../data/wordbanks/${length}_letter_words.json`);
}

export async function getAndUseRandomWord(length: number): Promise<string> {
  const filePath = getWordbankFilename(length);
  const fileContent = await fs.readFile(filePath, 'utf-8');
  const wordbank: Wordbank = JSON.parse(fileContent);

  if (!wordbank.unused_words || wordbank.unused_words.length === 0) {
    throw new Error(`No unused words available for length ${length}`);
  }

  // Pick a random word
  const idx = Math.floor(Math.random() * wordbank.unused_words.length);
  const word = wordbank.unused_words[idx];

  // Move word from unused to used
  wordbank.unused_words.splice(idx, 1);
  wordbank.used_words.push(word);

  // Persist the update
  await fs.writeFile(filePath, JSON.stringify(wordbank, null, 2), 'utf-8');

  return word;
} 