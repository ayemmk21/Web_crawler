import requests
import re
from bs4 import BeautifulSoup
import time
import json
import os
from typing import List, Dict, Set
from extractor import extract_film_data  

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; OscarFilmScraper/1.0; +https://github.com/ayemmk21/Web_crawler)'
}


def collect_oscar_film_links() -> List[Dict[str, str]]:
    base_url = "https://en.wikipedia.org"
    page_url = f"{base_url}/wiki/List_of_Academy_Award%E2%80%93winning_films"

    print(f"Fetching {page_url}...")
    response = requests.get(page_url, headers=HEADERS, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, 'html.parser')

    seen_urls: Set[str] = set()
    film_links: List[Dict[str, str]] = []
    skip_prefixes = ("/wiki/Academy_Award", "/wiki/File:", "/wiki/Help:", "/wiki/Category:", "/wiki/Template:")

    tables = soup.find_all('table', {'class': 'wikitable'})
    print(f"Found {len(tables)} tables")

    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            cells = row.find_all('td')
            if not cells or len(cells) < 4:
                continue

            year = ''
            for cell in cells:
                text = cell.get_text(strip=True)
                if text.isdigit() and 1927 <= int(text) <= 2024:
                    year = text
                    break

            if not year or not (2014 <= int(year) <= 2024):
                continue

            first_cell = cells[0]
            link = first_cell.find('a', href=True)
            if not link:
                continue

            href = link.get('href', '')
            title = link.get_text(strip=True)

            if not href.startswith('/wiki/') or any(href.startswith(p) for p in skip_prefixes):
                continue

            full_url = base_url + href
            if full_url in seen_urls:
                continue

            awards = re.sub(r'\[.*?\]', '', cells[2].get_text(strip=True))
            nominations = re.sub(r'\[.*?\]', '', cells[3].get_text(strip=True))

            seen_urls.add(full_url)
            film_links.append({
                'url': full_url,
                'title': title,
                'year': year,
                'awards': awards,
                'nominations': nominations
            })

    print(f"Collected {len(film_links)} unique film links")
    if len(film_links) < 100:
        print(f"Warning: Only {len(film_links)} links collected (target: 100+)")
    else:
        print(f"✓ Target reached: {len(film_links)} links")

    return film_links


def download_film_pages(film_links: List[Dict[str, str]]) -> List[Dict]:
    films_data: List[Dict] = []

    for i, film in enumerate(film_links, 1):
        url = film['url']
        title = film['title']
        year = film['year']
        awards = film['awards']
        nominations = film['nominations']

        try:
            print(f"[{i}/{len(film_links)}] Fetching {title}...", end=" ")

            # Extract structured data directly — no HTML stored
            extracted = extract_film_data(url)

            if extracted is None:
                extracted = {}  # use empty dict if extraction failed

            films_data.append({
                'url':         url,
                'title':       title,
                'year':        year,
                'awards':      awards,
                'nominations': nominations,
                **extracted    
            })
            print("✓")

        except Exception as e:
            print(f"✗ Failed: {e}")
            continue

        time.sleep(1)

    print(f"\nSuccessfully processed {len(films_data)} films")
    return films_data


def save_films_data(films_data: List[Dict], output_path: str = 'data/oscar_films.json') -> None:
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(films_data, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(films_data)} films to {output_path}")


def main():
    film_links = collect_oscar_film_links()
    films_data = download_film_pages(film_links)
    save_films_data(films_data)


if __name__ == '__main__':
    main()