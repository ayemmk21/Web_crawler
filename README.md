# Oscar Award-Winning Films Web Crawler

## Project Overview

This project is a web crawler application that scrapes data about Academy Award–winning films from Wikipedia and displays the extracted information through a Flask web application.

The crawler collects structured film data using Python Regular Expressions (`re`) and stores the results in JSON format.

The Academy Awards are presented annually by the Academy of Motion Picture Arts and Sciences (AMPAS).

---

## Objectives

- Crawl at least 100 award-winning films
- Use at least 5 non-trivial regular expressions
- Extract structured information from each film page
- Store data in JSON format
- Display the data via a Flask web interface

---

## Data Source

Wikipedia:
https://en.wikipedia.org/wiki/List_of_Academy_Award–winning_films

Each film page is individually crawled to extract detailed information.

---

## Technologies Used

- Python 3
- Flask
- Requests
- BeautifulSoup
- Regular Expressions (`re`)
- JSON

---

## Extracted Data Fields

For each film, the crawler extracts:

- Film title
- Release date
- Running time
- Director
- Producer
- Starring actors
- Budget
- Box office revenue

These fields are extracted using multiple regular expression patterns applied to the film’s infobox HTML.

---

## Regex Usage

The project uses several non-trivial regex patterns, including:

-Reg 1
-Reg 2,etc

This ensures compliance with the assignment requirement of using at least five regular expressions.

---

## How to Run the Project

### Install dependencies


pip install -r requirements.txt


---

### Run the scraper


python scraper.py


This will:
- Crawl the list page
- Visit individual film pages
- Extract data using regex
- Save results into `data/oscar_films.json`

---

### Run the Flask application


python app.py


Open your browser and visit:


http://127.0.0.1:5000/


---

## Notes

- The crawler includes polite request delays to avoid overwhelming the server.
- Some films may not contain all fields (missing budget, etc.).
- HTML cleaning is performed using regex to remove tags before storing data.

---

## Preview

We will add screenshot later
