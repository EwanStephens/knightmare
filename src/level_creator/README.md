# Level Creator

This directory contains the modular code for generating chess-based word puzzle levels for the Spell Check project.

## What It Does
- **Picks a target word** of a specified length from a wordbank, ensuring it is not reused, or allows you to specify a target word directly.
- **Generates a chess board** with a valid path for the target word using chess moves, and fills in extra random letters.
- **Validates** that the target word is the longest (or joint longest) word that can be formed on the board using chess capture rules.
- **Serializes** the board and the top words to a JSON file in the format used by the game, with a unique puzzle ID and organized output directory.

## Wordbank
- Wordbanks are JSON files in `src/data/wordbanks/`, generated and filtered by scripts to remove short, plural, or invalid words.
- Each wordbank tracks `unused_words` and `used_words` to avoid repeats.
- Words are moved between these lists as puzzles are generated or failed.

## Modules
- `wordbankManager.ts`: Handles wordbank loading, word selection, and updating.
- `boardGenerator.ts`: Generates the board and the target path.
- `validator.ts`: Validates the board and finds the longest words using a trie and DFS.
- `serializer.ts`: Serializes the board and words to a level JSON file.
- `puzzleUtils.ts`: Utility functions for generating unique puzzle IDs and resolving puzzle file paths.

## How to Run

1. **Install dependencies** (if not already):
   ```sh
   npm install
   ```

2. **Run the level creator script** from the project root using options:

   - You must specify **exactly one** of `--word-length` or `--word`.
   - `--extra-letters` is optional and defaults to 0.
   - `--test` is optional and prevents wordbank/file writes (dry run).

   **A. By word length (random from wordbank):**
   ```sh
   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create_level.ts --word-length <number> [--extra-letters <number>] [--test]
   ```
   - `--word-length <number>`: Number of letters in the target word (e.g., 6)
   - `--extra-letters <number>`: Number of additional random letters to add to the board (default: 0)
   - `--test`: If present, does not update the wordbank or serialize the puzzle

   **B. By explicit target word:**
   ```sh
   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create_level.ts --word <targetWord> [--extra-letters <number>] [--test]
   ```
   - `--word <targetWord>`: The word to use as the puzzle's solution
   - `--extra-letters <number>`: Number of additional random letters to add to the board (default: 0)
   - `--test`: If present, does not update the wordbank or serialize the puzzle

   **Examples:**
   ```sh
   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create_level.ts --word-length 6
   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create_level.ts --word-length 5 --extra-letters 2
   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create_level.ts --word CHESS
   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create_level.ts --word CHESS --extra-letters 2 --test
   ```

3. **Output**: The generated puzzle will be saved in `src/puzzles/<wordLength>_letter/puzzle_<wordLength>-<extraLetters>-<nanoid>.json` where `<nanoid>` is a unique 7-character ID. (Not applicable in --test mode)

## Notes
- The script ensures the target word is the longest (or joint longest) word on the board.
- If board generation or validation fails, the word is returned to the unused list (if it was from the wordbank).
- All modules are written in TypeScript and use only relative imports for compatibility with `ts-node`.
- Utility functions in `puzzleUtils.ts` allow for programmatic puzzle ID and path management.