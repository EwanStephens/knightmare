# Knightmare

A unique word game that combines chess mechanics with word building. Players must capture pieces using legal chess moves to construct valid English words.

## Features

- Interactive 5x5 chess board
- Comprehensive 3-level interactive tutorial
- Visual highlighting of:
  - Selected pieces (blue)
  - Legal moves (green corners)
  - Previous moves in current word (yellow)
  - Tutorial guidance (yellow pulsing highlight)
- Real-time word building display
- Responsive design that works across all device sizes
- Visual feedback for illegal moves
- Progressive level system
- Level picker for jumping to specific challenges

## Game Rules

- The game is played on a 5x5 chess board
- Each occupied square contains both a chess piece and a letter
- To build words, players must:
  - Select squares in sequence
  - Make only legal chess moves
  - Capture pieces of the opposite color
  - Create valid English words that match the target word
- Pawns can only capture diagonally
  - White pawns move up the board
  - Black pawns move down the board

## Interactive Tutorial

The game includes a comprehensive 3-level tutorial:
1. **Level 1 (BOAT)**: Basic introduction to piece movement and capturing
2. **Level 2 (CHECK)**: More advanced word building with unused pieces
3. **Level 3 (FINISH)**: Challenge level to test skills learned

## Technical Details

Built with:
- Next.js 15.3
- React
- TypeScript
- Tailwind CSS

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/EwanStephens/knightmare.git
   ```

2. Install dependencies:
   ```bash
   cd knightmare
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Responsive Design

- Fully responsive board that adapts to all screen sizes
- Dynamic letter sizing that adjusts to screen dimensions
- Scales appropriately on mobile, tablet, and desktop devices
- Optimized touch targets for mobile play

## Level Creation

For information on creating custom levels, see [level_creator/README.md](level_creator/README.md).
