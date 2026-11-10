import os
import json
from bs4 import BeautifulSoup

# Inspect exact titles and content from scraped_pages
target_files = [
    ('iit-tirupathi.html', '/images/projects/images_project.jpg', 'Building & Construction'),
    ('reevaluation-scheme.html', '/images/projects/images_project1.jpg', 'Building & Construction'),
    ('koratur.html', '/images/projects/images_project2.jpg', 'Environment & Sustainability'),
    ('upt2.html', '/images/projects/images_project3.jpg', 'Urban Planning & Transportation'),
    ('arungulam.html', '/images/projects/images_project4.jpg', 'Environment & Sustainability'),
    ('cpcl-arhc.html', '/images/projects/building-construction/about_building-pro1.jpg', 'Building & Construction'),
    ('lhp.html', '/images/projects/building-construction/about_building-pro2.jpg', 'Building & Construction'),
    ('cpcl-nagapattinam.html', '/images/projects/building-construction/about_building-pro3.jpg', 'Building & Construction'),
    ('ashiana.html', '/images/projects/environment-sustainability/about_en-pro2.jpg', 'Environment & Sustainability'),
    ('iit-jammu.html', '/images/projects/environment-sustainability/about_en-pro3.jpg', 'Environment & Sustainability'),
    ('tidel-park.html', '/images/projects/smart-cities/about_smart-city.jpg', 'Smart Cities'),
    ('upt1.html', '/images/projects/urban-planning/about_upt-pro1.jpg', 'Urban Planning & Transportation'),
    ('upt3.html', '/images/projects/urban-planning/about_upt-pro3.jpg', 'Urban Planning & Transportation'),
]

for tf, img, cat in target_files:
    path = os.path.join('scraped_pages', tf)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            h2 = soup.find(['h2', 'h1', 'h3'])
            title = h2.get_text().strip() if h2 else tf
            ps = [p.get_text().strip() for p in soup.find_all('p') if len(p.get_text().strip()) > 30]
            print(f"File: {tf} -> Title: {title[:50]} | Img: {img}")

