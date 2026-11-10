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

// Zero-width / bidi / formatting characters that pasted rich text often carries.
const INVISIBLE_CHARS = /[­​-‏‪-‮⁠-⁤﻿]/g;

/**
 * Convert "fancy font" text (e.g. 𝓗𝓮𝓵𝓵𝓸, 𝐁𝐨𝐥𝐝, Ｆｕｌｌｗｉｄｔｈ from font-generator
 * sites) back into plain letters so it always renders in the website's own
 * typeface. NFKC maps mathematical/fullwidth/compatibility glyphs to normal
 * characters. (HTML/inline font styles are already stripped below.)
 */
export function normalizeTypography(input: string): string {
  return input.normalize('NFKC').replace(INVISIBLE_CHARS, '');
}

export function stripHtml(input: unknown): string {
  if (typeof input !== 'string') return '';
  let out = normalizeTypography(input).replace(BLOCK_TAGS, ' ').replace(SELF_CLOSING_BLOCK, ' ');
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
  let value = input.replace(/[\u0000-\u001F\u007F\s]+/g, '').trim();
  if (!value) return '';
  if (/^(javascript|data|vbscript):/i.test(value)) return '';

  // Repair common path mistakes instead of discarding (and thereby changing) the path:
  //   images\team\a.jpg   -> /images/team/a.jpg   (Windows separators)
  //   public/images/a.jpg -> /images/a.jpg        (path copied from the repo)
  //   images/a.jpg        -> /images/a.jpg        (missing leading slash)
  //   www.example.com     -> https://www.example.com
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    value = value.replace(/\\/g, '/').replace(/^(\.\/)+/, '').replace(/^\/?public\//i, '/');
    if (/^www\./i.test(value)) {
      value = `https://${value}`;
    } else if (/^(images|uploads|assets)\//i.test(value)) {
      value = `/${value}`;
    }
  }
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
