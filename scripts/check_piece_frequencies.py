#!/usr/bin/env python3
"""
Script to check piece frequencies in puzzles from August 24th to January 31st, 2026
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

def get_piece_frequencies_from_puzzle(puzzle_path: Path) -> Dict[str, int]:
    """Extract piece frequencies from a puzzle file."""
    try:
        with open(puzzle_path, 'r') as f:
            puzzle_data = json.load(f)
        
        piece_counts = defaultdict(int)
        
        # Handle the pieces array structure
        if 'pieces' in puzzle_data:
            for piece in puzzle_data['pieces']:
                if 'type' in piece:
                    piece_counts[piece['type']] += 1
        
        return dict(piece_counts)
    except Exception as e:
        print(f"Error reading puzzle {puzzle_path}: {e}")
        return {}

def analyze_piece_frequencies(start_date: str, end_date: str) -> Dict:
    """Analyze piece frequencies for puzzles in the given date range."""
    calendar = load_calendar()
    
    # Filter dates in range
    dates_in_range = []
    for date_str in calendar['dates'].keys():
        if start_date <= date_str <= end_date:
            dates_in_range.append(date_str)
    
    dates_in_range.sort()
    print(f"Analyzing {len(dates_in_range)} dates from {start_date} to {end_date}")
    
    # Collect piece counts by puzzle type
    piece_counts = {
        'short': defaultdict(int),
        'medium': defaultdict(int),
        'long': defaultdict(int)
    }
    
    total_pieces = {'short': 0, 'medium': 0, 'long': 0}
    
    for date_str in dates_in_range:
        date_data = calendar['dates'][date_str]
        
        for puzzle_type in ['short', 'medium', 'long']:
            if puzzle_type in date_data:
                puzzle_id = date_data[puzzle_type]
                
                # Parse puzzle ID to get file path
                try:
                    parts = puzzle_id.split('-')
                    if len(parts) >= 2:
                        word_length = int(parts[0])
                        extra_letters = int(parts[1])
                        
                        # Find the puzzle file
                        puzzle_dir = Path(__file__).parent.parent / "src" / "puzzles" / f"{word_length}_letter"
                        puzzle_file = puzzle_dir / f"puzzle_{puzzle_id}.json"
                        
                        if puzzle_file.exists():
                            piece_freqs = get_piece_frequencies_from_puzzle(puzzle_file)
                            
                            # Add to totals
                            for piece_type, count in piece_freqs.items():
                                piece_counts[puzzle_type][piece_type] += count
                                total_pieces[puzzle_type] += count
                        else:
                            print(f"Warning: Puzzle file not found: {puzzle_file}")
                except Exception as e:
                    print(f"Error processing puzzle {puzzle_id}: {e}")
    
    # Calculate frequencies
    frequencies = {}
    for puzzle_type in ['short', 'medium', 'long']:
        if total_pieces[puzzle_type] > 0:
            frequencies[puzzle_type] = {}
            for piece_type in ['pawn', 'knight', 'bishop', 'rook', 'queen']:
                count = piece_counts[puzzle_type].get(piece_type, 0)
                frequencies[puzzle_type][piece_type] = count / total_pieces[puzzle_type]
    
    return frequencies, total_pieces, piece_counts

def check_frequencies(frequencies: Dict, expected: Dict, tolerance: float = 0.05) -> Dict:
    """Check if frequencies match expected values within tolerance."""
    results = {}
    
    for puzzle_type in frequencies:
        results[puzzle_type] = {
            'frequencies': frequencies[puzzle_type],
            'expected': expected[puzzle_type],
            'deviations': {},
            'within_tolerance': True,
            'average_deviation': 0
        }
        
        total_deviation = 0
        for piece_type in expected[puzzle_type]:
            actual = frequencies[puzzle_type].get(piece_type, 0)
            expected_val = expected[puzzle_type][piece_type]
            deviation = abs(actual - expected_val)
            
            results[puzzle_type]['deviations'][piece_type] = deviation
            total_deviation += deviation
            
            if deviation > tolerance:
                results[puzzle_type]['within_tolerance'] = False
        
        results[puzzle_type]['average_deviation'] = total_deviation / len(expected[puzzle_type])
    
    return results

def main():
    # Analyze puzzles from August 24th to January 31st, 2026
    start_date = "2025-08-24"
    end_date = "2026-01-31"
    
    print(f"=== Piece Frequency Analysis ===")
    print(f"Date Range: {start_date} to {end_date}")
    print()
    
    frequencies, total_pieces, piece_counts = analyze_piece_frequencies(start_date, end_date)
    
    # Check against expected frequencies
    results = check_frequencies(frequencies, EXPECTED_FREQUENCIES)
    
    # Display results
    for puzzle_type in ['short', 'medium', 'long']:
        print(f"=== {puzzle_type.upper()} PUZZLES ===")
        print(f"Total pieces analyzed: {total_pieces[puzzle_type]}")
        print()
        
        print("Piece Frequencies:")
        for piece_type in ['pawn', 'knight', 'bishop', 'rook', 'queen']:
            actual = frequencies[puzzle_type].get(piece_type, 0)
            expected = EXPECTED_FREQUENCIES[puzzle_type][piece_type]
            deviation = results[puzzle_type]['deviations'][piece_type]
            status = "✅" if deviation <= 0.05 else "⚠️"
            
            print(f"  {piece_type.capitalize():6}: Expected {expected:.1%}, Got {actual:.1%} ({deviation:.1%} deviation) {status}")
        
        print()
        print(f"Average deviation: {results[puzzle_type]['average_deviation']:.3f}")
        print(f"Status: {'✅ PASS' if results[puzzle_type]['within_tolerance'] else '⚠️  OUTSIDE TOLERANCE'}")
        print()
    
    # Summary
    print("=== SUMMARY ===")
    all_passing = all(results[puzzle_type]['within_tolerance'] for puzzle_type in results)
    if all_passing:
        print("🎉 All puzzle types are within frequency tolerance!")
    else:
        print("⚠️  Some puzzle types have frequencies outside tolerance")
    
    print(f"Total puzzles analyzed: {sum(len([d for d in calendar['dates'] if start_date <= d <= end_date]) for calendar in [load_calendar()])}")
    print(f"Total pieces analyzed: {sum(total_pieces.values())}")

if __name__ == "__main__":
    main() 