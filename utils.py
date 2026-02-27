import re


def clean_html(raw_text):
    """
    Remove HTML tags from extracted content.
    """
    if not raw_text:
        return "N/A"
    clean = re.sub(r"<.*?>", "", raw_text)
    return clean.strip()


def extract_with_regex(pattern, text, group=1, flags=0):
    """
    Safely extract first match using regex.
    Returns 'N/A' if no match found.
    """
    match = re.search(pattern, text, flags)
    if match:
        return match.group(group).strip()
    return "N/A"


def extract_all_with_regex(pattern, text, flags=0):
    """
    Extract all matches using regex.
    """
    return re.findall(pattern, text, flags)


def normalize_money(value):
    """
    Standardize financial values (remove spaces, normalize format).
    Example: "$ 200 million" -> "$200 million"
    """
    if value == "N/A":
        return value
    return re.sub(r"\s+", " ", value).strip()


def extract_release_date(html):
    """
    Extract release date using date regex.
    """
    pattern = r"\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b"
    return extract_with_regex(pattern, html)


def extract_running_time(html):
    """
    Extract running time like '195 minutes'
    """
    pattern = r"\d+\s+minutes"
    return extract_with_regex(pattern, html)


def extract_money_field(html, field_name):
    """
    Extract budget or box office using dynamic field name.
    """
    pattern = rf"{field_name}.*?\$\s?[\d,.]+\s?(million|billion)"
    return extract_with_regex(pattern, html, flags=re.DOTALL)