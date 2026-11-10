import os
import re
import json
from bs4 import BeautifulSoup

scraped_dir = "scraped_pages"

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# Let's inspect pages
pages = os.listdir(scraped_dir)
print(f"Total scraped pages to parse: {len(pages)}")

data_extracted = {
    'about': {},
    'vision_mission': {},
    'objectives': [],
    'core_values': [],
    'chairman_message': {},
    'ceo_message': {},
    'board_members': [],
    'advisory_panel': [],
    'team': [],
    'clients': [],
    'partners': [],
    'verticals': {},
    'projects': [],
    'news': [],
    'tenders': [],
    'careers': [],
    'contact': {}
}

# 1. Parse contact-us.html
if os.path.exists(os.path.join(scraped_dir, "contact-us.html")):
    with open(os.path.join(scraped_dir, "contact-us.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        # Extract text blocks
        data_extracted['contact'] = {
            'organization': 'Centre for Urbanization, Buildings & Environment (CUBE)',
            'affiliation': 'A Centre of Excellence - Government of Tamil Nadu & IIT Madras',
            'address': 'First Floor, IIT Madras Research Park, Kanagam Road, Taramani, Chennai, Tamil Nadu 600113',
            'email': 'contact@cubeiitm.org',
            'phone': '+91 44 6646 9800',
            'working_hours': 'Monday - Friday: 9:00 AM - 5:30 PM',
            'raw_text': clean_text(soup.get_text())
        }

# 2. Parse about.html
if os.path.exists(os.path.join(scraped_dir, "about.html")):
    with open(os.path.join(scraped_dir, "about.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        paragraphs = [p.get_text(strip=True) for p in soup.find_all('p') if len(p.get_text(strip=True)) > 40]
        data_extracted['about']['paragraphs'] = paragraphs

# 3. Parse vision.html
if os.path.exists(os.path.join(scraped_dir, "vision.html")):
    with open(os.path.join(scraped_dir, "vision.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        paragraphs = [p.get_text(strip=True) for p in soup.find_all(['p', 'h3', 'h4', 'li']) if len(p.get_text(strip=True)) > 20]
        data_extracted['vision_mission']['text'] = paragraphs

# 4. Parse objectives.html
if os.path.exists(os.path.join(scraped_dir, "objectives.html")):
    with open(os.path.join(scraped_dir, "objectives.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        data_extracted['objectives'] = [clean_text(li.get_text()) for li in soup.find_all(['li', 'p']) if len(clean_text(li.get_text())) > 25]

# 5. Parse core-values.html
if os.path.exists(os.path.join(scraped_dir, "core-values.html")):
    with open(os.path.join(scraped_dir, "core-values.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        data_extracted['core_values'] = [clean_text(li.get_text()) for li in soup.find_all(['li', 'h4', 'p']) if len(clean_text(li.get_text())) > 15]

# 6. Parse chairman-message.html
if os.path.exists(os.path.join(scraped_dir, "chairman-message.html")):
    with open(os.path.join(scraped_dir, "chairman-message.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        data_extracted['chairman_message'] = {
            'paragraphs': [p.get_text(strip=True) for p in soup.find_all('p') if len(p.get_text(strip=True)) > 30]
        }

# 7. Parse ceo-message.html
if os.path.exists(os.path.join(scraped_dir, "ceo-message.html")):
    with open(os.path.join(scraped_dir, "ceo-message.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        data_extracted['ceo_message'] = {
            'paragraphs': [p.get_text(strip=True) for p in soup.find_all('p') if len(p.get_text(strip=True)) > 30]
        }

# 8. Parse board-member.html
if os.path.exists(os.path.join(scraped_dir, "board-member.html")):
    with open(os.path.join(scraped_dir, "board-member.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        # board members often in team-block or card
        cards = soup.find_all('div', class_=re.compile(r'team|inner-box|col-'))
        members = []
        for c in cards:
            name_el = c.find(['h3', 'h4', 'h5'])
            desig_el = c.find(['span', 'p'])
            img_el = c.find('img')
            if name_el and desig_el:
                name = name_el.get_text(strip=True)
                desig = desig_el.get_text(strip=True)
                img = img_el.get('src') if img_el else ''
                if name and len(name) > 3 and name not in [m['name'] for m in members]:
                    members.append({'name': name, 'designation': desig, 'image': img})
        data_extracted['board_members'] = members

# 9. Parse advisory-panel.html
if os.path.exists(os.path.join(scraped_dir, "advisory-panel.html")):
    with open(os.path.join(scraped_dir, "advisory-panel.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        cards = soup.find_all('div', class_=re.compile(r'team|inner-box|col-'))
        panel = []
        for c in cards:
            name_el = c.find(['h3', 'h4', 'h5'])
            desig_el = c.find(['span', 'p'])
            img_el = c.find('img')
            if name_el and desig_el:
                name = name_el.get_text(strip=True)
                desig = desig_el.get_text(strip=True)
                img = img_el.get('src') if img_el else ''
                if name and len(name) > 3 and name not in [p['name'] for p in panel]:
                    panel.append({'name': name, 'designation': desig, 'image': img})
        data_extracted['advisory_panel'] = panel

# 10. Parse our-team.html
if os.path.exists(os.path.join(scraped_dir, "our-team.html")):
    with open(os.path.join(scraped_dir, "our-team.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        cards = soup.find_all('div', class_=re.compile(r'team|inner-box|col-'))
        team = []
        for c in cards:
            name_el = c.find(['h3', 'h4', 'h5'])
            desig_el = c.find(['span', 'p'])
            img_el = c.find('img')
            if name_el:
                name = name_el.get_text(strip=True)
                desig = desig_el.get_text(strip=True) if desig_el else ''
                img = img_el.get('src') if img_el else ''
                if name and len(name) > 3 and name not in [t['name'] for t in team]:
                    team.append({'name': name, 'designation': desig, 'image': img})
        data_extracted['team'] = team

# 11. Parse projects
# We will inspect all project files
project_pages = [p for p in pages if any(p.startswith(x) for x in ['upt', 'lhp', 'cpcl', 'iit-', 'iiser-', 'hfapmay', 'kmrl', 'tidel', 'jipmer', 'koratur', 'sidco', 'ashiana', 'caterpillar', 'cauvery', 'cmwssb', 'hyundai', 'Kilambakkam', 'KLIPSTP', 'Kuthambakkam', 'Madhavaram', 'mahindara', 'namakkal', 'rajapalayam', 'royal', 'vellore', 'structual'])]

projects_list = []
for p_file in project_pages:
    with open(os.path.join(scraped_dir, p_file), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
        title_el = soup.find(['h2', 'h1', 'h3'])
        title = title_el.get_text(strip=True) if title_el else p_file.replace('.html', '').replace('-', ' ').title()
        
        # text content
        paragraphs = [clean_text(p.get_text()) for p in soup.find_all('p') if len(clean_text(p.get_text())) > 30]
        
        # images
        imgs = [img.get('src') for img in soup.find_all('img') if img.get('src') and not any(k in img.get('src').lower() for k in ['logo', 'icon', 'delete'])]
        
        slug = p_file.replace('.html', '').lower()
        
        # Determine category
        category = "Building & Construction"
        if 'upt' in slug:
            category = "Urban Planning & Transportation"
        elif any(k in slug for k in ['water', 'cauvery', 'cmwssb', 'klip', 'enviro', 'koratur', 'arungulam', 'kalanivasal', 'saf']):
            category = "Environment & Sustainability"
        elif any(k in slug for k in ['smart', 'tidel', 'jammu', 'caterpillar', 'mahindara']):
            category = "Smart Cities"
            
        projects_list.append({
            'slug': slug,
            'title': title,
            'category': category,
            'file': p_file,
            'description': paragraphs[0] if paragraphs else "Applied engineering and infrastructure consultancy project executed by CUBE IIT Madras.",
            'details': paragraphs,
            'images': imgs
        })

data_extracted['projects'] = projects_list

with open("extracted_data.json", "w", encoding="utf-8") as f:
    json.dump(data_extracted, f, indent=2)

print(f"Extraction complete:")
print(f" - Board members: {len(data_extracted['board_members'])}")
print(f" - Advisory panel: {len(data_extracted['advisory_panel'])}")
print(f" - Team members: {len(data_extracted['team'])}")
print(f" - Projects: {len(data_extracted['projects'])}")
print(f" - About paragraphs: {len(data_extracted['about'].get('paragraphs', []))}")

