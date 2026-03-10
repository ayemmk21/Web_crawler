import json
import re
import time
from extractor import extract_film_data

DATA_PATH = 'data/data.json'

def is_suspicious_budget(budget):
    if not budget or budget == 'N/A':
        return False
    # Has a currency symbol and digits but no unit — likely truncated
    has_currency = bool(re.search(r'[₩€£$]', budget))
    has_unit = bool(re.search(r'million|billion|thousand', budget, re.IGNORECASE))
    return has_currency and not has_unit

with open(DATA_PATH, encoding='utf-8') as f:
    movies = json.load(f)

suspicious = [(i, m) for i, m in enumerate(movies) if is_suspicious_budget(m.get('budget'))]
print(f"Found {len(suspicious)} movies with suspicious budgets:")
for _, m in suspicious:
    print(f"  {m['title']} ({m['year']}): {m['budget']}")

print()
for i, (idx, movie) in enumerate(suspicious, 1):
    print(f"[{i}/{len(suspicious)}] Re-scraping {movie['title']}...", end=" ")
    try:
        extracted = extract_film_data(movie['url'])
        if extracted and extracted.get('budget') and extracted['budget'] != 'N/A':
            movies[idx]['budget'] = extracted['budget']
            print(f"✓ {extracted['budget']}")
        else:
            print("— no change")
    except Exception as e:
        print(f"✗ {e}")
    if i < len(suspicious):
        time.sleep(1)

with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(movies, f, indent=2, ensure_ascii=False)

print("\nDone. data.json updated.")
