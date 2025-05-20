import { Square, Position } from '../types/chess';
import { getLegalCaptures, positionToAlgebraic } from '../utils/chess';
import fs from 'fs/promises';
import path from 'path';

interface TrieNode {
  children: Map<string, TrieNode>;
  isWord: boolean;
}

function insertWord(root: TrieNode, word: string) {
  let node = root;
  for (const char of word) {
    if (!node.children.has(char)) {
      node.children.set(char, { children: new Map(), isWord: false });
    }
    node = node.children.get(char)!;
  }
  node.isWord = true;
}

function buildTrie(words: string[]): TrieNode {
  const root: TrieNode = { children: new Map(), isWord: false };
  for (const word of words) {
    insertWord(root, word);
  }
  return root;
}

function isPrefix(root: TrieNode, prefix: string): boolean {
  let node = root;
  for (const char of prefix) {
    if (!node.children.has(char)) return false;
    node = node.children.get(char)!;
  }
  return true;
}

function isWord(root: TrieNode, word: string): boolean {
  let node = root;
  for (const char of word) {
    if (!node.children.has(char)) return false;
    node = node.children.get(char)!;
  }
  return node.isWord;
}

async function loadWords(): Promise<string[]> {
  const filePath = path.join(__dirname, '../data/english_words/words_alpha.txt');
  const content = await fs.readFile(filePath, 'utf-8');
  return content.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w.length >= 3);
}

export async function findLongestWords(board: Square[][], targetWord: string): Promise<string[]> {
  console.log('[Validator] Loading word list and building trie...');
  const words = await loadWords();
  const trie = buildTrie(words);
  console.log(`[Validator] Trie built with ${words.length} words.`);

  const foundWords = new Set<string>();
  const longestWords: string[] = [];
  const targetWordPaths: string[][] = [];
  let maxLen = 0;

  function dfs(pos: Position, visited: Set<string>, prefix: string, path: string[]) {
    const sq = board[pos.row][pos.col];
    if (!sq.piece) return;
    const letter = sq.piece.letter.toLowerCase();
    const newPrefix = prefix + letter;
    if (!isPrefix(trie, newPrefix)) return;
    const posAlg = positionToAlgebraic(pos.row, pos.col);
    const newPath = [...path, posAlg];
    if (isWord(trie, newPrefix)) {
      foundWords.add(newPrefix);
      if (newPrefix === targetWord.toLowerCase()) {
        targetWordPaths.push(newPath);
      }
      if (newPrefix.length > maxLen) maxLen = newPrefix.length;
    }
    visited.add(posAlg);
    const captures = getLegalCaptures(sq.piece, pos, board, Array.from(visited));
    for (const next of captures) {
      const nextAlg = positionToAlgebraic(next.row, next.col);
      if (!visited.has(nextAlg)) {
        dfs(next, new Set(visited), newPrefix, newPath);
      }
    }
  }

  // Start DFS from every square
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      dfs({ row, col }, new Set(), '', []);
    }
  }

  // Sort found words by length (desc), then alphabetically
  const sorted = Array.from(foundWords).sort((a, b) => b.length - a.length || a.localeCompare(b));
  const longest = sorted.filter(w => w.length === maxLen);
  for (let i = 0; i < Math.min(10, sorted.length); i++) {
    longestWords.push(sorted[i]);
  }
  console.log(`[Validator] Longest words found: ${longestWords.join(', ')}`);

  // Ensure the target word is the uniquely longest word
  if (longest.length !== 1 || longest[0] !== targetWord.toLowerCase()) {
    throw new Error(`[Validator] Target word '${targetWord}' is not the unique longest word found! Longest found: ${longest.join(', ')}`);
  }

  // Ensure there is only one path to form the target word
  if (targetWordPaths.length !== 1) {
    throw new Error(`[Validator] Target word '${targetWord}' can be formed in ${targetWordPaths.length} ways (should be unique).`);
  }

  return longestWords;
} 