import { Square } from '@/types/chess';
import fs from 'fs/promises';

export async function serializeLevel(board: Square[][], words: string[], filename: string): Promise<void> {
  const pieces = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const sq = board[row][col];
      if (sq.piece) {
        pieces.push({
          position: sq.position,
          type: sq.piece.type,
          color: sq.piece.color,
          letter: sq.piece.letter.toUpperCase(),
        });
      }
    }
  }
  const data = {
    pieces,
    targetWords: words.map(w => w.toUpperCase()),
  };
  await fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[Serializer] Level written to ${filename}`);
} 