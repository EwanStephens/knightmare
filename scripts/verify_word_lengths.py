#!/usr/bin/env python3
import json
import os
from pathlib import Path
import random

def verify_and_fix_wordbank(file_path):
    # Extract expected length from filename
    expected_length = int(file_path.stem.split('_')[0])
    
    # Read the JSON file
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    # Filter words to correct length and remove duplicates
    original_count = len(data['words'])
    valid_words = list(set(word.lower() for word in data['words'] if len(word) == expected_length))
    random.shuffle(valid_words)  # Randomize the word order
    
    # Report changes
    removed_count = original_count - len(valid_words)
    if removed_count > 0:
        print(f"{file_path.name}: Removed {removed_count} invalid words")
        for word in data['words']:
            if len(word) != expected_length:
                print(f"  - '{word}' (length: {len(word)})")
    
    # Update the file with proper formatting
    with open(file_path, 'w') as f:
        output = {
            "words": valid_words
        }
        # Format with 5 words per line for readability
        words_str = json.dumps(output, indent=2)
        # Replace the words array with our custom formatting
        words_lines = [valid_words[i:i+5] for i in range(0, len(valid_words), 5)]
        formatted_words = ',\n    '.join(
            ', '.join(f'"{w}"' for w in line)
            for line in words_lines
        )
        final_content = '{\n  "words": [\n    ' + formatted_words + '\n  ]\n}'
        f.write(final_content)

def main():
    # Set a fixed seed for reproducible results
    random.seed(42)
    
    # Get the project root directory (assuming script is in scripts/ directory)
    script_dir = Path(__file__).resolve().parent
    wordbanks_dir = script_dir.parent / 'src' / 'data' / 'wordbanks'
    
    # Process each word bank file
    for file_path in wordbanks_dir.glob('*_letter_words.json'):
        verify_and_fix_wordbank(file_path)

if __name__ == '__main__':
    main() 