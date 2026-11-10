import json
from collections import Counter

with open("discovered_images.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total image URLs: {len(data)}")

folders = Counter()
for url, info in data.items():
    src = info['rel_src']
    parts = src.split('/')
    if len(parts) > 1:
        folders['/'.join(parts[:3])] += 1
    else:
        folders['root'] += 1

for folder, count in folders.most_common(25):
    print(f"  {folder}: {count}")

