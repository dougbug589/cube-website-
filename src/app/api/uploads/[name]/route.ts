import { NextResponse } from 'next/server';
import path from 'path';
import { getFile } from '@/lib/file-storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Serves admin-uploaded media at /uploads/<name> (via the rewrite in
 * next.config.mjs). Files present in public/ at build time are still served
 * statically by Next.js first; this route covers everything uploaded after
 * deployment — from Supabase Storage when hosted, or from disk when
 * self-hosted (Next.js does not serve files added to public/ after a build).
 */
const IMAGE_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,200}$/;

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const ext = path.extname(name).toLowerCase();
  if (!SAFE_NAME.test(name) || name.includes('..') || !IMAGE_TYPES[ext]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const data = await getFile('uploads', name);
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': IMAGE_TYPES[ext],
      // Upload names are unique (timestamped), so content never changes.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
