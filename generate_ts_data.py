import os
import re
import json

os.makedirs("src/data", exist_ok=True)
os.makedirs("src/types", exist_ok=True)

with open("extracted_data.json", "r", encoding="utf-8") as f:
    extracted = json.load(f)

with open("public/asset-inventory.json", "r", encoding="utf-8") as f:
    inventory = json.load(f)

# Build a lookup from original url / rel_src to local_path
img_map = {}
for item in inventory:
    if item['status'] == 'Downloaded':
        img_map[item['rel_src']] = item['local_path']
        img_map[item['original_url']] = item['local_path']

def get_img(src, default=''):
    if not src:
        return default
    if src in img_map:
        return img_map[src]
    # Check by filename
    base = os.path.basename(src)
    for k, v in img_map.items():
        if base in k or base in v:
            return v
    return default

# 1. Generate Types
types_content = """export interface NavigationItem {
  title: string;
  href: string;
  badge?: string;
  description?: string;
  children?: {
    title: string;
    href: string;
    description?: string;
    icon?: string;
  }[];
}

export interface Vertical {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  longDescription: string;
  heroImage: string;
  icon: string;
  color: string;
  capabilities: string[];
  keyServices: {
    title: string;
    description: string;
    items?: string[];
  }[];
  projectCount: number;
}

export interface Project {
  slug: string;
  title: string;
  category: 'Building & Construction' | 'Environment & Sustainability' | 'Smart Cities' | 'Urban Planning & Transportation';
  location?: string;
  client?: string;
  status?: string;
  year?: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  scopeOfWork?: string[];
  objectives?: string[];
  methodology?: string[];
  outcomes?: string[];
  featured?: boolean;
}

export interface Leader {
  name: string;
  role: string;
  category: 'Board Member' | 'IIT Advisory Panel' | 'Executive';
  organization?: string;
  department?: string;
  image: string;
  bio?: string;
}

export interface TeamMember {
  name: string;
  designation: string;
  department?: string;
  image?: string;
}

export interface ClientPartner {
  name: string;
  category: 'Government' | 'Public Sector' | 'Private' | 'Academic' | 'Partner';
  logo: string;
  description?: string;
}

export interface CELService {
  id: string;
  title: string;
  category: 'Water' | 'Wastewater' | 'Solid Waste' | 'Specialized';
  parameters: string[];
  equipment: string[];
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  image?: string;
  content: string[];
}

export interface TenderItem {
  id: string;
  title: string;
  refNo: string;
  publishDate: string;
  closingDate: string;
  status: 'Active' | 'Closed' | 'Archive';
  description: string;
  downloadUrl?: string;
}

export interface CareerItem {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  qualifications: string[];
  deadline: string;
}
"""

with open("src/types/index.ts", "w", encoding="utf-8") as f:
    f.write(types_content)

print("Created src/types/index.ts")

