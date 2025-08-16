#!/usr/bin/env python3
"""
Script to check piece frequencies in puzzles from August 25th to September 30th
and verify they match expected distributions.
"""

import json
import os
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Tuple

# Expected piece frequencies
EXPECTED_FREQUENCIES = {
    'short': {'pawn': 0.2, 'knight': 0.2, 'bishop': 0.2, 'rook': 0.2, 'queen': 0.2},
    'medium': {'pawn': 0.2, 'knight': 0.2, 'bishop': 0.2, 'rook': 0.2, 'queen': 0.2},
    'long': {'pawn': 0.15, 'knight': 0.25, 'bishop': 0.15, 'rook': 0.2, 'queen': 0.25}
}

def load_calendar() -> Dict:
    """Load the calendar.json file."""
    calendar_path = Path(__file__).parent.parent / "src" / "data" / "calendar" / "calendar.json"
    with open(calendar_path, 'r') as f:
        return json.load(f)

def load_puzzle(puzzle_id: str) -> Dict:
    """Load a puzzle file by ID."""
    # Parse puzzle ID format: "wordLength-extraLetters-nanoid"
    parts = puzzle_id.split('-')
    if len(parts) != 3:
        return None
    
    word_length = parts[0]
    puzzles_dir = Path(__file__).parent.parent / "src" / "puzzles" / f"{word_length}_letter"
    puzzle_file = puzzles_dir / f"puzzle_{puzzle_id}.json"
    
    if not puzzle_file.exists():
        return None
    
    with open(puzzle_file, 'r') as f:
        return json.load(f)

def count_pieces_in_puzzle(puzzle_data: Dict) -> Dict[str, int]:
    """Count pieces by type in a puzzle."""
    piece_counts = defaultdict(int)
    
    # Handle the actual puzzle structure with 'pieces' array
    if 'pieces' in puzzle_data:
        for piece in puzzle_data['pieces']:
            if piece.get('type'):
                piece_type = piece['type']
                piece_counts[piece_type] += 1
    
    return dict(piece_counts)

def analyze_piece_frequencies(start_date: str, end_date: str) -> Dict:
    """Analyze piece frequencies for puzzles in the given date range."""
    calendar = load_calendar()
    
    # Collect puzzle IDs in date range
    puzzles_by_type = {
        'short': [],
        'medium': [],
        'long': []
    }
    
    for date, date_data in calendar['dates'].items():
        if start_date <= date <= end_date:
            for puzzle_type in ['short', 'medium', 'long']:
                if puzzle_type in date_data:
                    puzzles_by_type[puzzle_type].append(date_data[puzzle_type])
    
    # Analyze each puzzle type
    results = {}
    
    for puzzle_type, puzzle_ids in puzzles_by_type.items():
        print(f"\nAnalyzing {puzzle_type} puzzles ({len(puzzle_ids)} puzzles):")
        
        total_pieces = defaultdict(int)
        valid_puzzles = 0
        
        for puzzle_id in puzzle_ids:
            puzzle_data = load_puzzle(puzzle_id)
            if puzzle_data:
                piece_counts = count_pieces_in_puzzle(puzzle_data)
                if piece_counts:  # Only count if we got valid piece data
                    for piece_type, count in piece_counts.items():
                        total_pieces[piece_type] += count
                    valid_puzzles += 1
            else:
                print(f"  Warning: Could not load puzzle {puzzle_id}")
        
        if valid_puzzles == 0:
            print(f"  No valid puzzles found for {puzzle_type}")
            continue
        
        # Calculate frequencies
        total_piece_count = sum(total_pieces.values())
        if total_piece_count == 0:
            print(f"  No pieces found in {puzzle_type} puzzles")
            continue
        
        actual_frequencies = {
            piece_type: count / total_piece_count 
            for piece_type, count in total_pieces.items()
        }
        
        # Fill in missing piece types with 0
        for piece_type in ['pawn', 'knight', 'bishop', 'rook', 'queen']:
            if piece_type not in actual_frequencies:
                actual_frequencies[piece_type] = 0.0
        
        # Sort by piece type for consistent output
        actual_frequencies = dict(sorted(actual_frequencies.items()))
        
        results[puzzle_type] = {
            'actual': actual_frequencies,
            'expected': EXPECTED_FREQUENCIES[puzzle_type],
            'total_pieces': total_piece_count,
            'valid_puzzles': valid_puzzles
        }
        
        print(f"  Total pieces: {total_piece_count}")
        print(f"  Valid puzzles: {valid_puzzles}")
        print(f"  Actual frequencies: {actual_frequencies}")
        print(f"  Expected frequencies: {EXPECTED_FREQUENCIES[puzzle_type]}")
        
        # Check if frequencies are close to expected (within 0.05 tolerance)
        tolerance = 0.05
        all_close = True
        for piece_type in ['pawn', 'knight', 'bishop', 'rook', 'queen']:
            expected = EXPECTED_FREQUENCIES[puzzle_type][piece_type]
            actual = actual_frequencies[piece_type]
            if abs(actual - expected) > tolerance:
                all_close = False
                print(f"    ⚠️  {piece_type}: expected {expected:.2f}, got {actual:.2f}")
            else:
                print(f"    ✅ {piece_type}: expected {expected:.2f}, got {actual:.2f}")
        
        if all_close:
            print(f"  🎯 {puzzle_type} puzzles: Frequencies match expected values!")
        else:
            print(f"  ❌ {puzzle_type} puzzles: Frequencies do not match expected values!")
    
    return results

def main():
    """Main function."""
    print("Checking piece frequencies for puzzles from August 25th to September 30th")
    print("=" * 70)
    
    start_date = "2025-08-25"
    end_date = "2025-09-30"
    
    results = analyze_piece_frequencies(start_date, end_date)
    
    print("\n" + "=" * 70)
    print("SUMMARY:")
    
    for puzzle_type, data in results.items():
        print(f"\n{puzzle_type.upper()} PUZZLES:")
        print(f"  Total pieces analyzed: {data['total_pieces']}")
        print(f"  Valid puzzles: {data['valid_puzzles']}")
        
        # Calculate average deviation from expected
        total_deviation = 0
        for piece_type in ['pawn', 'knight', 'bishop', 'rook', 'queen']:
            expected = data['expected'][piece_type]
            actual = data['actual'][piece_type]
            deviation = abs(actual - expected)
            total_deviation += deviation
        
        avg_deviation = total_deviation / 5
        print(f"  Average deviation from expected: {avg_deviation:.3f}")
        
        if avg_deviation < 0.05:
            print(f"  Status: ✅ PASS (frequencies match expected)")
        else:
            print(f"  Status: ❌ FAIL (frequencies do not match expected)")

if __name__ == "__main__":
    main() 