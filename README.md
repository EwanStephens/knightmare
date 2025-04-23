# Knightmare

A unique word game that combines chess mechanics with word building. Players must capture pieces using legal chess moves to construct valid English words.

## Tutorial Level

The game starts with a tutorial level where players need to spell the word "BOAT" by making the following moves:
1. White pawn on a2 captures black knight on b3 (B + O)
2. White bishop on d2 captures black rook on e1 (A + T)

## Game Rules

- The game is played on a 5x5 chess board
- Each occupied square contains both a chess piece and a letter
- To build words, players must:
  - Select squares in sequence
  - Make only legal chess moves
  - Capture pieces of the opposite color
  - Create valid English words of 3 or more letters
- Pawns can only capture diagonally
  - White pawns move up the board
  - Black pawns move down the board

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

## Features

- Interactive 5x5 chess board
- Visual highlighting of:
  - Selected pieces (blue)
  - Legal moves (green)
  - Previous moves in current word (yellow)
- Real-time word building display
- Submit and Cancel buttons for word management
- Clear feedback for invalid moves or words
