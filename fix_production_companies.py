import json
import re
import time
from extractor import extract_film_data

DATA_PATH = 'data/data.json'

def is_suspicious_production_companies(companies):
    if not companies or companies == 'N/A':
        return False
    return bool(re.search(r'\[|\]', companies))

with open(DATA_PATH, encoding='utf-8') as f:
    movies = json.load(f)

suspicious = [(i, m) for i, m in enumerate(movies) if is_suspicious_production_companies(m.get('production_companies'))]
print(f"Found {len(suspicious)} movies with suspicious production companies:")
for _, m in suspicious:
    print(f"  {m['title']} ({m['year']}): {m['production_companies']}")

print()
for i, (idx, movie) in enumerate(suspicious, 1):
    print(f"[{i}/{len(suspicious)}] Re-scraping {movie['title']}...", end=" ")
    try:
        extracted = extract_film_data(movie['url'])
        if extracted and extracted.get('production_companies') and extracted['production_companies'] != 'N/A':
            movies[idx]['production_companies'] = extracted['production_companies']
            print(f"✓ {extracted['production_companies']}")
        else:
            print("— no change")
    except Exception as e:
        print(f"✗ {e}")
    if i < len(suspicious):
        time.sleep(1)

with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(movies, f, indent=2, ensure_ascii=False)

print("\nDone. data.json updated.")
