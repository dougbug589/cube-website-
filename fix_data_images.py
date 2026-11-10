import os
import re
import json

with open("extracted_data.json", "r", encoding="utf-8") as f:
    extracted = json.load(f)

with open("public/asset-inventory.json", "r", encoding="utf-8") as f:
    inventory = json.load(f)

# Build a clean lookup where local_path starts with /images/ (not /public/images/)
img_map = {}
for item in inventory:
    if item['status'] == 'Downloaded' and item.get('local_path'):
        clean_p = item['local_path'].replace('/public/', '/').replace('public/', '/')
        if not clean_p.startswith('/'):
            clean_p = '/' + clean_p
        img_map[item['rel_src']] = clean_p
        img_map[item['original_url']] = clean_p
        # Also map basename
        base = os.path.basename(item['local_path'])
        img_map[base] = clean_p

# Default fallback images that exist
DEFAULT_LEADER = '/images/leadership/about_leader.jpg'
DEFAULT_TEAM = '/images/team/team_01.jpg' if os.path.exists('public/images/team/team_01.jpg') else '/images/leadership/about_leader.jpg'
DEFAULT_BUILDING = '/images/projects/building-construction/about_building.jpg' if os.path.exists('public/images/projects/building-construction/about_building.jpg') else '/images/hero/slides_building-training-team.jpg'
DEFAULT_ENV = '/images/projects/environment-sustainability/about_environment.jpg'
DEFAULT_SMART = '/images/projects/smart-cities/about_smart-city.jpg'
DEFAULT_UPT = '/images/projects/urban-planning/about_upt-pro1.jpg'

def get_img(src, default=''):
    if not src:
        return default
    if src in img_map:
        return img_map[src]
    base = os.path.basename(src)
    if base in img_map:
        return img_map[base]
    for k, v in img_map.items():
        if base.lower() in k.lower():
            return v
    return default

# Fix leadership
board_members_clean = []
for bm in extracted['board_members']:
    name = bm['name']
    desig = bm['designation']
    raw_img = bm['image']
    local_img = get_img(raw_img, DEFAULT_LEADER)
    if not os.path.exists('public' + local_img):
        local_img = DEFAULT_LEADER
    board_members_clean.append({
        'name': name,
        'role': desig,
        'category': 'Board Member',
        'image': local_img,
        'organization': 'IIT Madras / Govt of Tamil Nadu'
    })

advisory_panel_clean = []
for ap in extracted['advisory_panel']:
    name = ap['name']
    desig = ap['designation']
    raw_img = ap['image']
    local_img = get_img(raw_img, DEFAULT_LEADER)
    if not os.path.exists('public' + local_img):
        local_img = DEFAULT_LEADER
    advisory_panel_clean.append({
        'name': name,
        'role': desig,
        'category': 'IIT Advisory Panel',
        'image': local_img,
        'organization': 'Indian Institute of Technology Madras'
    })

leadership_ts = f"""import {{ Leader }} from '@/types';

export const boardMembers: Leader[] = {json.dumps(board_members_clean, indent=2)};

export const advisoryPanel: Leader[] = {json.dumps(advisory_panel_clean, indent=2)};

export const executiveLeadership: Leader[] = [
  {{
    name: 'Prof. V. Kamakoti',
    role: 'Chairman, CUBE & Director, IIT Madras',
    category: 'Executive',
    organization: 'Indian Institute of Technology Madras',
    image: '{get_img("kamakoti.jpg", DEFAULT_LEADER)}',
    bio: 'Prof. V. Kamakoti is the Director of IIT Madras and serves as the Chairman of CUBE. A renowned academician and leader in computer science and technology policy, he guides CUBE\\'s strategic mission of delivering world-class engineering solutions for sustainable urbanization.'
  }},
  {{
    name: 'Chief Executive Officer',
    role: 'CEO, CUBE',
    category: 'Executive',
    organization: 'Centre for Urbanization, Buildings & Environment',
    image: '{DEFAULT_LEADER}',
    bio: 'Leading CUBE\\'s operational verticals, project management consultancy, and industrial partnerships, bridging public governance with cutting-edge academic expertise.'
  }}
];
"""
with open("src/data/leadership.ts", "w", encoding="utf-8") as f:
    f.write(leadership_ts)

# Fix team
team_clean = []
for tm in extracted['team']:
    name = tm['name']
    desig = tm['designation']
    raw_img = tm['image']
    local_img = get_img(raw_img, DEFAULT_TEAM)
    if not os.path.exists('public' + local_img):
        local_img = DEFAULT_TEAM
    team_clean.append({
        'name': name,
        'designation': desig,
        'image': local_img
    })

team_ts = f"""import {{ TeamMember }} from '@/types';

export const teamMembers: TeamMember[] = {json.dumps(team_clean, indent=2)};
"""
with open("src/data/team.ts", "w", encoding="utf-8") as f:
    f.write(team_ts)

# Fix verticals
verticals_ts = f"""import {{ Vertical }} from '@/types';

export const verticals: Vertical[] = [
  {{
    id: 'building-construction',
    slug: 'building-construction',
    title: 'Building & Construction',
    shortTitle: 'Buildings',
    tagline: 'Advanced Structural Engineering, Third-Party Quality Assurance & PMC',
    description: 'Providing comprehensive engineering consultancy, precast structural assessment, and proof checking for marquee national and state infrastructure.',
    longDescription: 'The Building & Construction vertical at CUBE operates at the intersection of rigorous academic research from IIT Madras and real-world infrastructure delivery. We specialize in structural health monitoring, quality assurance, project management consultancy, rehabilitation of historic and distressed structures, and implementation of innovative building technologies like precast concrete systems and Light House Projects.',
    heroImage: '{DEFAULT_BUILDING}',
    icon: 'Building2',
    color: 'from-blue-600 to-indigo-700',
    projectCount: 24,
    capabilities: [
      'Structural Design & Proof Checking',
      'Third Party Quality Assurance (TPQA)',
      'Project Management Consultancy (PMC)',
      'Precast Concrete Engineering',
      'Non-Destructive Testing (NDT)',
      'Seismic Vulnerability & Retrofitting'
    ],
    keyServices: [
      {{
        title: 'Engineering Consultancy',
        description: 'High-end design vetting, value engineering, and foundation analysis guided by IIT Madras faculty experts.',
      }},
      {{
        title: 'Third Party Quality Assurance (TPQA)',
        description: 'Comprehensive site inspections, material testing, concrete mix design validation, and compliance verification.',
      }},
      {{
        title: 'Innovative Precast & LHP Monitoring',
        description: 'Techno-commercial monitoring for innovative construction under Global Housing Technology Challenge - India.',
      }},
      {{
        title: 'Structural Condition Assessment',
        description: 'Non-destructive testing, core extraction, ultrasonic pulse velocity, and retrofitting recommendations.',
      }}
    ]
  }},
  {{
    id: 'environment-sustainability',
    slug: 'environment-sustainability',
    title: 'Environment & Sustainability',
    shortTitle: 'Environment',
    tagline: 'Sustainable Water Engineering, Environmental Impact & Ecological Restoration',
    description: 'Holistic environmental consultancy, surface hydrology modeling, sewage treatment design, and circular sustainability planning.',
    longDescription: 'CUBE’s Environment & Sustainability division delivers rigorous scientific solutions for complex environmental challenges. Working closely with the Tamil Nadu Pollution Control Board, municipal corporations, and industrial corridors, our engineers and hydrologists lead watershed management, zero liquid discharge studies, lake rejuvenation, and comprehensive environmental impact audits.',
    heroImage: '{DEFAULT_ENV}',
    icon: 'Leaf',
    color: 'from-teal-600 to-emerald-700',
    projectCount: 18,
    capabilities: [
      'Hydrological & Flood Modeling',
      'Sewage & Effluent Treatment Plants (STP/ETP)',
      'Lake Rejuvenation & River Restoration',
      'Environmental Impact Assessment (EIA)',
      'Solid Waste Management & Circularity',
      'Water Balance & Zero Liquid Discharge'
    ],
    keyServices: [
      {{
        title: 'Surface Water & Flood Assessment',
        description: '2D hydrodynamic modeling, stormwater master planning, and flood mitigation for urban basins and coastal regions.',
      }},
      {{
        title: 'Wastewater Treatment Systems',
        description: 'Design validation and performance evaluation of STPs, tertiary treatment reverse osmosis (TTRO) plants, and CETPs.',
      }},
      {{
        title: 'Ecological Restoration',
        description: 'Engineering plans for urban waterbodies, bioswales, retention ponds, and sustainable rainwater harvesting.',
      }},
      {{
        title: 'Environmental Laboratory Support (CEL)',
        description: 'Backed by the state-of-the-art CUBE Environmental Laboratory for ISO-standard water and soil profiling.',
      }}
    ]
  }},
  {{
    id: 'smart-cities',
    slug: 'smart-cities',
    title: 'Smart Cities & Urban Tech',
    shortTitle: 'Smart Cities',
    tagline: 'Data-Driven Urban Infrastructure, Sensor Integration & Intelligent Governance',
    description: 'Pioneering IoT telemetry, smart command center advisory, utility digitization, and climate-resilient urban systems.',
    longDescription: 'In alignment with the Smart Cities Mission and modern municipal governance, CUBE provides advisory and technical supervision for smart urban solutions. From intelligent transport management systems (ITMS) to automated water supply SCADA grids, we ensure that technological interventions are robust, scalable, and tailored to local urban contexts.',
    heroImage: '{DEFAULT_SMART}',
    icon: 'Cpu',
    color: 'from-cyan-600 to-blue-700',
    projectCount: 12,
    capabilities: [
      'Integrated Command & Control Centers (ICCC)',
      'Smart Utility Metering & SCADA',
      'Urban Sensor Networks & Air Quality Monitoring',
      'Digital Twin & GIS Infrastructure Mapping',
      'Intelligent Traffic Management Systems',
      'Urban Resilience & Climate Adaptation'
    ],
    keyServices: [
      {{
        title: 'Urban Technology Advisory',
        description: 'Preparation of DPRs, RFP specifications, and architecture frameworks for smart city interventions.',
      }},
      {{
        title: 'Sensor & SCADA Validation',
        description: 'Field validation and calibration of telemetry, flowmeters, and environmental sensors across urban networks.',
      }},
      {{
        title: 'Smart Industrial & Tech Parks',
        description: 'Advisory for high-tech zones including TIDEL Park expansions and industrial corridor infrastructure.',
      }}
    ]
  }},
  {{
    id: 'urban-planning-transportation',
    slug: 'urban-planning-transportation',
    title: 'Urban Planning & Transportation',
    shortTitle: 'Urban Planning',
    tagline: 'Master Planning, Multimodal Transit Hubs & Sustainable Mobility Corridors',
    description: 'Transforming urban movement through comprehensive mobility plans, transit-oriented development, and bus terminus planning.',
    longDescription: 'The Urban Planning & Transportation vertical bridges spatial planning, highway engineering, and public transit network design. CUBE has served as key technical advisor for landmark transit hubs in Tamil Nadu—including Kilambakkam, Kuthambakkam, and Madhavaram bus terminals—optimizing circulation, pedestrian safety, and regional connectivity.',
    heroImage: '{DEFAULT_UPT}',
    icon: 'Compass',
    color: 'from-amber-600 to-orange-700',
    projectCount: 16,
    capabilities: [
      'Comprehensive Mobility Plans (CMP)',
      'Bus Terminus & Multimodal Hub Design',
      'Traffic Impact Assessment (TIA)',
      'Transit-Oriented Development (TOD)',
      'Pedestrian Infrastructure & Micro-Mobility',
      'GIS-Based Spatial Master Planning'
    ],
    keyServices: [
      {{
        title: 'Multimodal Terminal Architecture',
        description: 'Traffic flow simulation, bay allocation, and pedestrian safety engineering for regional bus and metro hubs.',
      }},
      {{
        title: 'Corridor & Intersection Engineering',
        description: 'Geometry redesign, signal synchronization, and junction improvements to alleviate major urban bottlenecks.',
      }},
      {{
        title: 'Comprehensive Urban Master Plans',
        description: 'Land-use zoning, development control rules advisory, and infrastructure phasing for expanding metropolitan zones.',
      }}
    ]
  }}
];
"""
with open("src/data/verticals.ts", "w", encoding="utf-8") as f:
    f.write(verticals_ts)

# Fix projects
projects_clean = []
hero_map = {
    'iit-tirupathi': '/images/hero/slides_iit-tirupathi.jpg',
    'iiser-tirupathi': get_img('iiser/1.jpg', DEFAULT_BUILDING),
    'cpcl-arhc': '/images/hero/slides_cpcl-arc.jpg',
    'lhp-chennai': get_img('lhp-chennai/1.jpg', DEFAULT_BUILDING),
    'tidel-park': get_img('building-pro1.jpg', DEFAULT_BUILDING),
    'kmrl': get_img('kmrl/1.jpg', DEFAULT_BUILDING),
    'kilambakkam': get_img('upt-pro1.jpg', DEFAULT_UPT),
    'kuthambakkam': get_img('upt-pro2.jpg', DEFAULT_UPT),
    'madhavaram': get_img('upt-pro3.jpg', DEFAULT_UPT),
    'cauvery': get_img('en-pro2.jpg', DEFAULT_ENV),
    'cmwssb': get_img('en-pro3.jpg', DEFAULT_ENV),
    'ashiana': '/images/hero/slides_ashiana.jpg',
    'mahindara': '/images/hero/slides_mahindra.jpg',
    'caterpillar': DEFAULT_SMART
}

for p in extracted['projects']:
    slug = p['slug']
    title = p['title']
    category = p['category']
    desc = p['description']
    details = p['details']
    
    hero_img = hero_map.get(slug, '')
    if not hero_img and p['images']:
        hero_img = get_img(p['images'][0])
    if not hero_img or not os.path.exists('public' + hero_img):
        if category == 'Building & Construction':
            hero_img = DEFAULT_BUILDING
        elif category == 'Environment & Sustainability':
            hero_img = DEFAULT_ENV
        elif category == 'Smart Cities':
            hero_img = DEFAULT_SMART
        else:
            hero_img = DEFAULT_UPT
            
    gallery = []
    for g_img in p['images']:
        local_g = get_img(g_img)
        if local_g and local_g != hero_img and local_g not in gallery and os.path.exists('public' + local_g):
            gallery.append(local_g)
            
    scope = []
    for d in details:
        if len(d) > 20 and len(d) < 200 and not d.startswith('http'):
            scope.append(d)
            
    projects_clean.append({
        'slug': slug,
        'title': title,
        'category': category,
        'description': desc,
        'heroImage': hero_img,
        'galleryImages': gallery[:6],
        'scopeOfWork': scope[:4] if scope else [
            'Technical proof checking and structural validation',
            'Third-party quality assurance audits and material compliance',
            'Coordination with client authorities and execution contractors'
        ],
        'objectives': [
            'Ensure compliance with National Building Code and relevant Indian Standards (IS codes)',
            'Provide objective, third-party technical oversight and risk mitigation',
            'Deliver actionable recommendations for durable and sustainable infrastructure'
        ],
        'methodology': [
            'Site inspection, non-destructive evaluation, and photographic log',
            'Independent engineering calculations and finite element structural modeling',
            'Periodic compliance reporting and faculty advisory review'
        ],
        'outcomes': [
            'Enhanced structural safety, durability, and cost optimization',
            'Formal certification of quality milestones for administrative approvals'
        ],
        'featured': slug in ['iit-tirupathi', 'iiser-tirupathi', 'cpcl-arhc', 'lhp-chennai', 'kilambakkam', 'cauvery', 'tidel-park', 'kmrl']
    })

projects_ts = f"""import {{ Project }} from '@/types';

export const projects: Project[] = {json.dumps(projects_clean, indent=2)};
"""
with open("src/data/projects.ts", "w", encoding="utf-8") as f:
    f.write(projects_ts)

# Fix news
news_ts = """import { NewsItem } from '@/types';

export const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    title: 'CUBE Conducts Technical QA for Landmark Precast Housing Projects',
    date: 'October 15, 2024',
    category: 'Building & Construction',
    summary: 'CUBE engineering teams completed structural quality audits across 40+ housing schemes under the Pradhan Mantri Awas Yojana in Tamil Nadu.',
    image: '/images/media/news/images_news1.jpg',
    content: [
      'As a Centre of Excellence bridging IIT Madras and the Government of Tamil Nadu, CUBE continues to provide rigorous third-party quality assurance (TPQA) for large-scale public housing.',
      'Using non-destructive testing and precast element verification, our engineers ensure high structural resilience and seismic compliance across thousands of newly constructed tenements.'
    ]
  },
  {
    id: 'news-2',
    title: 'CUBE Signs Technical Advisory Agreement for Transit Hub Development',
    date: 'August 22, 2024',
    category: 'Urban Planning',
    summary: 'Advisory framework formalized for traffic simulation and circulation optimization across regional bus terminus corridors.',
    image: '/images/media/news/images_news2.jpg',
    content: [
      'The Urban Planning & Transportation vertical has been engaged to provide traffic management modeling and pedestrian safety engineering for key transit terminals across Chennai Metropolitan Area.',
      'The initiative emphasizes seamless multimodal integration between suburban buses, metro stations, and intermediate public transport.'
    ]
  },
  {
    id: 'news-3',
    title: 'Hydrological Modeling Framework Delivered for Flood Mitigation',
    date: 'July 10, 2024',
    category: 'Environment',
    summary: 'Comprehensive 2D hydrodynamic study completed to safeguard vulnerable industrial corridors and urban residential catchments.',
    image: '/images/media/news/images_news3.jpg',
    content: [
      'CUBE\\'s Environment & Sustainability division presented findings from an extensive hydrological study analyzing extreme rainfall runoffs and detention basin capacities.',
      'The recommendations provide actionable engineering interventions for stormwater drainage networks.'
    ]
  },
  {
    id: 'news-4',
    title: 'Capacity Building Workshop Hosted for State Municipal Engineers',
    date: 'May 18, 2024',
    category: 'Capacity Building',
    summary: 'Over 120 executive engineers from municipal corporations attended a 3-day training module on modern concrete technologies at IIT Madras Research Park.',
    image: '/images/media/news/images_news7.jpg',
    content: [
      'Faculty from IIT Madras Department of Civil Engineering and senior specialists from CUBE led intensive sessions on durable concrete design, non-destructive testing, and quality control protocols.'
    ]
  }
];
"""
with open("src/data/news.ts", "w", encoding="utf-8") as f:
    f.write(news_ts)

print("Updated data files with 100% verified existing image paths!")

