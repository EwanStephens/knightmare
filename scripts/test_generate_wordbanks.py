import unittest
import nltk
from generate_wordbanks import is_plural

# Ensure NLTK data is downloaded for tests
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

class TestIsPlural(unittest.TestCase):
    def test_singular_nouns(self):
        singular_nouns = [
            'cat', 'dog', 'house', 'child', 'person', 'analysis',
            'bus', 'glass', 'kiss', 'class', 'dress', 'boss', 'lens', 'gas', 'bonus', 'campus', 'focus', 'genius', 'iris', 'thesis', 'crisis', 'basis', 'oasis', 'octopus', 'virus'
        ]
        for word in singular_nouns:
            with self.subTest(word=word):
                self.assertFalse(is_plural(word), f"{word} should not be detected as plural")

    def test_plural_nouns(self):
        plural_nouns = ['cats', 'dogs', 'houses', 'children', 'people', 'analyses', 'buses', 'glasses', 'kisses', 'classes', 'dresses', 'bosses', 'lenses', 'gases', 'bonuses', 'campuses', 'focuses', 'geniuses', 'irises', 'theses', 'crises', 'bases', 'oases', 'octopuses', 'viruses']
        for word in plural_nouns:
            with self.subTest(word=word):
                self.assertTrue(is_plural(word), f"{word} should be detected as plural")

    def test_adjectives(self):
        adjectives = ['happy', 'blue', 'quick', 'tall', 'beautiful']
        for word in adjectives:
            with self.subTest(word=word):
                self.assertFalse(is_plural(word), f"{word} (adjective) should not be detected as plural")

    def test_adverbs(self):
        adverbs = ['quickly', 'happily', 'slowly', 'badly', 'well']
        for word in adverbs:
            with self.subTest(word=word):
                self.assertFalse(is_plural(word), f"{word} (adverb) should not be detected as plural")

    def test_singular_verbs(self):
        singular_verbs = ['run', 'ran', 'eat', 'ate', 'walk', 'walked', 'talk', 'talked', 'see', 'saw', 'go', 'went', 'be', 'was', 'is', 'am', 'are', 'were', 'has', 'had']
        for word in singular_verbs:
            with self.subTest(word=word):
                self.assertFalse(is_plural(word), f"{word} (singular verb) should not be detected as plural")

    def test_plural_verbs(self):
        plural_verbs = ['runs', 'eats', 'walks', 'talks', 'sees', 'goes', 'does', 'has', 'sings', 'brings', 'flies', 'tries', 'cries', 'studies', 'watches', 'fixes', 'teaches', 'pushes', 'catches', 'passes']
        for word in plural_verbs:
            with self.subTest(word=word):
                self.assertTrue(is_plural(word), f"{word} (plural verb) should be detected as plural")

if __name__ == '__main__':
    unittest.main() 