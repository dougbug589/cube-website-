import { getCMSStore } from '@/lib/db/store';
import { normalizeNewsItem } from '@/lib/content';

// Dynamic Published News
export async function getPublishedNews() {
  const store = getCMSStore();
  return store.news
    .filter((n) => n.status === 'published')
    .map((n) => normalizeNewsItem(n));
}

export async function getNewsBySlug(slug: string) {
  const store = getCMSStore();
  const item = store.news.find(
    (n) => (n.slug === slug || n.id === slug) && n.status === 'published'
  );
  return item ? normalizeNewsItem(item) : null;
}

// Dynamic Published Projects
export async function getPublishedProjects() {
  const store = getCMSStore();
  return store.projects.filter((p) => p.status === 'published');
}

export async function getProjectBySlug(slug: string) {
  const store = getCMSStore();
  return store.projects.find((p) => p.slug === slug && p.status === 'published') || null;
}

// Dynamic Active Announcements & Hiring Popups
export async function getActiveAnnouncements(targetPage: string = '/') {
  const store = getCMSStore();
  const now = new Date().getTime();

  return store.announcements.filter((a) => {
    if (!a.isActive) return false;
    if (a.endDate && new Date(a.endDate).getTime() < now) return false;
    if (a.targetPages && !a.targetPages.includes(targetPage) && !a.targetPages.includes('*')) {
      return false;
    }
    return true;
  });
}

// Dynamic Active Careers
export async function getPublishedCareers() {
  const store = getCMSStore();
  return store.careers.filter((c) => c.status === 'published' && c.isActive);
}

// Dynamic Published Team Members
export async function getPublishedTeamMembers() {
  const store = getCMSStore();
  return store.teamMembers.filter((m) => m.status === 'published');
}

// Dynamic Published Tenders
export async function getPublishedTenders() {
  const store = getCMSStore();
  return store.tenders.filter((t) => t.status !== 'Archive' && t.status !== 'archived');
}

// Dynamic CEL Services
export async function getPublishedCELServices() {
  const store = getCMSStore();
  return store.celServices.filter((s) => s.status === 'published');
}

// Dynamic Published Gallery
export async function getPublishedGallery() {
  const store = getCMSStore();
  return store.gallery.filter((g) => g.status === 'published');
}

// Dynamic Verticals
export async function getPublishedVerticals() {
  const store = getCMSStore();
  return store.verticals.filter((v) => v.status === 'published');
}

// Dynamic Hero Slides
export async function getPublishedHeroSlides() {
  const store = getCMSStore();
  return store.heroSlides.filter((s) => s.status === 'published');
}

