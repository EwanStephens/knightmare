import { Square, Position } from '../types/chess';
import { getLegalCaptures, algebraicToPosition, positionToAlgebraic } from '../utils/chess';
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

export async function findLongestWords(board: Square[][]): Promise<string[]> {
  console.log('[Validator] Loading word list and building trie...');
  const words = await loadWords();
  const trie = buildTrie(words);
  console.log(`[Validator] Trie built with ${words.length} words.`);

  const foundWords = new Set<string>();
  const longestWords: string[] = [];

  function dfs(pos: Position, visited: Set<string>, prefix: string) {
    const sq = board[pos.row][pos.col];
    if (!sq.piece) return;
    const letter = sq.piece.letter.toLowerCase();
    const newPrefix = prefix + letter;
    if (!isPrefix(trie, newPrefix)) return;
    if (isWord(trie, newPrefix)) {
      foundWords.add(newPrefix);
    }
    visited.add(positionToAlgebraic(pos.row, pos.col));
    const captures = getLegalCaptures(sq.piece, pos, board, Array.from(visited));
    for (const next of captures) {
      const nextAlg = positionToAlgebraic(next.row, next.col);
      if (!visited.has(nextAlg)) {
        dfs(next, new Set(visited), newPrefix);
      }
    }
  }

  // Start DFS from every square
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      dfs({ row, col }, new Set(), '');
    }
  }

  // Sort found words by length (desc), then alphabetically
  const sorted = Array.from(foundWords).sort((a, b) => b.length - a.length || a.localeCompare(b));
  for (let i = 0; i < Math.min(10, sorted.length); i++) {
    longestWords.push(sorted[i]);
  }
  console.log(`[Validator] Longest words found: ${longestWords.join(', ')}`);
  return longestWords;
} 