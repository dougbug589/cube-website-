import re

with open('src/data/projects.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Find featured projects
matches = re.findall(r'\{\s*"slug":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"category":\s*"([^"]+)",.*?heroImage":\s*"([^"]+)",.*?featured":\s*(true|false)', text, re.S)

print("Featured projects:")
for slug, title, cat, hero, feat in matches:
    if feat == 'true':
        print(f" - {slug}: {title[:40]} | Hero: {hero}")

