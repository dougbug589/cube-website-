import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { resolveAdminSession, UserRole } from '@/lib/db/store';
import { RESUME_DIR, RESUME_MIME, SAFE_RESUME_NAME } from '@/lib/resumes';

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES: UserRole[] = ['super_admin', 'admin', 'editor'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const user = resolveAdminSession(req.cookies.get('cube_admin_session')?.value);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { file } = await params;
  // Strict whitelist prevents any path traversal.
  if (!SAFE_RESUME_NAME.test(file)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const filePath = path.join(RESUME_DIR, file);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const ext = path.extname(file).toLowerCase();
  return new NextResponse(fs.readFileSync(filePath), {
    headers: {
      'Content-Type': RESUME_MIME[ext] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="resume${ext}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
