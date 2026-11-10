const BLOCK_TAGS = /<(script|style|iframe|object|embed|noscript|template)[\s\S]*?<\/\1\s*>/gi;
const SELF_CLOSING_BLOCK = /<(script|style|iframe|object|embed|noscript|template)\b[^>]*\/?>/gi;
const ANY_TAG = /<[^>]*>/g;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

// Only treat keys that *end* with a URL-ish word as URLs. This avoids
// corrupting fields like `imageAlt` or `logoCaption` while still covering
// `imageUrl`, `projectLink`, `documentUrl`, `galleryImages`, etc.
const URL_KEY = /(url|link|href|src|image|images|logo|photo|thumbnail|banner|file|document)$/i;

export function stripHtml(input: unknown): string {
  if (typeof input !== 'string') return '';
  let out = input.replace(BLOCK_TAGS, ' ').replace(SELF_CLOSING_BLOCK, ' ');
  out = out.replace(ANY_TAG, ' ');
  out = out.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/gi, (m) => ENTITIES[m.toLowerCase()] || m);
  return out
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function sanitizeUrl(input: unknown): string {
  if (typeof input !== 'string') return '';
  const value = input.replace(/[\u0000-\u001F\u007F\s]+/g, '').trim();
  if (!value) return '';
  if (/^(javascript|data|vbscript):/i.test(value)) return '';
  if (
    value.startsWith('/') ||
    value.startsWith('#') ||
    value.startsWith('?') ||
    /^https?:\/\//i.test(value) ||
    /^mailto:/i.test(value) ||
    /^tel:/i.test(value)
  ) {
    return value;
  }
  return '';
}

function sanitizeValue(value: any, key: string): any {
  if (typeof value === 'string') {
    return URL_KEY.test(key) ? sanitizeUrl(value) : stripHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      out[childKey] = sanitizeValue(childValue, childKey);
    }
    return out;
  }
  return value;
}

const CONTENT_COLLECTIONS = [
  'news',
  'projects',
  'verticals',
  'announcements',
  'careers',
  'tenders',
  'celServices',
  'teamMembers',
  'clients',
  'gallery',
  'heroSlides',
  'enquiries',
] as const;

export function sanitizeStoreContent<T extends Record<string, any>>(store: T): T {
  for (const key of CONTENT_COLLECTIONS) {
    const collection = (store as any)[key];
    if (Array.isArray(collection)) {
      (store as any)[key] = collection.map((item: any) => sanitizeValue(item, key));
    }
  }
  return store;
}

export function normalizeNewsItem(item: any) {
  const excerpt = stripHtml(item?.excerpt || item?.summary || '');
  return {
    ...item,
    slug: item?.slug || item?.id || '',
    excerpt,
    summary: excerpt,
  };
}
