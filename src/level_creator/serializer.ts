import { Square } from '../types/chess';
import fs from 'fs/promises';

interface ExtraLevelInfo {
  targetPath?: string[];
  legalCaptures?: Record<string, number>;
}

export async function serializeLevel(
  board: Square[][],
  words: string[],
  filename: string,
  extraInfo?: ExtraLevelInfo
): Promise<void> {
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
  const data: {
    pieces: {
      position: string;
      type: string;
      color: string;
      letter: string;
    }[];
    targetWords: string[];
    targetPath?: string[];
    legalCaptures?: Record<string, number>;
  } = {
    pieces,
    targetWords: words.map(w => w.toUpperCase()),
  };
  if (extraInfo?.targetPath) data.targetPath = extraInfo.targetPath;
  if (extraInfo?.legalCaptures) data.legalCaptures = extraInfo.legalCaptures;
  await fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[Serializer] Level written to ${filename}`);
} 