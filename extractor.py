import re
import requests
from bs4 import BeautifulSoup


def extract_poster(soup):
    # Get movie poster from infobox image
    infobox = soup.find('table', {'class': 'infobox'})
    if infobox:
        img = infobox.find('img')
        if img:
            src = img.get('src', '')
            if src.startswith('//'):
                src = 'https:' + src
            return src
    return None

def extract_director(text):
    match = re.search(r'Directed by\s*\n\s*(.+?)(?:\n[A-Z])', text, re.DOTALL)
    return match.group(1).strip() if match else "N/A"

def extract_starring(text):
    section = re.search(r'Starring\s*\n(.+?)(?:\nCinematography|\nProduction|\nDirected|\nMusic|\nEdited)', text, re.DOTALL)
    if section:
        names = []
        for line in section.group(1).splitlines():
            line = re.sub(r'\[.*?\]', '', line).strip()
            if len(line) > 2:
                names.append(line)
        return ', '.join(names)
    return "N/A"

def extract_production_companies(text):
    match = re.search(r'Production\s*companies?\s*\n\s*(.+?)(?:\n[A-Z][a-z])', text, re.DOTALL)
    if match:
        companies = []
        for line in match.group(1).splitlines():
            line = re.sub(r'\[.*?\]', '', line).strip()
            if len(line) > 2:
                companies.append(line)
        return ', '.join(companies)
    return "N/A"

def extract_distributor(text):
    section = re.search(r'Distributed by\s*\n(.+?)(?:\nRelease|\nRunning|\nCountry|\nLanguage)', text, re.DOTALL)
    if section:
        names = []
        for line in section.group(1).splitlines():
            line = re.sub(r'\[.*?\]', '', line) 
            line = line.strip()
            if len(line) > 2:  # skip single chars like '[', 'b', ']'
                names.append(line)
        return ', '.join(names)
    return "N/A"

def extract_running_time(text):
    match = re.search(r'(\d+)\s*minutes?', text)
    return f"{match.group(1)} minutes" if match else "N/A"

# Country extraction can be complex due to formatting, so we use another approach
def extract_country(text):
    match = re.search(r'Countr(?:y|ies)\s*\n\s*(.+?)(?:\nLanguage|\nBudget|\nBased|\nDistributed|\Z)', text, re.DOTALL)
    if match:
        countries = []
        for line in match.group(1).splitlines():
            line = re.sub(r'\[.*?\]', '', line).strip()
            if len(line) > 2:
                countries.append(line)
        return ', '.join(countries) if countries else "N/A"
    return "N/A"

def extract_budget(text):
    match = re.search(
        r'Budget\s*\n\s*((?:₩|\$|€|£)\s*[\d,.]+(?:\s*[–\-]\s*[\d,.]+)?\s*(?:million|billion|trillion|thousand)?)',
        text, re.IGNORECASE | re.DOTALL
    )
    if match:
        return re.sub(r'\s+', ' ', match.group(1)).strip()
    return "N/A"

def extract_box_office(text):
    match = re.search(r'Box\s*office\s*\n\s*((?:\$|₩|€|£)[\d,]+(?:\.\d+)?\s*(?:million|billion|thousand)?)', text, re.IGNORECASE)
    if match:
        return re.sub(r'\s+', ' ', match.group(1)).strip()
    return "N/A"

# Extracting language can be tricky due to formatting, so we use another approach
def extract_language(text):
    match = re.search(
        r'Language(?:s)?\s*\n\s*(.+?)(?:\nBudget|\nBox\s*office|\nRelease|\nCinematography|\nProduced|\nEdited|\nMusic|\nCountr|\Z)',
        text, re.DOTALL
    )
    if match:
        langs = []
        for line in match.group(1).splitlines():
            line = re.sub(r'\[.*?\]', '', line).strip()  # remove citations like [1], [a]
            if len(line) > 2:
                langs.append(line)
        return ', '.join(langs) if langs else "N/A"
    return "N/A"


def extract_film_data(url):
    HEADERS = {'User-Agent': 'Mozilla/5.0 (compatible; OscarFilmScraper/1.0)'}
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        infobox = soup.find('table', {'class': 'infobox'})
        if not infobox:
            return None

        text = infobox.get_text(separator='\n')

        return {
            'director':             extract_director(text),
            'starring':             extract_starring(text),
            'production_companies': extract_production_companies(text),
            'distributor':          extract_distributor(text),
            'running_time':         extract_running_time(text),
            'country':              extract_country(text),
            'budget':               extract_budget(text),
            'box_office':           extract_box_office(text),
            'language':             extract_language(text),
            'poster':               extract_poster(soup),   
        }
    except Exception as e:
        print(f"Error: {e}")
        return None


if __name__ == "__main__":
    test_films = [
        ("The Brutalist",  "https://en.wikipedia.org/wiki/The_Brutalist_(film)"),
        ("No Country for Old Men", "https://en.wikipedia.org/wiki/No_Country_for_Old_Men"),
        ("Parasite",       "https://en.wikipedia.org/wiki/Parasite_(2019_film)"),
    ]
    for title, url in test_films:
        print(f"\n{'='*50}\nTesting: {title}\n{'='*50}")
        data = extract_film_data(url)
        if data:
            for key, value in data.items():
                print(f"  {'✓' if value != 'N/A' else 'N/A'}  {key}: {value}")
        else:
            print("Failed")