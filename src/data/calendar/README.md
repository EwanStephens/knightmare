# Knightmare Daily Puzzle Calendar

This directory contains the `calendar.json` file, which tracks the mapping between dates and daily puzzles for the Knightmare game.

## calendar.json Structure

- `dates`: Maps each date (YYYY-MM-DD) to three puzzle IDs: `short`, `medium`, and `long`.
- `puzzles`: Maps each puzzle ID to its associated date, word length, and type (short/medium/long).

Example:
```json
{
  "dates": {
    "2025-06-01": {
      "short": "5-4-abc1234",
      "medium": "7-6-def5678",
      "long": "10-6-xyz9876"
    }
  },
  "puzzles": {
    "5-4-abc1234": { "date": "2025-06-01", "length": 5, "type": "short" },
    "7-6-def5678": { "date": "2025-06-01", "length": 7, "type": "medium" },
    "10-6-xyz9876": { "date": "2025-06-01", "length": 10, "type": "long" }
  }
}
```

## How to Generate Daily Puzzles

Use the `scripts/createDailyPuzzles.ts` script to generate daily puzzles for a given date range. This will update or create `calendar.json` in this directory.

### Usage
```
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/createDailyPuzzles.ts <start-date> <end-date>
```
- `<start-date>` and `<end-date>` must be in `YYYY-MM-DD` format.
- Example (for today):
```
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/createDailyPuzzles.ts 2025-06-01 2025-06-01
```

The script will create three puzzles (short, medium, long) for each day in the range and update `calendar.json` accordingly. 