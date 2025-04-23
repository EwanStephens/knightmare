# Knightmare - LLM Agent Summary

## Project Overview
Knightmare is a word-building game that combines chess mechanics with word creation. The game is built using Next.js 15.3, React, TypeScript, and Tailwind CSS.

## Core Game Mechanics

### Board
- 5x5 chess board
- Each occupied square contains:
  1. A chess piece (either white or black)
  2. A letter

### Move Rules
1. Players must make legal chess moves according to standard chess rules
2. Only capturing moves are allowed
3. Only pieces of the opposite color can be captured
4. Moves must be made in sequence to build valid English words
5. Words must be 3 or more letters long

### Special Rules
- Pawns:
  - Can only capture diagonally
  - White pawns move upward
  - Black pawns move downward

## Technical Architecture

### Key Components
1. Board Component
   - Renders the 5x5 chess board
   - Handles piece selection and move validation
   - Manages visual state (highlighting)

2. Game State Management
   - Tracks current word being built
   - Maintains move history
   - Validates word submissions

3. Visual Feedback System
   - Blue: Selected pieces
   - Green: Legal moves
   - Yellow: Previous moves in current word

### User Interface Elements
- Interactive chess board
- Word building display
- Submit button
- Cancel button
- Move validation feedback
- Word validation feedback

## Example Gameplay (Tutorial)
Target word: "BOAT"
1. Move 1: White pawn (a2) captures black knight (b3) to get "B" + "O"
2. Move 2: White bishop (d2) captures black rook (e1) to get "A" + "T"

## Development Setup
```bash
git clone https://github.com/EwanStephens/knightmare.git
cd knightmare
npm install
npm run dev
```
Server runs at http://localhost:3000

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