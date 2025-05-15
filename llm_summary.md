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
   - Green corner indicators: Legal moves
   - Yellow: Previous moves in current word
   - Red flash: Illegal moves
   - Yellow pulsing highlight: Tutorial guidance

4. Tutorial System
   - Three progressive tutorial levels
   - Interactive guided experience
   - Popup modals explaining game mechanics
   - Highlighted pieces to direct player actions
   - Special feedback for tutorial-specific actions

### User Interface Elements
- Responsive chess board with square cells
- Word-building display with letter placeholders
- Clear button to reset the current attempt
- Success modal on completion
- Top bar with navigation elements
- Level picker for jumping to specific levels
- Tutorial mode with guided instructions

## Responsive Design Implementation

### Chessboard
- Fully responsive board that adapts to viewport size
- Chess squares using aspect ratio for consistent proportions
- Dynamic sizing with minimum thresholds for small screens
- Viewport-based scaling (vw/vh) with absolute minimums

### Chess Pieces
- SVG chess pieces with proportional scaling
- Responsive letter sizes using min/max/clamp for proper sizing
- Font sizing with viewport units and minimum guaranteed size
- Optimized positioning for all screen sizes

### Answer Display
- Responsive container with dynamic height
- Font sizes that scale with viewport while adjusting for word length
- Minimum threshold sizes to ensure readability
- Balanced spacing that reduces on smaller screens

## Illegal Move Handling
- First piece selection: Ignores clicks on empty squares
- Subsequent moves:
  - Ignores clicks on squares that aren't legal moves
  - Shows specific error message for legal moves that don't capture opposite color
  - Provides visual feedback with a red flash on the invalid square
  - Preserves current word progress when showing errors

## Level System
- Game includes multiple puzzle levels
- Each level has a specific target word to solve
- Board configuration is designed for the target word
- Success modal provides navigation to next level
- Level generator script for creating new challenges

## Tutorial System
- Comprehensive onboarding for new players
- Progressive instruction across three levels:
  1. **Level 1 (BOAT)**: Basic movement and captures
  2. **Level 2 (CHECK)**: Advanced concepts with unused pieces
  3. **Level 3 (FINISH)**: Self-guided challenge
- Highlighting system to guide piece selection
- Modal popups with contextual instructions
- Special handlers for tutorial-specific actions like board clearing

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
- `TutorialChessBoard.tsx`: Tutorial-specific chess board
- `TutorialModal.tsx`: Tutorial instruction popups

### Contexts
- `TutorialContext.tsx`: Manages tutorial state and progression

### Utils
- `chess.ts`: Chess move validation logic
- `levelLoader.ts`: Level loading functionality
- `board.ts`: Board creation and manipulation

### Types
- `chess.ts`: Types for chess pieces and board state
- `level.ts`: Types for level data structure
- `tutorial.ts`: Types for tutorial system

### Data
- `tutorialData.ts`: Data for tutorial levels and instructions

### Assets
- `standard.js`: SVG chess piece definitions with responsive styling

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
3. Validate against target word
4. Provide appropriate feedback for completion

### State Management Considerations
1. Board state must be updated after each move
2. Previous moves in current word sequence must be tracked
3. Visual feedback must be updated in real-time
4. Invalid moves must trigger appropriate error messages and visual cues 