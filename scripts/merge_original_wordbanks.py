import os
import json
import nltk
from collections import defaultdict
from generate_wordbanks import is_plural

# Ensure NLTK data is available
try:
    nltk.data.find('corpora/wordnet')
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('wordnet')
    nltk.download('averaged_perceptron_tagger')

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ORIGINAL_WORDBANKS_DIR = os.path.join(BASE_DIR, 'src', 'data', 'wordbanks_original')
NEW_WORDBANKS_DIR = os.path.join(BASE_DIR, 'src', 'data', 'wordbanks')
ENGLISH_WORDS_DIR = os.path.join(BASE_DIR, 'src', 'data', 'english_words')
SOWPODS_PATH = os.path.join(ENGLISH_WORDS_DIR, 'sowpods.txt')

# Log files
LOG_PLURALS = os.path.join(ENGLISH_WORDS_DIR, 'merge_filtered_plurals.txt')
LOG_NOT_SCRABBLE = os.path.join(ENGLISH_WORDS_DIR, 'merge_filtered_not_scrabble.txt')

# Load SOWPODS as lowercase set
with open(SOWPODS_PATH, 'r') as f:
    sowpods_words = set(line.strip().lower() for line in f if line.strip())

# Collect all unused words from original wordbanks
all_unused = set()
for fname in os.listdir(ORIGINAL_WORDBANKS_DIR):
    if not fname.endswith('.json'):
        continue
    with open(os.path.join(ORIGINAL_WORDBANKS_DIR, fname), 'r') as f:
        data = json.load(f)
        all_unused.update(data.get('unused_words', []))

# Filter and group by length
filtered_by_length = defaultdict(set)
with open(LOG_PLURALS, 'w') as log_plurals, open(LOG_NOT_SCRABBLE, 'w') as log_not_scrabble:
    for word in all_unused:
        if len(word) <= 3:
            continue
        if is_plural(word):
            log_plurals.write(word + '\n')
            continue
        if word.lower() not in sowpods_words:
            log_not_scrabble.write(word + '\n')
            continue
        filtered_by_length[len(word)].add(word)

# Merge into new wordbanks
for length, words in filtered_by_length.items():
    out_path = os.path.join(NEW_WORDBANKS_DIR, f'{length}_letter_words.json')
    if not os.path.exists(out_path):
        continue
    with open(out_path, 'r') as f:
        data = json.load(f)
    # Add only words not already present
    existing = set(data['unused_words'])
    new_words = sorted(existing.union(words))
    data['unused_words'] = new_words
    with open(out_path, 'w') as f:
        json.dump(data, f, indent=2)

print('Merged original wordbanks into new wordbanks, filtered and deduplicated.') 