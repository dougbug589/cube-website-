import os
import re
import ssl
import json
import urllib.request
from urllib.parse import urljoin, urlparse

BASE_URL = "https://cubeiitm.org/"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

PAGES_TO_VISIT = [
    "index.html",
    "about.html",
    "vision.html",
    "objectives.html",
    "core-values.html",
    "chairman-message.html",
    "ceo-message.html",
    "board-member.html",
    "advisory-panel.html",
    "our-team.html",
    "our-clients.html",
    "projects.html",
    "building-construction.html",
    "environment-sustainability.html",
    "smart-cities.html",
    "upt.html",
    "news.html",
    "tender.html",
    "career.html",
    "contact-us.html",
]

visited_pages = set()
page_contents = {}
all_images = {} # url: {source_pages: set(), local_path: ''}
all_links = set()

os.makedirs("scraped_pages", exist_ok=True)

def fetch_url(url):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            content_type = resp.headers.get('Content-Type', '')
            if 'text/html' in content_type or url.endswith('.html') or url.endswith('/'):
                return resp.read().decode('utf-8', errors='ignore')
            return resp.read()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

queue = list(PAGES_TO_VISIT)
while queue:
    rel_path = queue.pop(0)
    if rel_path in visited_pages:
        continue
    visited_pages.add(rel_path)
    
    url = urljoin(BASE_URL, rel_path)
    print(f"Fetching: {url}")
    html = fetch_url(url)
    if not html or not isinstance(html, str):
        continue
    
    page_contents[rel_path] = html
    with open(os.path.join("scraped_pages", rel_path.replace('/', '_')), 'w', encoding='utf-8') as f:
        f.write(html)
        
    # Extract links from page
    hrefs = re.findall(r'href=[\'"]([^\'"]+)', html)
    for h in hrefs:
        h = h.strip()
        if not h or h.startswith('#') or h.startswith('javascript:') or h.startswith('mailto:') or h.startswith('tel:'):
            continue
        parsed = urlparse(h)
        if (not parsed.netloc or 'cubeiitm.org' in parsed.netloc) and h.endswith('.html'):
            target_rel = os.path.basename(parsed.path)
            if target_rel and target_rel not in visited_pages and target_rel not in queue:
                queue.append(target_rel)
                
    # Extract images
    srcs = re.findall(r'src=[\'"]([^\'"]+)', html)
    bg_imgs = re.findall(r'url\([\'"]?([^\'")]+)', html)
    for s in srcs + bg_imgs:
        s = s.strip()
        if not s or s.startswith('data:'):
            continue
        ext = os.path.splitext(urlparse(s).path)[1].lower()
        if ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']:
            full_img_url = urljoin(url, s)
            if full_img_url not in all_images:
                all_images[full_img_url] = {
                    'rel_src': s,
                    'sources': set(),
                    'ext': ext
                }
            all_images[full_img_url]['sources'].add(rel_path)

print(f"\nDone crawling. Visited {len(visited_pages)} pages. Discovered {len(all_images)} unique images.")
with open("discovered_images.json", "w", encoding="utf-8") as f:
    json.dump({k: {'rel_src': v['rel_src'], 'ext': v['ext'], 'sources': list(v['sources'])} for k, v in all_images.items()}, f, indent=2)

