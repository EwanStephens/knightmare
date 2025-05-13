# Knightmare - LLM Agent Summary

## Project Overview
Knightmare is a word-building puzzle game that combines chess mechanics with word creation. The game is built using Next.js 15.3, React, TypeScript, and Tailwind CSS.

## Core Game Mechanics

### Board
- 5x5 chess board
- Each occupied square contains:
  1. A chess piece (either white or black)
  2. A letter in the top-right corner

### Move Rules
1. Players must make legal chess moves according to standard chess rules
2. Only capturing moves are allowed
3. Only pieces of the opposite color can be captured
4. Moves must be made in sequence to build valid English words
5. Words must match the target word for the level

### Special Rules
- Pawns:
  - Can only capture diagonally
  - White pawns move upward
  - Black pawns move downward

## Technical Architecture

### Key Components
1. Board Component (`ChessBoard.tsx`)
   - Renders the 5x5 chess board
   - Handles piece selection and move validation
   - Manages visual state (highlighting)
   - Implements responsive design for various screen sizes

2. Game State Management
   - Tracks current word being built
   - Maintains move history
   - Validates moves against chess rules
   - Validates completed words against target word

3. Visual Feedback System
   - Blue (#94A3B8): Selected pieces
   - Green (corner indicators): Legal moves
   - Yellow: Previous moves in current word

### User Interface Elements
- Responsive chess board with square cells
- Word-building display with letter placeholders
- Clear button to reset the current attempt
- Success modal on completion
- Top bar with navigation elements

## Responsive Design Implementation

### Chessboard
- Uses `aspect-square` to maintain perfect squares
- Chess squares use viewport-relative sizing (`w-[15vw]`) with `max-w-36` constraint
- Uses a responsive grid system with tailored gap sizes (`gap-0.5 sm:gap-1`)

### Chess Pieces
- SVG chess pieces from standard.js with viewBox for proper scaling
- Pieces scale proportionally with their containers using relative sizing
- Letters positioned in the top-right corner of each square with z-index control

### Answer Display
- Uses consistent height with `h-[1.5em]` and flex alignment
- Letter sizes scale responsively based on viewport and word length
- Non-breaking space placeholder ensures consistent positioning

### Breakpoints
- Implements specialized sizing and spacing at sm (640px), md (768px), lg (1024px) breakpoints
- Text elements scale progressively with viewport size

## Level System
- Game includes multiple puzzle levels
- Each level has a specific target word to solve
- Board configuration is designed for the target word
- Success modal provides navigation to next level

## Development Setup
```bash
git clone https://github.com/EwanStephens/knightmare.git
cd knightmare
npm install
npm run dev
```
Server runs at http://localhost:3000

## Key Files

### Components
- `ChessBoard.tsx`: Main game component
- `TopBar.tsx`: Navigation header

### Utils
- `chess.ts`: Chess move validation logic
- `levelLoader.ts`: Level loading functionality
- `pieceWrapper.tsx`: (Removed during refactoring)

### Assets
- `standard.js`: SVG chess piece definitions with viewBox and responsive styling

## Styling
- Uses Tailwind CSS for responsive design
- Custom Chess7 font for special chess symbols
- Responsive text sizing across breakpoints 
- Blur effect on background when success modal appears

## Example Gameplay (Tutorial)
Target word: "BOAT"
1. Move 1: White pawn (a2) captures black knight (b3) to get "B" + "O"
2. Move 2: White bishop (d2) captures black rook (e1) to get "A" + "T"

## LLM-Specific Guidelines

### Move Validation
When validating moves, check:
1. Is the piece's movement pattern legal according to chess rules?
2. Is it a capturing move?
3. Is the captured piece of the opposite color?
4. Does the move contribute to a valid word sequence?

### Word Building Logic
1. Track letters from each captured piece
2. Concatenate letters in the order of capture
3. Validate against English dictionary
4. Minimum word length: 3 letters

### State Management Considerations
1. Board state must be updated after each move
2. Previous moves in current word sequence must be tracked
3. Visual feedback must be updated in real-time
4. Invalid moves/words must trigger appropriate error messages 