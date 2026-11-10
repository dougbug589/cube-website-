'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getCMSStore, saveCMSStore, resolveAdminSession, UserRole } from '@/lib/db/store';

// Keys that must never be supplied by client payloads (mass-assignment guard).
const PROTECTED_KEYS = new Set([
  'id',
  'createdAt',
  'updatedAt',
  '__proto__',
  'constructor',
  'prototype',
]);

function sanitizeData<T extends Record<string, any>>(data: T): Record<string, any> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (PROTECTED_KEYS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
}

// On UPDATE, a blank image/link field means "keep the current one": never
// silently wipe an existing image path because a form field was left empty.
const URL_FIELD = /(url|link|href|src|image|images|logo|photo|thumbnail|banner|file|document)$/i;
function dropBlankUrlFields(data: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const blank =
      value === '' || value === null || value === undefined ||
      (Array.isArray(value) && value.length === 0);
    if (URL_FIELD.test(key) && blank) continue;
    out[key] = value;
  }
  return out;
}

// Helper to assert admin privileges
async function assertPermission(allowedRoles: UserRole[] = ['super_admin', 'admin', 'editor']) {
  const token = (await cookies()).get('cube_admin_session')?.value;
  const session = resolveAdminSession(token);
  if (!session) throw new Error('Unauthorized: Session expired or signed out');
  if (!allowedRoles.includes(session.role)) {
    throw new Error(`Forbidden: Insufficient privileges. Required: ${allowedRoles.join(', ')}`);
  }
  return session;
}

// -------------------------------------------------------------
// NEWS CMS ACTIONS
// -------------------------------------------------------------
export async function createNewsAction(data: {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  featured: boolean;
  status: 'draft' | 'published';
}) {
  const session = await assertPermission(['super_admin', 'admin', 'editor']);
  const store = getCMSStore();

  const slug = data.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const newArticle = {
    id: `news_${Date.now()}`,
    slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category || 'Institutional',
    date: new Date().toISOString().split('T')[0],
    author: session.fullName,
    image: data.imageUrl || '/images/hero/slides_building-training-team.jpg',
    featured: data.featured,
    status: data.status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.news.unshift(newArticle);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: data.status === 'published' ? 'PUBLISH_NEWS' : 'DRAFT_NEWS',
    resourceType: 'news',
    resourceId: newArticle.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  // Instant Next.js Cache Revalidation
  revalidatePath('/');
  revalidatePath('/media');
  revalidatePath('/media/news');
  revalidatePath(`/media/news/${slug}`);
  revalidatePath(`/media/news/${newArticle.id}`);

  return { success: true, article: newArticle };
}

export async function updateNewsAction(id: string, data: {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl?: string;
  featured?: boolean;
}) {
  const session = await assertPermission(['super_admin', 'admin', 'editor']);
  const store = getCMSStore();

  const idx = store.news.findIndex((n) => n.id === id);
  if (idx === -1) return { success: false, error: 'Article not found' };

  store.news[idx] = {
    ...store.news[idx],
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category,
    ...(data.imageUrl ? { image: data.imageUrl } : {}),
    ...(data.featured !== undefined ? { featured: data.featured } : {}),
    updatedAt: new Date().toISOString(),
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'UPDATE_NEWS',
    resourceType: 'news',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/');
  revalidatePath('/media');
  revalidatePath('/media/news');
  revalidatePath(`/media/news/${store.news[idx].slug || id}`);
  revalidatePath(`/media/news/${id}`);
  revalidatePath('/admin/news');
  return { success: true, article: store.news[idx] };
}

export async function updateNewsStatusAction(id: string, status: 'draft' | 'published' | 'archived') {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.news.findIndex((n) => n.id === id);
  if (idx === -1) return { success: false, error: 'Article not found' };

  store.news[idx].status = status;
  store.news[idx].updatedAt = new Date().toISOString();

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: `STATUS_CHANGE_${status.toUpperCase()}`,
    resourceType: 'news',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/');
  revalidatePath('/media');
  revalidatePath('/media/news');
  revalidatePath(`/media/news/${store.news[idx].slug || id}`);
  revalidatePath(`/media/news/${id}`);
  return { success: true };
}

export async function deleteNewsAction(id: string, archiveRemark?: string) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.news.findIndex((n) => n.id === id);
  if (idx !== -1) {
    const nextStatus = store.news[idx].status === 'archived' ? 'published' : 'archived';
    store.news[idx].status = nextStatus;
    if (archiveRemark) {
      store.news[idx].archiveRemark = archiveRemark;
      store.news[idx].archivedAt = new Date().toISOString();
    }
    store.news[idx].updatedAt = new Date().toISOString();
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ARCHIVE_NEWS',
    resourceType: 'news',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/');
  revalidatePath('/media');
  revalidatePath('/media/news');
  revalidatePath(`/media/news/${store.news[idx]?.slug || id}`);
  revalidatePath(`/media/news/${id}`);
  return { success: true };
}

// -------------------------------------------------------------
// UNIVERSAL ANNOUNCEMENTS & HIRING POPUP ACTIONS
// -------------------------------------------------------------
export async function updateAnnouncementAction(data: {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  frequency: string;
}) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.announcements.findIndex((a) => a.id === data.id);
  if (idx === -1) {
    store.announcements.unshift({
      ...data,
      type: 'hiring_popup',
      startDate: new Date().toISOString(),
      priority: 1,
      targetPages: ['/'],
      createdAt: new Date().toISOString(),
    });
  } else {
    store.announcements[idx] = {
      ...store.announcements[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: data.isActive ? 'ACTIVATE_ANNOUNCEMENT' : 'DEACTIVATE_ANNOUNCEMENT',
    resourceType: 'announcement',
    resourceId: data.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/');
  return { success: true };
}

// -------------------------------------------------------------
// PROJECTS CMS ACTIONS
// -------------------------------------------------------------
export async function createProjectAction(data: any) {
  const session = await assertPermission(['super_admin', 'admin', 'editor']);
  const store = getCMSStore();

  const clean = sanitizeData(data);
  const slug =
    clean.slug ||
    String(clean.title || '')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

  const newProject = {
    ...clean,
    id: `proj_${Date.now()}`,
    slug,
    status: clean.status || 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.projects.unshift(newProject);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'CREATE_PROJECT',
    resourceType: 'project',
    resourceId: newProject.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath(`/projects/${slug}`);
  return { success: true, project: newProject };
}

export async function updateProjectAction(idOrSlug: string, data: any) {
  const session = await assertPermission(['super_admin', 'admin', 'editor']);
  const store = getCMSStore();

  const idx = store.projects.findIndex((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (idx === -1) return { success: false, error: 'Project not found' };

  store.projects[idx] = {
    ...store.projects[idx],
    ...dropBlankUrlFields(sanitizeData(data)),
    updatedAt: new Date().toISOString(),
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'UPDATE_PROJECT',
    resourceType: 'project',
    resourceId: idOrSlug,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath(`/projects/${store.projects[idx].slug}`);
  return { success: true, project: store.projects[idx] };
}

export async function archiveProjectAction(idOrSlug: string, archiveRemark?: string) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.projects.findIndex((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (idx !== -1) {
    const isArchived = store.projects[idx].status === 'archived';
    store.projects[idx].status = isArchived ? 'published' : 'archived';
    if (archiveRemark) {
      store.projects[idx].archiveRemark = archiveRemark;
      store.projects[idx].archivedAt = new Date().toISOString();
    }
    store.projects[idx].updatedAt = new Date().toISOString();
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ARCHIVE_PROJECT',
    resourceType: 'project',
    resourceId: idOrSlug,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/');
  revalidatePath('/projects');
  revalidatePath('/admin/projects');
  revalidatePath('/admin/archive');
  return { success: true };
}

// -------------------------------------------------------------
// CAREERS CMS ACTIONS
// -------------------------------------------------------------
export async function createCareerAction(data: any) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const newJob = {
    ...sanitizeData(data),
    id: `job_${Date.now()}`,
    status: data.status || 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.careers.unshift(newJob);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'CREATE_CAREER',
    resourceType: 'career',
    resourceId: newJob.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/careers');
  revalidatePath('/admin/careers');
  return { success: true, career: newJob };
}

export async function updateCareerAction(id: string, data: any) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.careers.findIndex((c) => c.id === id);
  if (idx === -1) return { success: false, error: 'Career position not found' };

  store.careers[idx] = {
    ...store.careers[idx],
    ...dropBlankUrlFields(sanitizeData(data)),
    updatedAt: new Date().toISOString(),
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'UPDATE_CAREER',
    resourceType: 'career',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/careers');
  revalidatePath('/admin/careers');
  return { success: true, career: store.careers[idx] };
}

export async function archiveCareerAction(id: string, archiveRemark?: string) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.careers.findIndex((c) => c.id === id);
  if (idx !== -1) {
    const isArchived = store.careers[idx].status === 'archived';
    store.careers[idx].status = isArchived ? 'published' : 'archived';
    if (archiveRemark) {
      store.careers[idx].archiveRemark = archiveRemark;
      store.careers[idx].archivedAt = new Date().toISOString();
    }
    store.careers[idx].updatedAt = new Date().toISOString();
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ARCHIVE_CAREER',
    resourceType: 'career',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/careers');
  revalidatePath('/admin/careers');
  revalidatePath('/admin/archive');
  return { success: true };
}

// -------------------------------------------------------------
// TENDERS CMS ACTIONS
// -------------------------------------------------------------
export async function createTenderAction(data: {
  referenceNumber: string;
  title: string;
  description: string;
  documentUrl?: string;
  publishedDate?: string;
  closingDate: string;
  status?: string;
}) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const newTender = {
    id: `tnd_${Date.now()}`,
    referenceNumber: data.referenceNumber,
    title: data.title,
    description: data.description,
    documentUrl: data.documentUrl || '#',
    publishedDate: data.publishedDate || new Date().toISOString().split('T')[0],
    closingDate: data.closingDate,
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
  };

  store.tenders.unshift(newTender);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'CREATE_TENDER',
    resourceType: 'tender',
    resourceId: newTender.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/tenders');
  revalidatePath('/tenders');
  revalidatePath('/');
  return { success: true, tender: newTender };
}

export async function updateTenderAction(id: string, data: {
  referenceNumber: string;
  title: string;
  description: string;
  documentUrl?: string;
  closingDate: string;
  status?: string;
}) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.tenders.findIndex((t) => t.id === id);
  if (idx === -1) return { success: false, error: 'Tender not found' };

  store.tenders[idx] = {
    ...store.tenders[idx],
    referenceNumber: data.referenceNumber,
    title: data.title,
    description: data.description,
    ...(data.documentUrl ? { documentUrl: data.documentUrl } : {}),
    closingDate: data.closingDate,
    status: data.status || store.tenders[idx].status,
    updatedAt: new Date().toISOString(),
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'UPDATE_TENDER',
    resourceType: 'tender',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/tenders');
  revalidatePath('/tenders');
  revalidatePath('/');
  return { success: true, tender: store.tenders[idx] };
}

export async function deleteTenderAction(id: string, archiveRemark?: string) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.tenders.findIndex((t) => t.id === id);
  if (idx !== -1) {
    const isArchived = store.tenders[idx].status === 'Archive' || store.tenders[idx].status === 'archived';
    store.tenders[idx].status = isArchived ? 'Active' : 'Archive';
    if (archiveRemark) {
      store.tenders[idx].archiveRemark = archiveRemark;
      store.tenders[idx].archivedAt = new Date().toISOString();
    }
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ARCHIVE_TENDER',
    resourceType: 'tender',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/tenders');
  revalidatePath('/tenders');
  return { success: true };
}

// -------------------------------------------------------------
// CEL SERVICES & PARAMETERS CMS ACTIONS
// -------------------------------------------------------------
export async function addCELServiceAction(data: {
  category: string;
  title: string;
  description: string;
  parameters: string[];
}) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const newService = {
    id: `cel_${Date.now()}`,
    category: data.category,
    title: data.title,
    description: data.description,
    parameters: data.parameters,
    status: 'published',
    createdAt: new Date().toISOString(),
  };

  store.celServices.push(newService);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ADD_CEL_SERVICE',
    resourceType: 'cel_service',
    resourceId: newService.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/cel');
  revalidatePath('/cel');
  revalidatePath('/');
  return { success: true, service: newService };
}

export async function updateCELServiceAction(id: string, data: {
  category: string;
  title: string;
  description: string;
  parameters: string[];
}) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.celServices.findIndex((s) => s.id === id);
  if (idx === -1) return { success: false, error: 'Laboratory service not found' };

  store.celServices[idx] = {
    ...store.celServices[idx],
    category: data.category,
    title: data.title,
    description: data.description,
    parameters: data.parameters,
    updatedAt: new Date().toISOString(),
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'UPDATE_CEL_SERVICE',
    resourceType: 'cel_service',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/cel');
  revalidatePath('/cel');
  revalidatePath('/');
  return { success: true, service: store.celServices[idx] };
}

export async function deleteCELServiceAction(id: string, archiveRemark?: string) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.celServices.findIndex((s) => s.id === id);
  if (idx !== -1) {
    const isArchived = store.celServices[idx].status === 'archived';
    store.celServices[idx].status = isArchived ? 'published' : 'archived';
    if (archiveRemark) {
      store.celServices[idx].archiveRemark = archiveRemark;
      store.celServices[idx].archivedAt = new Date().toISOString();
    }
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ARCHIVE_CEL_SERVICE',
    resourceType: 'cel_service',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/cel');
  revalidatePath('/cel');
  return { success: true };
}

// -------------------------------------------------------------
// LEADERSHIP & TEAM DIRECTORY CMS ACTIONS
// -------------------------------------------------------------
export async function addTeamMemberAction(data: {
  name: string;
  designation: string;
  category: string;
  department?: string;
  image?: string;
  bio?: string;
  email?: string;
  phone?: string;
  age?: string;
  qualification?: string;
  experience?: string;
  employeeId?: string;
  joiningDate?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const newMember = {
    id: `team_${Date.now()}`,
    name: data.name,
    designation: data.designation,
    category: data.category,
    department: data.department || data.category,
    image: data.image || '/images/team/team_unknown.png',
    bio: data.bio || '',
    email: data.email || '',
    phone: data.phone || '',
    age: data.age || '',
    qualification: data.qualification || '',
    experience: data.experience || '',
    employeeId: data.employeeId || '',
    joiningDate: data.joiningDate || '',
    bloodGroup: data.bloodGroup || '',
    emergencyContact: data.emergencyContact || '',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.teamMembers.push(newMember);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ADD_TEAM_MEMBER',
    resourceType: 'team',
    resourceId: newMember.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/team');
  revalidatePath('/about/team');
  revalidatePath('/about/board-members');
  revalidatePath('/about/advisory-panel');
  revalidatePath('/');
  return { success: true, member: newMember };
}

export async function updateTeamMemberAction(idOrName: string, data: {
  name: string;
  designation: string;
  category: string;
  department?: string;
  image?: string;
  bio?: string;
  email?: string;
  phone?: string;
  age?: string;
  qualification?: string;
  experience?: string;
  employeeId?: string;
  joiningDate?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.teamMembers.findIndex((m) => m.id === idOrName || m.name === idOrName);
  if (idx === -1) {
    return { success: false, error: 'Member not found' };
  }

  store.teamMembers[idx] = {
    ...store.teamMembers[idx],
    name: data.name,
    designation: data.designation,
    category: data.category,
    department: data.department || data.category,
    ...(data.image ? { image: data.image } : {}),
    bio: data.bio !== undefined ? data.bio : store.teamMembers[idx].bio,
    email: data.email !== undefined ? data.email : store.teamMembers[idx].email,
    phone: data.phone !== undefined ? data.phone : store.teamMembers[idx].phone,
    age: data.age !== undefined ? data.age : store.teamMembers[idx].age,
    qualification: data.qualification !== undefined ? data.qualification : store.teamMembers[idx].qualification,
    experience: data.experience !== undefined ? data.experience : store.teamMembers[idx].experience,
    employeeId: data.employeeId !== undefined ? data.employeeId : store.teamMembers[idx].employeeId,
    joiningDate: data.joiningDate !== undefined ? data.joiningDate : store.teamMembers[idx].joiningDate,
    bloodGroup: data.bloodGroup !== undefined ? data.bloodGroup : store.teamMembers[idx].bloodGroup,
    emergencyContact: data.emergencyContact !== undefined ? data.emergencyContact : store.teamMembers[idx].emergencyContact,
    updatedAt: new Date().toISOString(),
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'UPDATE_TEAM_MEMBER',
    resourceType: 'team',
    resourceId: idOrName,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/team');
  revalidatePath('/about/team');
  revalidatePath('/about/board-members');
  revalidatePath('/about/advisory-panel');
  revalidatePath('/');
  return { success: true, member: store.teamMembers[idx] };
}

export async function deleteTeamMemberAction(id: string, archiveRemark?: string) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.teamMembers.findIndex((m) => m.id === id || m.name === id);
  if (idx !== -1) {
    const isArchived = store.teamMembers[idx].status === 'archived';
    store.teamMembers[idx].status = isArchived ? 'published' : 'archived';
    if (archiveRemark) {
      store.teamMembers[idx].archiveRemark = archiveRemark;
      store.teamMembers[idx].archivedAt = new Date().toISOString();
    }
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ARCHIVE_TEAM_MEMBER',
    resourceType: 'team',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/team');
  revalidatePath('/about/team');
  revalidatePath('/about/board-members');
  revalidatePath('/about/advisory-panel');
  revalidatePath('/');
  return { success: true };
}

export async function addMediaAssetAction(data: {
  title: string;
  category: string;
  imageUrl: string;
}) {
  const session = await assertPermission(['super_admin', 'admin', 'editor']);
  const store = getCMSStore();

  const newAsset = {
    id: `gal_${Date.now()}`,
    title: data.title,
    category: data.category || 'General',
    imageUrl: data.imageUrl,
    status: 'published',
    createdAt: new Date().toISOString(),
  };

  store.gallery.unshift(newAsset);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'UPLOAD_MEDIA_ASSET',
    resourceType: 'media',
    resourceId: newAsset.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/media');
  revalidatePath('/media/gallery');
  revalidatePath('/');
  return { success: true, asset: newAsset };
}

export async function updateMediaAssetAction(id: string, data: {
  title: string;
  category: string;
  imageUrl?: string;
}) {
  const session = await assertPermission(['super_admin', 'admin', 'editor']);
  const store = getCMSStore();

  const idx = store.gallery.findIndex((g) => g.id === id);
  if (idx === -1) return { success: false, error: 'Asset not found' };

  store.gallery[idx] = {
    ...store.gallery[idx],
    title: data.title,
    category: data.category,
    ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
    updatedAt: new Date().toISOString(),
  };

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'UPDATE_MEDIA_ASSET',
    resourceType: 'media',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/media');
  revalidatePath('/media/gallery');
  revalidatePath('/');
  return { success: true, asset: store.gallery[idx] };
}

export async function deleteMediaAssetAction(id: string, archiveRemark?: string) {
  const session = await assertPermission(['super_admin', 'admin']);
  const store = getCMSStore();

  const idx = store.gallery.findIndex((g) => g.id === id);
  if (idx !== -1) {
    const isArchived = store.gallery[idx].status === 'archived';
    store.gallery[idx].status = isArchived ? 'published' : 'archived';
    if (archiveRemark) {
      store.gallery[idx].archiveRemark = archiveRemark;
      store.gallery[idx].archivedAt = new Date().toISOString();
    }
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action: 'ARCHIVE_MEDIA_ASSET',
    resourceType: 'media',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  revalidatePath('/admin/media');
  revalidatePath('/media/gallery');
  revalidatePath('/');
  return { success: true };
}


