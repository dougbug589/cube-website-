import { MetadataRoute } from 'next';

// A Vercel deployment of this site (e.g. a redesign preview on *.vercel.app)
// must not compete with cubeiitm.org in search results, so it asks search
// engines to stay away unless ALLOW_INDEXING=true is set (for the day it
// becomes the official site). Self-hosted servers are unaffected.
const BLOCK_INDEXING = !!process.env.VERCEL && process.env.ALLOW_INDEXING !== 'true';

export default function robots(): MetadataRoute.Robots {
  if (BLOCK_INDEXING) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/admin/*'],
      },
    ],
    sitemap: 'https://cubeiitm.org/sitemap.xml',
  };
}

