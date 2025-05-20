import os
import json
import inflect
from collections import defaultdict
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet

# Ensure NLTK data is downloaded
try:
    nltk.data.find('corpora/wordnet')
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('wordnet')
    nltk.download('averaged_perceptron_tagger')

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
ENGLISH_WORDS_DIR = os.path.join(BASE_DIR, 'src', 'data', 'english_words')
WORDBANKS_DIR = os.path.join(BASE_DIR, 'src', 'data', 'wordbanks')
GOOGLE_WORDS_PATH = os.path.join(ENGLISH_WORDS_DIR, 'google-10000-english-no-swears.txt')
SOWPODS_PATH = os.path.join(ENGLISH_WORDS_DIR, 'sowpods.txt')
FILTERED_WORDS_PATH = os.path.join(ENGLISH_WORDS_DIR, 'google-10000-english-no-swears-filtered.txt')

# Log files
LOG_TOO_SHORT = os.path.join(ENGLISH_WORDS_DIR, 'filtered_too_short.txt')
LOG_PLURALS = os.path.join(ENGLISH_WORDS_DIR, 'filtered_plurals.txt')
LOG_NOT_SCRABBLE = os.path.join(ENGLISH_WORDS_DIR, 'filtered_not_scrabble.txt')

# Ensure output directories exist
os.makedirs(WORDBANKS_DIR, exist_ok=True)

# Load SOWPODS as lowercase set
with open(SOWPODS_PATH, 'r') as f:
    sowpods_words = set(line.strip().lower() for line in f if line.strip())

# Prepare inflect engine (may not be needed now)
p = inflect.engine()
lemmatizer = WordNetLemmatizer()

def is_plural(word):
    # Use NLTK POS tagging to determine if word is a plural noun or plural verb
    pos_tags = nltk.pos_tag([word])
    for token, tag in pos_tags:
        # Plural noun: NNS (common), NNPS (proper)
        if tag in ("NNS", "NNPS"):
            return True
        # 3rd person singular/plural verb: VBZ (e.g., runs, eats)
        if tag == "VBZ":
            return True
    return False

# Prepare log files
log_files = {
    'too_short': open(LOG_TOO_SHORT, 'w'),
    'plurals': open(LOG_PLURALS, 'w'),
    'not_scrabble': open(LOG_NOT_SCRABBLE, 'w'),
}

def log(reason, word):
    log_files[reason].write(word + '\n')

def main():
    with open(GOOGLE_WORDS_PATH, 'r') as f:
        words = [line.strip() for line in f if line.strip()]

    filtered_words = []
    words_by_length = defaultdict(list)

    for word in words:
        # 1. Filter out words of length <= 3
        if len(word) <= 3:
            log('too_short', word)
            continue
        # 2. Filter out plural nouns and plural verbs
        if is_plural(word):
            log('plurals', word)
            continue
        # 3. Filter out words not in SOWPODS
        if word.lower() not in sowpods_words:
            log('not_scrabble', word)
            continue
        # Passed all filters
        filtered_words.append(word)
        words_by_length[len(word)].append(word)

    # Write filtered word list for inspection
    with open(FILTERED_WORDS_PATH, 'w') as f:
        for word in filtered_words:
            f.write(word + '\n')

    # Write wordbank JSONs
    for length, words in words_by_length.items():
        out_path = os.path.join(WORDBANKS_DIR, f'{length}_letter_words.json')
        with open(out_path, 'w') as f:
            json.dump({
                'unused_words': words,
                'used_words': []
            }, f, indent=2)
    print(f"Generated wordbanks for lengths: {sorted(words_by_length.keys())}")
    print(f"Total filtered words: {len(filtered_words)}")

if __name__ == '__main__':
    try:
        main()
    finally:
        for lf in log_files.values():
            lf.close() 