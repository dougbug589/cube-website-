import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verticals as initialVerticals } from '@/data/verticals';
import { projects as initialProjects } from '@/data/projects';
import { newsItems as initialNews } from '@/data/news';
import { boardMembers, executiveLeadership, advisoryPanel } from '@/data/leadership';
import { clients as initialClients } from '@/data/clients';
import { celOverview } from '@/data/cel';
import { sanitizeStoreContent } from '@/lib/content';

const DATA_DIR = path.join(process.cwd(), 'data-store');
const DB_FILE = path.join(DATA_DIR, 'cube_cms_store.json');

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  /** Incremented on logout / password change to revoke every issued token. */
  sessionVersion?: number;
}

export interface CMSStore {
  users: UserProfile[];
  auditLogs: any[];
  news: any[];
  projects: any[];
  verticals: any[];
  announcements: any[];
  careers: any[];
  tenders: any[];
  celServices: any[];
  teamMembers: any[];
  clients: any[];
  gallery: any[];
  heroSlides: any[];
  enquiries: any[];
  jobApplications?: any[];
  careersPage?: Record<string, any>;
}

const MAX_AUDIT_LOGS = 5000;

let cachedStore: CMSStore | null = null;
let lastMtime: number = 0;

function ensureDataStore(): CMSStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const stat = fs.statSync(DB_FILE);
      if (cachedStore && stat.mtimeMs === lastMtime) {
        return cachedStore;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.enquiries) parsed.enquiries = [];
      cachedStore = parsed;
      lastMtime = stat.mtimeMs;
      return parsed;
    } catch (e) {
      console.error('Error reading JSON store, reinitializing...', e);
    }
  }

  // Initial Seed
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!defaultPassword) {
    throw new Error(
      'DEFAULT_ADMIN_PASSWORD must be set before the CMS store can be initialized.'
    );
  }
  const salt = bcrypt.genSaltSync(10);
  const initialSuperAdmin: UserProfile = {
    id: 'usr_super_admin_cube',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@cubeiitm.org',
    passwordHash: bcrypt.hashSync(defaultPassword, salt),
    fullName: 'CUBE Lead Administrator',
    role: 'super_admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const initialStore: CMSStore = {
    users: [initialSuperAdmin],
    auditLogs: [
      {
        id: 'log_init',
        userId: initialSuperAdmin.id,
        userEmail: initialSuperAdmin.email,
        action: 'SYSTEM_INITIALIZATION',
        resourceType: 'system',
        resourceId: 'root',
        timestamp: new Date().toISOString(),
      },
    ],
    news: initialNews.map((n) => ({
      ...n,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    projects: initialProjects.map((p) => ({
      ...p,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    verticals: initialVerticals.map((v) => ({
      ...v,
      status: 'published',
      updatedAt: new Date().toISOString(),
    })),
    announcements: [
      {
        id: 'ann_hiring_2026',
        title: 'WE ARE HIRING: Senior Structural & Environmental Engineers',
        subtitle: 'Centre of Excellence | IIT Madras & Govt of Tamil Nadu',
        description:
          'CUBE invites applications from passionate civil, structural, environmental engineers and urban planners to work on marquee state infrastructure projects.',
        type: 'hiring_popup',
        badge: 'WE ARE HIRING',
        ctaText: 'View Open Positions',
        ctaUrl: '/careers',
        imageUrl: '/images/hero/slides_building-training-team.jpg',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 1,
        frequency: 'once_per_session',
        targetPages: ['/'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ],
    careers: [
      {
        id: 'job_tpqa_sr_eng',
        title: 'Senior Structural QA/QC Engineer (TPQA)',
        department: 'Building & Construction Vertical',
        employmentType: 'Full-Time Contract',
        experience: '5+ Years in High-Rise & Precast Engineering',
        location: 'IIT Madras Research Park, Chennai',
        description: 'Lead independent third-party structural inspection, concrete durability testing, and design verification for government affordable housing and institutional projects.',
        qualifications: [
          'M.Tech / B.Tech in Structural / Civil Engineering from reputed institute',
          'Deep expertise in IS 456, IS 1893, IS 13920 and non-destructive testing (NDT)',
          'Experience in proof checking and site quality monitoring',
        ],
        applicationEmail: 'careers@cubeiitm.org',
        closingDate: '2026-12-31',
        isActive: true,
        status: 'published',
      },
      {
        id: 'job_env_hydrologist',
        title: 'Environmental Engineer & Hydrologist',
        department: 'Environment & Sustainability Vertical',
        employmentType: 'Full-Time',
        experience: '3-6 Years in Hydrodynamic Modeling & Water Quality',
        location: 'IIT Madras Research Park, Chennai',
        description: 'Conduct 2D flood simulations, STP/ETP design reviews, water balance audits, and lake rejuvenation feasibility studies across Tamil Nadu river basins.',
        qualifications: [
          'Master’s degree in Environmental Engineering / Water Resources',
          'Proficiency in HEC-RAS, GIS, and hydrodynamic software packages',
          'Laboratory testing acquaintance with CEL protocols',
        ],
        applicationEmail: 'careers@cubeiitm.org',
        closingDate: '2026-12-31',
        isActive: true,
        status: 'published',
      },
    ],
    tenders: [
      {
        id: 'tnd_cel_equip_2026',
        referenceNumber: 'CUBE/CEL/PROC/2026/04',
        title: 'Procurement of Inductively Coupled Plasma Mass Spectrometer (ICP-MS) for CEL Laboratory',
        description: 'Notice Inviting Tender for supply, installation, testing and commissioning of advanced elemental analysis instrument at CUBE Environmental Laboratory.',
        documentUrl: '#',
        publishedDate: '2026-10-15',
        closingDate: '2026-11-30',
        status: 'Active',
      },
      {
        id: 'tnd_ndt_ins_2026',
        referenceNumber: 'CUBE/ENG/TPQA/2026/08',
        title: 'Expression of Interest for Specialized Ultrasonic Pulse Velocity (UPV) Testing Services',
        description: 'Empanelment of specialized testing agencies for statewide bridge structural health monitoring.',
        documentUrl: '#',
        publishedDate: '2026-09-20',
        closingDate: '2026-11-20',
        status: 'Under Evaluation',
      },
    ],
    celServices: celOverview.testingServices.map((s, idx) => ({
      ...s,
      status: 'published',
    })),
    teamMembers: [
      ...executiveLeadership.map((l) => ({ ...l, category: 'leadership', status: 'published' })),
      ...boardMembers.map((b) => ({ ...b, category: 'board', status: 'published' })),
      ...advisoryPanel.map((a) => ({ ...a, category: 'advisory', status: 'published' })),
    ],
    clients: initialClients.map((c, i) => ({
      id: `client_${i + 1}`,
      name: c.name,
      type: 'client',
      logoUrl: c.logo,
      websiteUrl: '#',
      isActive: true,
      displayOrder: i,
    })),
    gallery: [
      {
        id: 'gal_1',
        title: 'CUBE Environmental Testing Facility Inauguration',
        category: 'Laboratory',
        imageUrl: '/images/cel/about_cel.jpg',
        status: 'published',
      },
      {
        id: 'gal_2',
        title: 'Engineers Capacity Building Session at IITM',
        category: 'Team',
        imageUrl: '/images/hero/slides_building-training-team.jpg',
        status: 'published',
      },
      {
        id: 'gal_3',
        title: 'Site Inspection of Marquee Precast Infrastructure',
        category: 'Projects',
        imageUrl: '/images/hero/slides_cpcl-arc.jpg',
        status: 'published',
      },
    ],
    heroSlides: [
      {
        id: 'slide_1',
        projectTag: 'IIT Tirupati Permanent Campus Engineering & PMC',
        location: 'IIT Tirupati, Andhra Pradesh',
        projectLink: '/projects/iit-tirupathi',
        imageUrl: '/images/hero/slides_iit-tirupathi.jpg',
        status: 'published',
        displayOrder: 1,
      },
      {
        id: 'slide_2',
        projectTag: 'CPCL ARHC Affordable Housing & Industrial Infrastructure',
        location: 'Chennai, Tamil Nadu',
        projectLink: '/projects/cpcl-arhc',
        imageUrl: '/images/hero/slides_cpcl-arc.jpg',
        status: 'published',
        displayOrder: 2,
      },
      {
        id: 'slide_3',
        projectTag: 'Pradhan Mantri Awas Yojana (PMAY) Structural Assurance',
        location: 'Statewide, Tamil Nadu',
        projectLink: '/projects',
        imageUrl: '/images/hero/slides_design-engineering-consultancy.jpg',
        status: 'published',
        displayOrder: 3,
      },
      {
        id: 'slide_4',
        projectTag: 'NICHE Industrial Park & Environmental Stormwater Engineering',
        location: 'SIPCOT Irungattukottai, Tamil Nadu',
        projectLink: '/projects/upt2',
        imageUrl: '/images/hero/slides_niche.jpg',
        status: 'published',
        displayOrder: 4,
      },
    ],
    enquiries: [
      {
        id: 'enq_sample_1',
        name: 'Government of Tamil Nadu - Municipal Administration',
        email: 'contact@cubeiitm.org',
        phone: '+91 44 6646 9800',
        organization: 'Directorate of Municipal Administration, TN',
        category: 'Technical Enquiry',
        subject: 'Third Party Quality Assurance (TPQA) for Water Supply Rejuvenation',
        message: 'Requesting expert proposal and technical scope from CUBE IIT Madras for comprehensive TPQA oversight across regional treatment plants and urban storm networks.',
        sourcePage: '/contact',
        isRead: false,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialStore, null, 2), 'utf-8');
  return initialStore;
}

export const getCMSStore = (): CMSStore => {
  return ensureDataStore();
};

export const saveCMSStore = (store: CMSStore) => {
  // Strip rich-text/font markup from every content collection before writing so
  // admin input can never alter the public site's typography or inject markup.
  sanitizeStoreContent(store);

  // Keep the audit trail bounded so every save (which rewrites the whole file)
  // stays fast as the site ages.
  if (Array.isArray(store.auditLogs) && store.auditLogs.length > MAX_AUDIT_LOGS) {
    store.auditLogs = store.auditLogs.slice(0, MAX_AUDIT_LOGS);
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // Write atomically so a crash mid-write cannot corrupt the store.
  const tempFile = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
  cachedStore = store;
  try {
    lastMtime = fs.statSync(DB_FILE).mtimeMs;
  } catch {}
};

// JWT Session Management
function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_JWT_SECRET is missing or too short. Set a unique 32+ character secret.'
    );
  }
  return secret;
}

export interface AdminSession {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AdminTokenPayload extends AdminSession {
  sv?: number;
}

// Short-lived token; the cookie itself is a browser-session cookie.
export const ADMIN_SESSION_TTL = '8h';

export function signAdminToken(session: AdminSession, sessionVersion = 0): string {
  const payload: AdminTokenPayload = { ...session, sv: sessionVersion };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ADMIN_SESSION_TTL });
}

export function verifyAdminToken(token: string): (AdminSession & { sv: number }) | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AdminTokenPayload;
    return { ...decoded, sv: decoded.sv ?? 0 };
  } catch (e) {
    return null;
  }
}

/**
 * Single source of truth for "is this token a live admin session?".
 * Verifies the signature, then re-checks the live store so deactivated users,
 * role changes, and logged-out (revoked) tokens lose access immediately.
 */
export function resolveAdminSession(token: string | undefined | null): AdminSession | null {
  if (!token) return null;
  const session = verifyAdminToken(token);
  if (!session) return null;

  const store = getCMSStore();
  const user = store.users.find((u) => u.id === session.userId);
  if (!user || !user.isActive) return null;
  if ((user.sessionVersion ?? 0) !== session.sv) return null;

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

/** Revoke every token issued to this user (used by logout). */
export function revokeAdminSessions(userId: string) {
  const store = getCMSStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return;
  user.sessionVersion = (user.sessionVersion ?? 0) + 1;
  saveCMSStore(store);
}

/** Version stamp of the CMS store; changes whenever any content is saved. */
export function getStoreVersion(): number {
  try {
    return fs.statSync(DB_FILE).mtimeMs;
  } catch {
    return 0;
  }
}
