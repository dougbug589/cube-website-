import os
import re

data_dir = "src/data"
all_files = [os.path.join(data_dir, f) for f in os.listdir(data_dir) if f.endswith('.ts')]

missing_total = set()
for filepath in all_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    paths = re.findall(r'["\'](/images/[^"\']+)["\']', content)
    for p in paths:
        full_p = os.path.join('public', p.lstrip('/'))
        if not os.path.exists(full_p):
            missing_total.add((p, filepath))

print(f"Total missing image references: {len(missing_total)}")
for p, f in sorted(missing_total):
    print(f"  {p} in {f}")

