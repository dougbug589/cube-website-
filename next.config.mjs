import path from 'path';
import { fileURLToPath } from 'url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Read-only public build: no admin (same rule as src/middleware.ts). Exposed to
// the browser so the top bar can drop its admin link instead of pointing
// visitors at a "Not found" page.
const READ_ONLY_SITE =
  process.env.CMS_BACKEND === 'published' ||
  (!!process.env.VERCEL && !process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.CMS_BACKEND !== 'file');

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { NEXT_PUBLIC_READ_ONLY_SITE: READ_ONLY_SITE ? '1' : '' },
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
  // Lets a production preview build live beside the dev server's .next
  // (NEXT_DIST_DIR=.next-prod next build && NEXT_DIST_DIR=.next-prod next start).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  compress: true,
  poweredByHeader: false,
  images: {
    // WebP only: AVIF encoding hung indefinitely here (browser image requests
    // never completed, e.g. the header logo), and it is far slower to encode.
    // WebP is supported by every current browser and encodes in milliseconds.
    formats: ['image/webp'],
    // 1 day: optimized images are re-checked daily, so a photo replaced at the
    // same path (e.g. a board member portrait) shows up within a day instead of
    // the old copy being served for 30 days.
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return {
      // Uploaded media keeps its /uploads/<file> URL. Files in /public at build
      // time are served statically first; anything uploaded after deployment
      // (runtime disk or Supabase Storage) falls back to /api/uploads.
      fallback: [{ source: '/uploads/:path*', destination: '/api/uploads/:path*' }],
    };
  },
  async headers() {
    // Vercel copies stay out of search results unless ALLOW_INDEXING=true
    // (see src/app/robots.ts); robots.txt alone does not stop indexing of
    // URLs found through links, so send the noindex header as well.
    const noindex =
      process.env.VERCEL && process.env.ALLOW_INDEXING !== 'true'
        ? [{ source: '/(.*)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
        : [];
    return [
      ...noindex,
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "object-src 'none'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https:",
              "frame-src 'self' https://www.google.com https://maps.google.com",
            ].join('; '),
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        // Never let the browser/back button show a cached admin page after logout.
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/admin',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // Hero film: large and rarely changed. A new cut gets a new file name
        // (cube-hero-v2.mp4, ...) so long caching never serves a stale copy.
        source: '/videos/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' },
        ],
      },
      {
        // Tender PDFs: cached for a day, then refreshed in the background.
        source: '/tenders/:file(.+\\.pdf)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};

export default nextConfig;
