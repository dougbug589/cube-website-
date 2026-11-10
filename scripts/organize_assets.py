import os
import glob
from PIL import Image

src_root = r"public\images"
dest_root = r"public\assets"

category_map = {
    "branding": "logo",
    "hero": "hero",
    "projects": "projects",
    "cel": "cel",
    "laboratory": "cel",
    "team": "team",
    "leadership": "leadership",
    "life-at-cube": "gallery",
    "media": "news",
    "clients": "clients",
    "partners": "partners",
    "about": "verticals"
}

os.makedirs(dest_root, exist_ok=True)
for cat in set(category_map.values()):
    os.makedirs(os.path.join(dest_root, cat), exist_ok=True)

manifest_lines = [
    "# ASSETS MANIFEST - CUBE DIGITAL EXPERIENCE 2.0",
    "Source: Official CUBE (https://cubeiitm.org/) & Verified Institutional Assets",
    "",
    "| Asset Path | Category | Dimensions | File Size (KB) |",
    "| :--- | :--- | :--- | :--- |"
]

all_files = glob.glob(os.path.join(src_root, "**", "*.*"), recursive=True)
count = 0

for file_path in all_files:
    rel_path = os.path.relpath(file_path, src_root)
    parts = rel_path.split(os.sep)
    top_folder = parts[0]
    target_folder = category_map.get(top_folder, "gallery")
    
    filename = os.path.basename(file_path)
    target_path = os.path.join(dest_root, target_folder, filename)
    
    # Copy file if not exists
    if not os.path.exists(target_path):
        try:
            with open(file_path, 'rb') as fsrc:
                with open(target_path, 'wb') as fdst:
                    fdst.write(fsrc.read())
        except Exception:
            continue

    # Get dimensions
    dim = "N/A"
    try:
        with Image.open(file_path) as img:
            dim = f"{img.width}x{img.height}"
    except Exception:
        pass
    
    size_kb = round(os.path.getsize(file_path) / 1024, 1)
    clean_target = "/assets/" + target_folder + "/" + filename
    manifest_lines.append(f"| `{clean_target}` | {target_folder.upper()} | {dim} | {size_kb} KB |")
    count += 1

manifest_path = os.path.join(dest_root, "MANIFEST.md")
with open(manifest_path, "w", encoding="utf-8") as f:
    f.write("\n".join(manifest_lines))

print(f"Organized {count} assets into /public/assets/ and generated MANIFEST.md")

