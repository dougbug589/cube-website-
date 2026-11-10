// Admin-editable content for the public /careers page.
// Safe to import from both server and client components (no Node APIs).

export const CAREER_BENEFIT_ICONS = [
  'award',
  'building',
  'globe',
  'briefcase',
  'sparkles',
  'users',
  'graduation',
  'flask',
] as const;

export type CareerBenefitIcon = (typeof CAREER_BENEFIT_ICONS)[number];

export interface CareerBenefit {
  icon: CareerBenefitIcon;
  title: string;
  description: string;
}

export interface CareersPageContent {
  header: {
    badge: string;
    title: string;
    description: string;
  };
  contactEmail: string;
  contactLabel: string;
  tabs: {
    openingsLabel: string;
    portalLabel: string;
  };
  emptyState: {
    title: string;
    description: string;
    buttonLabel: string;
  };
  talentCallout: {
    badge: string;
    heading: string;
    description: string;
    buttonLabel: string;
  };
  jobDetail: {
    howToApplyTitle: string;
    howToApplySteps: string[];
  };
  applicationForm: {
    badge: string;
    heading: string;
    defaultJobTitle: string;
    experienceOptions: string[];
    domainOptions: string[];
    coverNotePlaceholder: string;
    submitLabel: string;
    successTitle: string;
    successMessage: string;
  };
  benefits: {
    heading: string;
    subheading: string;
    items: CareerBenefit[];
  };
}

export const DEFAULT_CAREERS_PAGE: CareersPageContent = {
  header: {
    badge: 'Careers & Professional Development',
    title: 'Engineering Careers & Talent Portal',
    description:
      'Explore marquee state engineering openings or upload your CV to the CUBE Talent Network for direct IIT Madras faculty and project advisory consideration.',
  },
  contactEmail: 'careers@cubeiitm.org',
  contactLabel: 'Direct Recruitment Liaison',
  tabs: {
    openingsLabel: 'Active Openings',
    portalLabel: 'Upload Resume & Talent Network',
  },
  emptyState: {
    title: 'No Direct Vacancies Advertised Currently',
    description:
      'New mandates for structural QA, hydrodynamic modeling, and precast inspection open quarterly. You can submit your CV directly to our Talent Network.',
    buttonLabel: 'Upload Resume for Future Openings',
  },
  talentCallout: {
    badge: 'Join CUBE Talent Network',
    heading: "Didn't find a matching job role? Drop your resume.",
    description:
      'We maintain an active resume bank for senior civil advisors, environmental chemists, hydrologists, and GIS planners. Whenever state projects launch, our faculty committee reviews matching profiles directly.',
    buttonLabel: 'Upload Your Resume Now',
  },
  jobDetail: {
    howToApplyTitle: 'How to Apply',
    howToApplySteps: [
      'Click "Apply & Upload CV" below to open the application form.',
      'Fill in your details and upload your resume (PDF or DOCX, max 10MB).',
      'Our recruitment team and faculty committee will review your profile and contact shortlisted candidates.',
    ],
  },
  applicationForm: {
    badge: 'Candidate Application & CV Submission',
    heading: 'Submit Your Profile to CUBE Engineering',
    defaultJobTitle: 'General Engineering Talent Pool',
    experienceOptions: [
      '0-2 Years (Graduate / Junior)',
      '3-5 Years (Mid-Level Engineer)',
      '6-10 Years (Senior Engineer / Specialist)',
      '10+ Years (Principal / Project Director)',
    ],
    domainOptions: [
      'Building & Structural Engineering (PMC / TPQA)',
      'Environment & Sustainable Hydrology (CEL)',
      'Smart Cities & Urban IoT Telemetry',
      'Urban Planning & Multimodal Mobility',
      'CEL Testing & Chemical Diagnostics',
    ],
    coverNotePlaceholder:
      'Highlight your key achievements, state project experience, and software skills (e.g. ETABS, STAAD.Pro, Arc-GIS, HEC-RAS)...',
    submitLabel: 'Submit Profile & Resume',
    successTitle: 'Application & Resume Received!',
    successMessage:
      'Thank you for submitting your engineering profile to CUBE. Our recruitment team and faculty committee will review your qualifications against active project requirements.',
  },
  benefits: {
    heading: 'Career Growth & Institutional Mentorship',
    subheading:
      "Join Tamil Nadu's apex Centre of Excellence bridging academia and state infrastructure delivery.",
    items: [
      {
        icon: 'award',
        title: 'IIT Madras Faculty Direct Access',
        description:
          'Work closely with distinguished professors on state proof checking and applied research methodologies.',
      },
      {
        icon: 'building',
        title: 'Marquee State Projects',
        description:
          'Lead independent TPQA on multi-thousand unit housing, high-speed corridors, and river rejuvenation.',
      },
      {
        icon: 'globe',
        title: 'Advanced CEL Laboratories',
        description:
          'Access precision ICP-OES, non-destructive concrete diagnostics, and specialized testing at IITM Research Park.',
      },
    ],
  },
};

// Non-vertical units that also hire (CEL lab, administration).
export const EXTRA_CAREER_DEPARTMENTS = [
  'CUBE Environmental Laboratory (CEL)',
  'Admin & Operations',
];

export const DEFAULT_EMPLOYMENT_TYPES = [
  'Full-Time',
  'Full-Time Contract',
  'Part-Time',
  'Project Associate',
  'Project Engineer',
  'Project Scientist',
  'Research Fellow',
  'Consultant',
  'Visiting Expert',
  'Internship',
];

const uniq = (items: unknown[]) =>
  Array.from(
    new Set(items.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean))
  );

/**
 * Department choices for the admin job form: every published vertical
 * (as "<title> Vertical"), CEL and admin units, plus any department
 * already used by an existing job so older values remain selectable.
 */
export function buildDepartmentOptions(verticals: any[] = [], careers: any[] = []): string[] {
  const fromVerticals = verticals
    .filter((v) => v && v.status !== 'archived' && v.status !== 'draft')
    .map((v) => (typeof v.title === 'string' && v.title.trim() ? `${v.title.trim()} Vertical` : ''));
  return uniq([...fromVerticals, ...EXTRA_CAREER_DEPARTMENTS, ...careers.map((c) => c?.department)]);
}

export function buildEmploymentTypeOptions(careers: any[] = []): string[] {
  return uniq([...DEFAULT_EMPLOYMENT_TYPES, ...careers.map((c) => c?.employmentType)]);
}

const str = (v: unknown, fallback: string) => (typeof v === 'string' ? v : fallback);

const strList = (v: unknown, fallback: string[]) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : fallback;

/**
 * Merge stored (possibly partial / older-shaped) content over the defaults so
 * the public page always has every field it needs.
 */
export function resolveCareersPage(stored: unknown): CareersPageContent {
  const s = (stored && typeof stored === 'object' ? stored : {}) as any;
  const d = DEFAULT_CAREERS_PAGE;

  const benefitItems = Array.isArray(s.benefits?.items)
    ? s.benefits.items
        .filter((b: any) => b && typeof b === 'object')
        .map((b: any) => ({
          icon: (CAREER_BENEFIT_ICONS as readonly string[]).includes(b.icon) ? b.icon : 'award',
          title: str(b.title, ''),
          description: str(b.description, ''),
        }))
    : d.benefits.items;

  return {
    header: {
      badge: str(s.header?.badge, d.header.badge),
      title: str(s.header?.title, d.header.title),
      description: str(s.header?.description, d.header.description),
    },
    contactEmail: str(s.contactEmail, d.contactEmail),
    contactLabel: str(s.contactLabel, d.contactLabel),
    tabs: {
      openingsLabel: str(s.tabs?.openingsLabel, d.tabs.openingsLabel),
      portalLabel: str(s.tabs?.portalLabel, d.tabs.portalLabel),
    },
    emptyState: {
      title: str(s.emptyState?.title, d.emptyState.title),
      description: str(s.emptyState?.description, d.emptyState.description),
      buttonLabel: str(s.emptyState?.buttonLabel, d.emptyState.buttonLabel),
    },
    talentCallout: {
      badge: str(s.talentCallout?.badge, d.talentCallout.badge),
      heading: str(s.talentCallout?.heading, d.talentCallout.heading),
      description: str(s.talentCallout?.description, d.talentCallout.description),
      buttonLabel: str(s.talentCallout?.buttonLabel, d.talentCallout.buttonLabel),
    },
    jobDetail: {
      howToApplyTitle: str(s.jobDetail?.howToApplyTitle, d.jobDetail.howToApplyTitle),
      howToApplySteps: strList(s.jobDetail?.howToApplySteps, d.jobDetail.howToApplySteps),
    },
    applicationForm: {
      badge: str(s.applicationForm?.badge, d.applicationForm.badge),
      heading: str(s.applicationForm?.heading, d.applicationForm.heading),
      defaultJobTitle: str(s.applicationForm?.defaultJobTitle, d.applicationForm.defaultJobTitle),
      experienceOptions: strList(s.applicationForm?.experienceOptions, d.applicationForm.experienceOptions),
      domainOptions: strList(s.applicationForm?.domainOptions, d.applicationForm.domainOptions),
      coverNotePlaceholder: str(s.applicationForm?.coverNotePlaceholder, d.applicationForm.coverNotePlaceholder),
      submitLabel: str(s.applicationForm?.submitLabel, d.applicationForm.submitLabel),
      successTitle: str(s.applicationForm?.successTitle, d.applicationForm.successTitle),
      successMessage: str(s.applicationForm?.successMessage, d.applicationForm.successMessage),
    },
    benefits: {
      heading: str(s.benefits?.heading, d.benefits.heading),
      subheading: str(s.benefits?.subheading, d.benefits.subheading),
      items: benefitItems,
    },
  };
}
