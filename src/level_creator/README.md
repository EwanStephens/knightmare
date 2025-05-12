# Level Creator

This directory contains the modular code for generating chess-based word puzzle levels for the Knightmare project.

## What It Does
- **Picks a target word** of a specified length from a wordbank, ensuring it is not reused.
- **Generates a chess board** with a valid path for the target word using chess moves, and fills in extra random letters.
- **Validates** that the target word is the longest (or joint longest) word that can be formed on the board using chess capture rules.
- **Serializes** the board and the top words to a JSON file in the format used by the game.

## Modules
- `wordbankManager.ts`: Handles wordbank loading, word selection, and updating.
- `boardGenerator.ts`: Generates the board and the target path.
- `validator.ts`: Validates the board and finds the longest words using a trie and DFS.
- `serializer.ts`: Serializes the board and words to a level JSON file.

## How to Run

1. **Install dependencies** (if not already):
   ```sh
   npm install
   ```

2. **Run the level creator script** from the project root:
   ```sh
   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create_level.ts <wordLength> <extraLetters>
   ```
   - `wordLength`: Number of letters in the target word (e.g., 6)
   - `extraLetters`: Number of additional random letters to add to the board (e.g., 3)

   Example:
   ```sh
   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create_level.ts 6 3
   ```

3. **Output**: The generated level will be saved in `src/levels/level_X.json` where `X` is the next available level number.

## Notes
- The script ensures the target word is the longest (or joint longest) word on the board.
- All modules are written in TypeScript and use only relative imports for compatibility with `ts-node`. 