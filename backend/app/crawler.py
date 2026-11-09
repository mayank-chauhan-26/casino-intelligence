import hashlib
import re
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup

from app.config import CRAWL_TIMEOUT_SECONDS, CRAWL_MAX_BYTES, CRAWL_USER_AGENT

def robots_allows(url: str) -> bool:
    parts = urlparse(url)
    robots_url = f"{parts.scheme}://{parts.netloc}/robots.txt"
    parser = RobotFileParser()
    parser.set_url(robots_url)
    try:
        # Fetch robots.txt explicitly so failure can be handled conservatively.
        response = httpx.get(
            robots_url,
            timeout=CRAWL_TIMEOUT_SECONDS,
            headers={"User-Agent": CRAWL_USER_AGENT},
            follow_redirects=True,
        )
        if response.status_code == 404:
            return True
        if response.status_code >= 400:
            return False
        parser.parse(response.text.splitlines())
        return parser.can_fetch(CRAWL_USER_AGENT, url)
    except httpx.HTTPError:
        return False

def fetch_page(url: str) -> tuple[str, str]:
    if not robots_allows(url):
        raise RuntimeError("Crawl skipped: robots.txt does not permit access or could not be checked.")
    with httpx.Client(
        timeout=CRAWL_TIMEOUT_SECONDS,
        follow_redirects=True,
        headers={"User-Agent": CRAWL_USER_AGENT, "Accept": "text/html,application/xhtml+xml"},
    ) as client:
        with client.stream("GET", url) as response:
            response.raise_for_status()
            content_type = response.headers.get("content-type", "").lower()
            if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
                raise RuntimeError(f"Skipped non-HTML response: {content_type or 'unknown content type'}")
            chunks = []
            size = 0
            for chunk in response.iter_bytes():
                size += len(chunk)
                if size > CRAWL_MAX_BYTES:
                    raise RuntimeError("Page exceeded configured crawl size limit.")
                chunks.append(chunk)
            raw = b"".join(chunks)
    soup = BeautifulSoup(raw, "html.parser")
    for element in soup(["script", "style", "noscript", "svg", "nav", "footer", "header"]):
        element.decompose()
    text = soup.get_text(" ", strip=True)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        raise RuntimeError("No readable page text was extracted.")
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return text[:200000], digest

def classify_change(before: str, after: str) -> str:
    sample = (before + " " + after).lower()
    rules = {
        "bonuses": ["bonus", "free spins", "welcome offer", "promo code", "match up to"],
        "payments": ["withdrawal", "deposit", "payment methods", "cashout", "payout"],
        "licensing": ["licensed", "licence", "license", "regulator", "gambling commission"],
        "terms": ["terms and conditions", "wagering requirement", "terms of use"],
        "responsible_gambling": ["responsible gambling", "self-exclusion", "gambling support"],
        "games": ["new games", "slots", "live casino", "game provider"],
    }
    for category, terms in rules.items():
        if any(term in sample for term in terms):
            return category
    return "general"
