import os
import re
import ssl
import json
import shutil
import urllib.request
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

# Directories to ensure
TARGET_DIRS = [
    "public/images/branding",
    "public/images/hero",
    "public/images/about",
    "public/images/projects",
    "public/images/projects/building-construction",
    "public/images/projects/environment-sustainability",
    "public/images/projects/smart-cities",
    "public/images/projects/urban-planning",
    "public/images/cel",
    "public/images/laboratory",
    "public/images/leadership",
    "public/images/team",
    "public/images/life-at-cube",
    "public/images/media/news",
    "public/images/media/events",
    "public/images/media/gallery",
    "public/images/clients",
    "public/images/partners",
    "public/images/icons",
]

for d in TARGET_DIRS:
    os.makedirs(d, exist_ok=True)

# 1. Copy user uploaded primary logo
USER_LOGO = r'C:/Users/HP/.gemini/antigravity/brain/60c85212-a88e-4d6b-8a2b-3c5032ffc998/.user_uploaded/media_1793690427257_baccdc75.png'
dest_logo = 'public/images/branding/cube-primary-logo.png'
if os.path.exists(USER_LOGO):
    shutil.copyfile(USER_LOGO, dest_logo)
    print(f"Copied user primary logo to {dest_logo}")

with open("discovered_images.json", "r", encoding="utf-8") as f:
    images_data = json.load(f)

def categorize_image(rel_src, sources):
    lower = rel_src.lower()
    fname = os.path.basename(lower)
    
    # Branding / logos
    if 'cubelogo' in fname or 'logo' in fname or 'emblem' in fname or 'footer-logo' in fname:
        return 'public/images/branding'
    
    # Hero / Slides
    if 'slides' in lower:
        return 'public/images/hero'
    
    # Clients
    if 'client' in lower:
        return 'public/images/clients'
        
    # Partners
    if 'partner' in lower:
        return 'public/images/partners'
        
    # Team
    if 'team' in lower:
        return 'public/images/team'
        
    # Leadership / Advisory
    if 'board-member' in lower or 'advisory-panel' in lower or 'leader' in lower:
        return 'public/images/leadership'
        
    # CEL / Laboratory
    if 'cel' in lower or 'lab' in lower:
        return 'public/images/cel'
        
    # Life at CUBE
    if 'life' in lower:
        return 'public/images/life-at-cube'
        
    # News / Media
    if 'news' in lower:
        return 'public/images/media/news'
        
    # Icons
    if 'icon' in lower or fname.endswith('.svg') or 'arrow' in fname:
        return 'public/images/icons'
        
    # Projects mapping based on path or sources
    if any('upt' in s for s in sources) or 'upt' in lower:
        return 'public/images/projects/urban-planning'
        
    if any('smart' in s for s in sources) or 'smart' in lower or 'tidel' in lower:
        return 'public/images/projects/smart-cities'
        
    if any('enviro' in s or 'water' in s or 'cauvery' in s or 'cmwssb' in s or 'klip' in s for s in sources) or 'en-' in lower or 'environment' in lower:
        return 'public/images/projects/environment-sustainability'
        
    if any(k in lower for k in ['iit', 'iiser', 'lhp', 'cpcl', 'hfapmay', 'sidco', 'jipmer', 'building', 'kmrl']):
        return 'public/images/projects/building-construction'
        
    # About
    if 'about' in lower:
        return 'public/images/about'
        
    return 'public/images/projects'

inventory = []

def download_one(item):
    url, data = item
    rel_src = data['rel_src']
    sources = data['sources']
    ext = data['ext']
    target_dir = categorize_image(rel_src, sources)
    
    # create clean filename
    parsed_path = urlparse(url).path
    raw_name = os.path.basename(parsed_path)
    clean_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', raw_name)
    
    # Avoid duplicate file collisions by prefixing subfolder if needed
    subfolder_tag = ""
    parts = rel_src.split('/')
    if len(parts) >= 2:
        subfolder_tag = re.sub(r'[^a-zA-Z0-9_]', '_', parts[-2]) + "_"
    if not clean_name.startswith(subfolder_tag):
        final_filename = f"{subfolder_tag}{clean_name}"
    else:
        final_filename = clean_name
        
    target_path = os.path.join(target_dir, final_filename).replace('\\', '/')
    
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            content = resp.read()
            with open(target_path, 'wb') as out_f:
                out_f.write(content)
                
            # Get dimensions
            width, height = 0, 0
            try:
                with Image.open(target_path) as img:
                    width, height = img.size
            except Exception:
                pass
                
            return {
                'original_url': url,
                'rel_src': rel_src,
                'local_path': '/' + target_path,
                'filename': final_filename,
                'category': target_dir.replace('public/images/', ''),
                'dimensions': f"{width}x{height}",
                'file_size_bytes': len(content),
                'file_type': ext.replace('.', '').upper(),
                'sources': sources,
                'status': 'Downloaded'
            }
    except Exception as e:
        return {
            'original_url': url,
            'rel_src': rel_src,
            'local_path': None,
            'filename': final_filename,
            'category': target_dir.replace('public/images/', ''),
            'dimensions': 'N/A',
            'file_size_bytes': 0,
            'file_type': ext.replace('.', '').upper(),
            'sources': sources,
            'status': f'Error: {str(e)}'
        }

print(f"Starting concurrent download of {len(images_data)} images...")
with ThreadPoolExecutor(max_workers=16) as executor:
    futures = [executor.submit(download_one, item) for item in images_data.items()]
    for i, fut in enumerate(as_completed(futures)):
        res = fut.result()
        inventory.append(res)
        if (i + 1) % 50 == 0:
            print(f"  Processed {i+1}/{len(images_data)} images...")

print(f"Finished downloads! Total processed: {len(inventory)}")

success_count = sum(1 for x in inventory if x['status'] == 'Downloaded')
print(f"Successfully downloaded: {success_count}/{len(inventory)}")

# Save inventory
with open("public/asset-inventory.json", "w", encoding="utf-8") as f:
    json.dump(inventory, f, indent=2)

with open("public/asset-inventory.md", "w", encoding="utf-8") as f:
    f.write("# CUBE Asset & Image Inventory\n\n")
    f.write(f"Total Discovered Assets: {len(inventory)}  \n")
    f.write(f"Successfully Downloaded Assets: {success_count}  \n\n")
    f.write("| Filename | Category | Dimensions | Type | Size | Local Path | Sources |\n")
    f.write("|---|---|---|---|---|---|---|\n")
    for item in sorted(inventory, key=lambda x: x['category']):
        sources_str = ", ".join(item['sources'][:2])
        f.write(f"| {item['filename']} | {item['category']} | {item['dimensions']} | {item['file_type']} | {item['file_size_bytes']}B | `{item['local_path']}` | {sources_str} |\n")

print("Saved asset-inventory.json and asset-inventory.md.")

