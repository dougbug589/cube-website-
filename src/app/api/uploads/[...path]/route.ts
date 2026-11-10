import fs from 'fs';
import path from 'path';
import { getFile } from '@/lib/file-storage';
import { getCMSBackend } from '@/lib/db/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Serves admin-uploaded images that were added AFTER the production build.
 *
 * `next start` only serves files that existed in /public at build time, so a
 * photo uploaded through the admin panel would 404 on the live site. A fallback
 * rewrite in next.config.mjs sends unknown /uploads/* requests here. URLs stay
 * /uploads/<file> everywhere.
 *
 *  - Local / self-hosted (file backend): read from public/uploads on disk.
 *  - Supabase backend: read from the private `cms-uploads` Storage bucket.
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

function imageResponse(data: Buffer, mime: string) {
  return new Response(new Uint8Array(data), {
    headers: {
      'Content-Type': mime,
      'Content-Length': String(data.length),
      // Upload filenames are timestamped and never reused.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

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

  const mime = IMAGE_MIME[path.extname(parts[parts.length - 1]).toLowerCase()];
  if (!mime) return notFound();

  // Admin uploads are stored flat (/uploads/<name>): works for both backends.
  if (parts.length === 1) {
    const data = await getFile('uploads', parts[0]);
    return data ? imageResponse(data, mime) : notFound();
  }

  // Nested paths only exist on local disk.
  if (getCMSBackend() === 'supabase') return notFound();

  const filePath = path.join(UPLOAD_DIR, ...parts);
  if (!filePath.startsWith(UPLOAD_DIR + path.sep)) return notFound();

  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return notFound();
  }
  if (!stat.isFile()) return notFound();

  return imageResponse(fs.readFileSync(filePath), mime);
}
