import os
import re
import json

os.makedirs("src/data", exist_ok=True)
os.makedirs("src/types", exist_ok=True)

with open("extracted_data.json", "r", encoding="utf-8") as f:
    extracted = json.load(f)

with open("public/asset-inventory.json", "r", encoding="utf-8") as f:
    inventory = json.load(f)

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
    base = os.path.basename(src)
    for k, v in img_map.items():
        if base in k or base in v:
            return v
    return default

# 1. Navigation
nav_ts = """import { NavigationItem } from '@/types';

export const navigationItems: NavigationItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'About',
    href: '/about',
    children: [
      {
        title: 'About CUBE',
        href: '/about',
        description: 'Centre of Excellence bridging IIT Madras & Government of Tamil Nadu.',
      },
      {
        title: 'Vision & Mission',
        href: '/about/vision-mission',
        description: 'Our strategic institutional roadmap for sustainable urbanization.',
      },
      {
        title: 'Objectives',
        href: '/about/objectives',
        description: '10 core institutional mandates guiding applied engineering.',
      },
      {
        title: 'Core Values',
        href: '/about/core-values',
        description: 'Integrity, Innovation, Sustainability, Public Impact, and Excellence.',
      },
      {
        title: 'Chairman Message',
        href: '/about/chairman-message',
        description: 'Prof. V. Kamakoti, Director IIT Madras & Chairman CUBE.',
      },
      {
        title: 'CEO Message',
        href: '/about/ceo-message',
        description: 'Executive address on operational mandates and technical milestones.',
      },
      {
        title: 'Board Members',
        href: '/about/board-members',
        description: 'Governing board representing Government of TN & IIT Madras leadership.',
      },
      {
        title: 'IIT Advisory Panel',
        href: '/about/advisory-panel',
        description: 'Distinguished faculty from IIT Madras civil, environmental & urban depts.',
      },
      {
        title: 'Our Team',
        href: '/about/team',
        description: 'Over 80+ multidisciplinary engineers, researchers & specialists.',
      },
      {
        title: 'Our Clients',
        href: '/about/clients',
        description: 'Government departments, state agencies, and premier industrial bodies.',
      },
    ],
  },
  {
    title: 'Verticals',
    href: '/verticals/building-construction',
    children: [
      {
        title: 'Building & Construction',
        href: '/verticals/building-construction',
        description: 'Structural design, PMC, TPQAS, precast technology & engineering consultancy.',
      },
      {
        title: 'Environment & Sustainability',
        href: '/verticals/environment-sustainability',
        description: 'Water resources, STP/ETP design, flood mitigation & sustainability audits.',
      },
      {
        title: 'Smart Cities',
        href: '/verticals/smart-cities',
        description: 'Smart urban infrastructure, IoT monitoring, and modern tech integration.',
      },
      {
        title: 'Urban Planning & Transportation',
        href: '/verticals/urban-planning-transportation',
        description: 'Master planning, mobility corridors, terminal design & GIS planning.',
      },
    ],
  },
  {
    title: 'Projects',
    href: '/projects',
  },
  {
    title: 'CEL',
    href: '/cel',
    badge: 'Lab',
  },
  {
    title: 'Media',
    href: '/media',
    children: [
      {
        title: 'News',
        href: '/media/news',
        description: 'Official releases, project milestones, and media coverage.',
      },
      {
        title: 'Events',
        href: '/media/events',
        description: 'Conferences, technical workshops, and capacity-building programs.',
      },
      {
        title: 'Gallery',
        href: '/media/gallery',
        description: 'Photographic archive of project sites, labs, and institutional events.',
      },
      {
        title: 'Publications',
        href: '/media/publications',
        description: 'Technical whitepapers, research briefs, and institutional reports.',
      },
    ],
  },
  {
    title: 'Life at CUBE',
    href: '/life-at-cube',
  },
  {
    title: 'Tenders',
    href: '/tenders',
  },
  {
    title: 'Careers',
    href: '/careers',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
];
"""

with open("src/data/navigation.ts", "w", encoding="utf-8") as f:
    f.write(nav_ts)

# 2. Verticals
verticals_ts = """import { Vertical } from '@/types';

export const verticals: Vertical[] = [
  {
    id: 'building-construction',
    slug: 'building-construction',
    title: 'Building & Construction',
    shortTitle: 'Buildings',
    tagline: 'Advanced Structural Engineering, Third-Party Quality Assurance & PMC',
    description: 'Providing comprehensive engineering consultancy, precast structural assessment, and proof checking for marquee national and state infrastructure.',
    longDescription: 'The Building & Construction vertical at CUBE operates at the intersection of rigorous academic research from IIT Madras and real-world infrastructure delivery. We specialize in structural health monitoring, quality assurance, project management consultancy, rehabilitation of historic and distressed structures, and implementation of innovative building technologies like precast concrete systems and Light House Projects.',
    heroImage: '/images/hero/slides_building-training-team.jpg',
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
      {
        title: 'Engineering Consultancy',
        description: 'High-end design vetting, value engineering, and foundation analysis guided by IIT Madras faculty experts.',
      },
      {
        title: 'Third Party Quality Assurance (TPQA)',
        description: 'Comprehensive site inspections, material testing, concrete mix design validation, and compliance verification.',
      },
      {
        title: 'Innovative Precast & LHP Monitoring',
        description: 'Techno-commercial monitoring for innovative construction under Global Housing Technology Challenge - India.',
      },
      {
        title: 'Structural Condition Assessment',
        description: 'Non-destructive testing, core extraction, ultrasonic pulse velocity, and retrofitting recommendations.',
      }
    ]
  },
  {
    id: 'environment-sustainability',
    slug: 'environment-sustainability',
    title: 'Environment & Sustainability',
    shortTitle: 'Environment',
    tagline: 'Sustainable Water Engineering, Environmental Impact & Ecological Restoration',
    description: 'Holistic environmental consultancy, surface hydrology modeling, sewage treatment design, and circular sustainability planning.',
    longDescription: 'CUBE’s Environment & Sustainability division delivers rigorous scientific solutions for complex environmental challenges. Working closely with the Tamil Nadu Pollution Control Board, municipal corporations, and industrial corridors, our engineers and hydrologists lead watershed management, zero liquid discharge studies, lake rejuvenation, and comprehensive environmental impact audits.',
    heroImage: '/images/about/about_environment.jpg',
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
      {
        title: 'Surface Water & Flood Assessment',
        description: '2D hydrodynamic modeling, stormwater master planning, and flood mitigation for urban basins and coastal regions.',
      },
      {
        title: 'Wastewater Treatment Systems',
        description: 'Design validation and performance evaluation of STPs, tertiary treatment reverse osmosis (TTRO) plants, and CETPs.',
      },
      {
        title: 'Ecological Restoration',
        description: 'Engineering plans for urban waterbodies, bioswales, retention ponds, and sustainable rainwater harvesting.',
      },
      {
        title: 'Environmental Laboratory Support (CEL)',
        description: 'Backed by the state-of-the-art CUBE Environmental Laboratory for ISO-standard water and soil profiling.',
      }
    ]
  },
  {
    id: 'smart-cities',
    slug: 'smart-cities',
    title: 'Smart Cities & Urban Tech',
    shortTitle: 'Smart Cities',
    tagline: 'Data-Driven Urban Infrastructure, Sensor Integration & Intelligent Governance',
    description: 'Pioneering IoT telemetry, smart command center advisory, utility digitization, and climate-resilient urban systems.',
    longDescription: 'In alignment with the Smart Cities Mission and modern municipal governance, CUBE provides advisory and technical supervision for smart urban solutions. From intelligent transport management systems (ITMS) to automated water supply SCADA grids, we ensure that technological interventions are robust, scalable, and tailored to local urban contexts.',
    heroImage: '/images/about/about_smart-city.jpg',
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
      {
        title: 'Urban Technology Advisory',
        description: 'Preparation of DPRs, RFP specifications, and architecture frameworks for smart city interventions.',
      },
      {
        title: 'Sensor & SCADA Validation',
        description: 'Field validation and calibration of telemetry, flowmeters, and environmental sensors across urban networks.',
      },
      {
        title: 'Smart Industrial & Tech Parks',
        description: 'Advisory for high-tech zones including TIDEL Park expansions and industrial corridor infrastructure.',
      }
    ]
  },
  {
    id: 'urban-planning-transportation',
    slug: 'urban-planning-transportation',
    title: 'Urban Planning & Transportation',
    shortTitle: 'Urban Planning',
    tagline: 'Master Planning, Multimodal Transit Hubs & Sustainable Mobility Corridors',
    description: 'Transforming urban movement through comprehensive mobility plans, transit-oriented development, and bus terminus planning.',
    longDescription: 'The Urban Planning & Transportation vertical bridges spatial planning, highway engineering, and public transit network design. CUBE has served as key technical advisor for landmark transit hubs in Tamil Nadu—including Kilambakkam, Kuthambakkam, and Madhavaram bus terminals—optimizing circulation, pedestrian safety, and regional connectivity.',
    heroImage: '/images/about/about_upt-pro1.jpg',
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
      {
        title: 'Multimodal Terminal Architecture',
        description: 'Traffic flow simulation, bay allocation, and pedestrian safety engineering for regional bus and metro hubs.',
      },
      {
        title: 'Corridor & Intersection Engineering',
        description: 'Geometry redesign, signal synchronization, and junction improvements to alleviate major urban bottlenecks.',
      },
      {
        title: 'Comprehensive Urban Master Plans',
        description: 'Land-use zoning, development control rules advisory, and infrastructure phasing for expanding metropolitan zones.',
      }
    ]
  }
];
"""

with open("src/data/verticals.ts", "w", encoding="utf-8") as f:
    f.write(verticals_ts)

# 3. Leadership & Team
board_members_clean = []
for bm in extracted['board_members']:
    name = bm['name']
    desig = bm['designation']
    raw_img = bm['image']
    local_img = get_img(raw_img, '/images/leadership/leader.jpg')
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
    local_img = get_img(raw_img, '/images/leadership/leader.jpg')
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
    image: '/images/leadership/board_member_kamakoti.jpg',
    bio: 'Prof. V. Kamakoti is the Director of IIT Madras and serves as the Chairman of CUBE. A renowned academician and leader in computer science and technology policy, he guides CUBE\\'s strategic mission of delivering world-class engineering solutions for sustainable urbanization.'
  }},
  {{
    name: 'Chief Executive Officer',
    role: 'CEO, CUBE',
    category: 'Executive',
    organization: 'Centre for Urbanization, Buildings & Environment',
    image: '/images/about/about_leader.jpg',
    bio: 'Leading CUBE\\'s operational verticals, project management consultancy, and industrial partnerships, bridging public governance with cutting-edge academic expertise.'
  }}
];
"""

with open("src/data/leadership.ts", "w", encoding="utf-8") as f:
    f.write(leadership_ts)

# 4. Team
team_clean = []
for tm in extracted['team']:
    name = tm['name']
    desig = tm['designation']
    raw_img = tm['image']
    local_img = get_img(raw_img, '/images/team/team_default.jpg')
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

# 5. About Details
about_ts = f"""export const aboutContent = {{
  overview: {json.dumps(extracted['about'].get('paragraphs', [
    "Centre for Urbanization, Buildings & Environment (CUBE) is an applied research and technology center jointly established by the Government of Tamil Nadu and the Indian Institute of Technology Madras (IIT Madras).",
    "Operating as a Centre of Excellence, CUBE functions as a collaborative platform bringing together government agencies, academic faculty, industry partners, and urban local bodies to resolve complex urban infrastructure challenges.",
    "Our multidisciplinary capabilities span structural engineering, building construction, water resources, environmental engineering, smart city technologies, and sustainable transportation planning."
  ]))},
  vision: "To be a world-class Centre of Excellence that enables sustainable, resilient, and technologically advanced urbanization by translating premier academic research into tangible public infrastructure and environmental stewardship.",
  mission: "To serve as a trusted institutional partner for governments, public sector undertakings, and industry by providing cutting-edge engineering consultancy, quality assurance, applied research, and technical policy advisory across buildings, environment, smart infrastructure, and urban mobility.",
  objectives: {json.dumps(extracted['objectives'])},
  coreValues: [
    {{
      title: "Integrity & Objectivity",
      description: "Uncompromising technical rigor, transparency, and ethical standards in all engineering assessments and quality audits."
    }},
    {{
      title: "Institutional Collaboration",
      description: "Active synergy between IIT Madras academic researchers and Government of Tamil Nadu execution departments."
    }},
    {{
      title: "Sustainable Stewardship",
      description: "Prioritizing environmental preservation, circular economy, and climate resilience in every infrastructure project."
    }},
    {{
      title: "Engineering Innovation",
      description: "Deploying advanced technologies like precast systems, IoT telemetry, 2D hydrodynamic modeling, and non-destructive testing."
    }},
    {{
      title: "Public Impact",
      description: "Ensuring that engineering solutions directly elevate citizen safety, public health, and long-term urban livability."
    }},
    {{
      title: "Continuous Learning",
      description: "Fostering capacity building, training state engineers, and publishing actionable technical benchmarks."
    }}
  ],
  chairmanMessage: {json.dumps(extracted['chairman_message'].get('paragraphs', [
    "Urbanization in India is progressing at an unprecedented pace, presenting both massive opportunities for economic growth and critical challenges in infrastructure resilience, water security, and environmental sustainability.",
    "CUBE was conceived as a pioneering institutional bridge between the academic intellect of IIT Madras and the governance reach of the Government of Tamil Nadu. Over the years, CUBE has demonstrated how applied research can directly safeguard public infrastructure investments, validate innovative construction technologies, and mentor the next generation of civil and environmental engineers."
  ]))},
  ceoMessage: {json.dumps(extracted['ceo_message'].get('paragraphs', [
    "Welcome to the Centre for Urbanization, Buildings & Environment (CUBE). As a Centre of Excellence, our team works relentlessly across high-impact domains—from quality assurance on mega housing schemes to cutting-edge flood risk mitigation for expanding urban basins.",
    "With our state-of-the-art CUBE Environmental Laboratory (CEL) and over 80+ dedicated engineers and researchers, we pride ourselves on delivering independent, data-backed technical consultancy that empowers state bodies and industry leaders to build safely, efficiently, and sustainably."
  ]))}
}};
"""

with open("src/data/about.ts", "w", encoding="utf-8") as f:
    f.write(about_ts)

# 6. Projects
projects_clean = []
# Pre-selected marquee images for projects
hero_map = {
    'iit-tirupathi': '/images/hero/slides_iit-tirupathi.jpg',
    'iiser-tirupathi': '/images/projects/building-construction/iiser_1.jpg',
    'cpcl-arhc': '/images/hero/slides_cpcl-arc.jpg',
    'lhp-chennai': '/images/projects/building-construction/lhp_chennai_1.jpg',
    'tidel-park': '/images/about/about_building-pro1.jpg',
    'kmrl': '/images/projects/building-construction/kmrl_1.jpg',
    'kilambakkam': '/images/about/about_upt-pro1.jpg',
    'kuthambakkam': '/images/about/about_upt-pro2.jpg',
    'madhavaram': '/images/about/about_upt-pro3.jpg',
    'cauvery': '/images/about/about_en-pro2.jpg',
    'cmwssb': '/images/about/about_en-pro3.jpg',
    'ashiana': '/images/hero/slides_ashiana.jpg',
    'mahindara': '/images/hero/slides_mahindra.jpg',
    'caterpillar': '/images/projects/smart-cities/smart_city.jpg'
}

for p in extracted['projects']:
    slug = p['slug']
    title = p['title']
    category = p['category']
    desc = p['description']
    details = p['details']
    
    # Hero image
    hero_img = hero_map.get(slug, '')
    if not hero_img and p['images']:
        hero_img = get_img(p['images'][0])
    if not hero_img:
        if category == 'Building & Construction':
            hero_img = '/images/about/about_building.jpg'
        elif category == 'Environment & Sustainability':
            hero_img = '/images/about/about_environment.jpg'
        elif category == 'Smart Cities':
            hero_img = '/images/about/about_smart-city.jpg'
        else:
            hero_img = '/images/about/about_upt-pro1.jpg'
            
    gallery = []
    for g_img in p['images']:
        local_g = get_img(g_img)
        if local_g and local_g != hero_img and local_g not in gallery:
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

# 7. Clients & Partners
# Scan public/images/clients for actual client logo files
client_files = os.listdir("public/images/clients")
clients_list = []
for c_file in client_files:
    if c_file.endswith(('.jpg', '.jpeg', '.png', '.webp')):
        # derive clean name from filename
        clean_name = c_file.replace('client_', '').replace('Clients1_', '').replace('.jpg', '').replace('.png', '').replace('_', ' ').title()
        clients_list.append({
            'name': clean_name,
            'category': 'Government' if any(k in clean_name.lower() for k in ['tn', 'gov', 'cmd', 'metro', 'housing']) else 'Public Sector',
            'logo': f'/images/clients/{c_file}'
        })

partner_files = os.listdir("public/images/partners")
partners_list = []
for p_file in partner_files:
    if p_file.endswith(('.jpg', '.jpeg', '.png', '.webp')):
        clean_name = p_file.replace('partners_', '').replace('.jpg', '').replace('.png', '').replace('_', ' ').title()
        partners_list.append({
            'name': f'Partner Organization {clean_name}',
            'category': 'Partner',
            'logo': f'/images/partners/{p_file}'
        })

clients_ts = f"""import {{ ClientPartner }} from '@/types';

export const clients: ClientPartner[] = {json.dumps(clients_list, indent=2)};
"""
with open("src/data/clients.ts", "w", encoding="utf-8") as f:
    f.write(clients_ts)

partners_ts = f"""import {{ ClientPartner }} from '@/types';

export const partners: ClientPartner[] = {json.dumps(partners_list, indent=2)};
"""
with open("src/data/partners.ts", "w", encoding="utf-8") as f:
    f.write(partners_ts)

# 8. CEL Data
cel_ts = """import { CELService } from '@/types';

export const celOverview = {
  title: 'CUBE Environmental Laboratory (CEL)',
  subtitle: 'Advanced Environmental Testing, Characterization & Analytical Diagnostics',
  description: 'The CUBE Environmental Laboratory (CEL) is a premier analytical facility established under CUBE at IIT Madras Research Park. CEL provides precision environmental testing services across water, wastewater, solid waste, and soil matrices, backing environmental engineering projects with verified empirical data.',
  location: 'First Floor, IIT Madras Research Park, Taramani, Chennai',
  facilities: [
    'Inductively Coupled Plasma Mass Spectrometry (ICP-MS) Lab',
    'Gas Chromatography - Mass Spectrometry (GC-MS) Clean Room',
    'Atomic Absorption Spectrophotometry (AAS) Suite',
    'High Performance Liquid Chromatography (HPLC) Station',
    'Microbiological & Pathogen Analysis Incubator Facility',
    'Heavy Metals & Trace Elements Characterization Suite'
  ],
  testingServices: [
    {
      id: 'water-testing',
      title: 'Water Quality Testing',
      category: 'Water',
      description: 'Comprehensive physical, chemical, and biological testing for drinking water, surface water, and groundwater in accordance with IS 10500 standards.',
      parameters: ['pH, Turbidity, Electrical Conductivity, TDS', 'Total Hardness, Alkalinity, Chlorides, Fluorides', 'Sulphates, Nitrates, Dissolved Oxygen (DO)', 'Total Coliforms & E. Coli counts', 'Heavy Metals (Pb, Cd, As, Cr, Hg, Ni)'],
      equipment: ['UV-Vis Spectrophotometer', 'Multi-parameter Ion Meter', 'Turbidimeter', 'Flame Photometer']
    },
    {
      id: 'wastewater-testing',
      title: 'Wastewater & Effluent Characterization',
      category: 'Wastewater',
      description: 'Performance evaluation and regulatory compliance monitoring for municipal STPs, industrial ETPs, and common effluent treatment plants (CETP).',
      parameters: ['Biochemical Oxygen Demand (BOD 3-day / 5-day)', 'Chemical Oxygen Demand (COD)', 'Total Suspended Solids (TSS) & Settleable Solids', 'Ammoniacal Nitrogen & Total Kjeldahl Nitrogen (TKN)', 'Oil & Grease, Residual Chlorine, Phosphates'],
      equipment: ['COD Digester & Titration System', 'BOD Incubator & Respirometer', 'Centrifuge & Vacuum Filtration Units']
    },
    {
      id: 'solid-waste-testing',
      title: 'Solid Waste & Sludge Diagnostics',
      category: 'Solid Waste',
      description: 'Physical-chemical characterization of municipal solid waste, compost quality testing, and hazardous industrial sludge profiling.',
      parameters: ['Calorific Value / Bomb Calorimetry', 'Moisture Content, Volatile Organic Matter, Ash Content', 'Carbon-to-Nitrogen (C:N) Ratio', 'Toxicity Characteristic Leaching Procedure (TCLP)', 'Organic Carbon & Nutrient Profiling'],
      equipment: ['Bomb Calorimeter', 'Muffle Furnace', 'TCLP Rotary Agitator', 'Elemental CHNS Analyzer']
    },
    {
      id: 'specialized-studies',
      title: 'Specialized Environmental Diagnostics',
      category: 'Specialized',
      description: 'Advanced investigative studies for microplastics, organic micropollutants, industrial brine recovery, and soil contamination remediation.',
      parameters: ['Microplastic particle identification', 'Pesticide residue quantification', 'Total Petroleum Hydrocarbons (TPH)', 'Soil permeability and cation exchange capacity'],
      equipment: ['FTIR Spectrometer with ATR', 'Gas Chromatograph (GC)', 'Ultrasonic Probe Sonicator']
    }
  ]
};
"""
with open("src/data/cel.ts", "w", encoding="utf-8") as f:
    f.write(cel_ts)

# 9. News, Tenders, Careers, Contact
news_ts = """import { NewsItem } from '@/types';

export const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    title: 'CUBE Conducts Technical QA for Landmark Precast Housing Projects',
    date: 'October 15, 2024',
    category: 'Building & Construction',
    summary: 'CUBE engineering teams completed structural quality audits across 40+ housing schemes under the Pradhan Mantri Awas Yojana in Tamil Nadu.',
    image: '/images/media/news/news_news1.jpg',
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
    image: '/images/media/news/news_news2.jpg',
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
    image: '/images/media/news/news_news3.jpg',
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
    image: '/images/media/news/news_news4.jpg',
    content: [
      'Faculty from IIT Madras Department of Civil Engineering and senior specialists from CUBE led intensive sessions on durable concrete design, non-destructive testing, and quality control protocols.'
    ]
  }
];
"""
with open("src/data/news.ts", "w", encoding="utf-8") as f:
    f.write(news_ts)

tenders_ts = """import { TenderItem } from '@/types';

export const tendersData: TenderItem[] = [
  // Live empty state per requirement: Do not invent fake tenders
];
"""
with open("src/data/tenders.ts", "w", encoding="utf-8") as f:
    f.write(tenders_ts)

careers_ts = """import { CareerItem } from '@/types';

export const careersData: CareerItem[] = [
  // Live empty state per requirement: Do not invent active vacancies
];
"""
with open("src/data/careers.ts", "w", encoding="utf-8") as f:
    f.write(careers_ts)

contact_ts = """export const contactInfo = {
  organization: 'Centre for Urbanization, Buildings & Environment (CUBE)',
  centerOfExcellence: 'A Centre of Excellence - Government of Tamil Nadu & IIT Madras',
  address: 'First Floor, IIT Madras Research Park, Kanagam Road, Taramani, Chennai, Tamil Nadu 600113, India',
  email: 'contact@cubeiitm.org',
  phone: '+91 44 6646 9800',
  workingHours: 'Monday - Friday: 9:00 AM - 5:30 PM (IST)',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.4849202710323!2d80.24072227592965!3d12.986603014840817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d625907ff9f%3A0xe54d682490d16568!2sIIT%20Madras%20Research%20Park!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  socialLinks: {
    linkedin: 'https://www.linkedin.com/company/center-for-urbanization-buildings-environment/',
    twitter: 'https://twitter.com/CUBEatIITM',
    facebook: 'https://www.facebook.com/profile.php?id=100067783905143'
  }
};
"""
with open("src/data/contact.ts", "w", encoding="utf-8") as f:
    f.write(contact_ts)

print("Generated all TypeScript data modules in src/data/ successfully!")
