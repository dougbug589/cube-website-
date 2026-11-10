import re
import os
import sys
import ssl
import json
import urllib.request
from urllib.parse import urljoin, urlparse

BASE_URL = "https://cubeiitm.org/"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

with open('index_dump.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Find all hrefs
hrefs = re.findall(r'href=[\'"]([^\'"]+)', index_html)
# Find all srcs
srcs = re.findall(r'src=[\'"]([^\'"]+)', index_html)
# Find background images
bg_imgs = re.findall(r'url\([\'"]?([^\'")]+)', index_html)

print("Hrefs found:", len(hrefs))
clean_links = set()
for h in hrefs:
    h = h.strip()
    if h.startswith('#') or h.startswith('javascript:') or h.startswith('mailto:') or h.startswith('tel:'):
        continue
    clean_links.add(h)

print("\nInternal/External Links in Homepage:")
for l in sorted(clean_links):
    print(" -", l)

all_images = set()
for s in srcs + bg_imgs:
    s = s.strip()
    ext = os.path.splitext(urlparse(s).path)[1].lower()
    if ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']:
        all_images.add(s)

print(f"\nImages found in Homepage: {len(all_images)}")
for img in sorted(all_images):
    print(" -", img)

