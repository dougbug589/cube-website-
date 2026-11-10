import json

with open("src/data/projects.ts", "r", encoding="utf-8") as f:
    text = f.read()

# Load projects array
import re
match = re.search(r'export const projects: Project\[\] = (\[.*?\]);', text, re.S)
if not match:
    print("Could not find projects array")
    exit(1)

projects = json.loads(match.group(1))

# Exact live homepage featured projects
marquee_map = {
    'iit-tirupathi': {
        'title': 'Third Party Quality Assurance (TPQA) for IIT Tirupati Permanent Campus',
        'category': 'Building & Construction',
        'heroImage': '/images/projects/images_project.jpg',
        'featured': True,
        'description': 'Comprehensive third-party quality assurance audits, materials testing, and structural compliance monitoring for the permanent campus of IIT Tirupati, Andhra Pradesh.'
    },
    'reevaluation-scheme': {
        'title': 'Structural Vulnerability & Residual Life Assessment of 33 Tenements in Chennai',
        'category': 'Building & Construction',
        'heroImage': '/images/projects/images_project1.jpg',
        'featured': True,
        'description': 'Re-evaluation of structural vulnerability, destress mapping, non-destructive testing, and residual life assessment of thirty-three dilapidated tenements across Chennai.'
    },
    'koratur': {
        'title': 'Feasibility Study on Identification of Alternate Location for Parayan Kuttai',
        'category': 'Environment & Sustainability',
        'heroImage': '/images/projects/images_project2.jpg',
        'featured': True,
        'description': 'Hydrological and environmental feasibility study for waterbody identification, flood relief, and ecological restoration.'
    },
    'upt2': {
        'title': 'NICHE Industrial Park, SIPCOT Irungattukottai Infrastructure Planning',
        'category': 'Urban Planning & Transportation',
        'heroImage': '/images/projects/images_project3.jpg',
        'featured': True,
        'description': 'Designing with nature: sustainable infrastructure master planning, internal circulation, and stormwater drainage for the NICHE Industrial Park.'
    },
    'arungulam': {
        'title': 'Feasibility Study on the Relocation & Hydrological Restoration of Two Ponds',
        'category': 'Environment & Sustainability',
        'heroImage': '/images/projects/images_project4.jpg',
        'featured': True,
        'description': 'Surface water balance assessment, ecological relocation study, and rainwater harvesting potential analysis.'
    },
    'cpcl-arhc': {
        'title': 'PMC for Construction of Affordable Rental Housing Complex (ARHC), Manali',
        'category': 'Building & Construction',
        'heroImage': '/images/projects/building-construction/about_building-pro1.jpg',
        'featured': True,
        'description': 'Project management consultancy for construction of affordable rental housing complexes in Manali, Chennai for industrial workers.'
    },
    'lhp': {
        'title': 'Construction Monitoring of Light House Project (LHP) at Agartala',
        'category': 'Building & Construction',
        'heroImage': '/images/projects/building-construction/about_building-pro2.jpg',
        'featured': True,
        'description': 'Third party monitoring and quality assurance for innovative structural monolithic precast technology under Global Housing Technology Challenge.'
    },
    'cpcl-nagapattinam': {
        'title': 'Environmental Upgradation & Infrastructure Plan for Three Villages in Nagapattinam',
        'category': 'Building & Construction',
        'heroImage': '/images/projects/building-construction/about_building-pro3.jpg',
        'featured': True,
        'description': 'Rural infrastructure upgradation, community facilities, and structural assessment in coastal Nagapattinam district.'
    },
    'ashiana': {
        'title': 'Surface Water Management & Flood Inundation Study for Ashiana Subham',
        'category': 'Environment & Sustainability',
        'heroImage': '/images/projects/environment-sustainability/about_en-pro2.jpg',
        'featured': True,
        'description': 'Advanced 2D hydrodynamic flood inundation modeling and stormwater management plan for senior living campus.'
    },
    'iit-jammu': {
        'title': 'Surface Water Management Plan for IIT Jammu Campus',
        'category': 'Environment & Sustainability',
        'heroImage': '/images/projects/environment-sustainability/about_en-pro3.jpg',
        'featured': True,
        'description': 'Integrating inundation studies and terrain slope analysis into ecological campus development for IIT Jammu.'
    },
    'tidel-park': {
        'title': 'Smart Infrastructure & Telemetry Advisory for TIDEL Park Expansion',
        'category': 'Smart Cities',
        'heroImage': '/images/projects/smart-cities/about_smart-city.jpg',
        'featured': True,
        'description': 'Smart building automation, IoT environmental sensors, and energy efficiency verification for high-tech industrial parks.'
    },
    'kilambakkam': {
        'title': 'Multimodal Traffic Simulation & Circulation for Kilambakkam Bus Terminus',
        'category': 'Urban Planning & Transportation',
        'heroImage': '/images/projects/urban-planning/about_upt-pro1.jpg',
        'featured': True,
        'description': 'Traffic impact assessment, bay allocation, and pedestrian safety circulation modeling for Asia\'s largest bus terminus.'
    }
}

for p in projects:
    slug = p['slug']
    if slug in marquee_map:
        p.update(marquee_map[slug])
    else:
        p['featured'] = False

with open("src/data/projects.ts", "w", encoding="utf-8") as f:
    f.write(f"import {{ Project }} from '@/types';\n\nexport const projects: Project[] = {json.dumps(projects, indent=2)};\n")

print(f"Updated {len(projects)} projects in src/data/projects.ts with exact live website images and titles!")

