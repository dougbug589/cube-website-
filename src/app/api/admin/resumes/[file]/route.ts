import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { resolveAdminSession, UserRole } from '@/lib/db/store';
import { RESUME_MIME, SAFE_RESUME_NAME } from '@/lib/resumes';
import { getFile } from '@/lib/file-storage';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES: UserRole[] = ['super_admin', 'admin', 'editor'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const user = await resolveAdminSession(req.cookies.get('cube_admin_session')?.value);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { file } = await params;
  // Strict whitelist prevents any path traversal.
  if (!SAFE_RESUME_NAME.test(file)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const data = await getFile('resumes', file);
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ext = path.extname(file).toLowerCase();
  // ?view=1 lets the admin panel preview PDFs in the browser. Word files can't
  // be rendered by browsers, so they are always downloaded.
  const inline = req.nextUrl.searchParams.get('view') === '1' && ext === '.pdf';
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': RESUME_MIME[ext] || 'application/octet-stream',
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="resume${ext}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
