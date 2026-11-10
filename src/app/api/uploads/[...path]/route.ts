import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Serves admin-uploaded images that were added AFTER the production build.
 *
 * `next start` only serves files that existed in /public at build time, so a
 * photo uploaded through the admin panel would 404 on the live site. A fallback
 * rewrite in next.config.mjs sends unknown /uploads/* requests here, and this
 * route streams the file from disk. URLs stay /uploads/<file> everywhere.
 */
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const IMAGE_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const notFound = () => new Response('Not found', { status: 404 });

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;

  // Images only; never legacy resumes; no traversal or hidden files.
  if (
    !parts?.length ||
    parts[0] === 'resumes' ||
    parts.some((p) => !p || p === '..' || p.startsWith('.') || /[\\:\0]/.test(p))
  ) {
    return notFound();
  }

  const filePath = path.join(UPLOAD_DIR, ...parts);
  if (!filePath.startsWith(UPLOAD_DIR + path.sep)) return notFound();

  const mime = IMAGE_MIME[path.extname(filePath).toLowerCase()];
  if (!mime) return notFound();

  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return notFound();
  }
  if (!stat.isFile()) return notFound();

  return new Response(fs.readFileSync(filePath), {
    headers: {
      'Content-Type': mime,
      'Content-Length': String(stat.size),
      // Upload filenames are timestamped and never reused.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
