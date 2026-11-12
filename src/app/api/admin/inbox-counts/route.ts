import { NextRequest, NextResponse } from 'next/server';
import { getCMSStore, resolveAdminSession } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

/**
 * Live counters for the admin sidebar: unread enquiries (contact + CEL forms)
 * and job applications not yet reviewed. Refreshed whenever data changes.
 */
export async function GET(req: NextRequest) {
  const user = await resolveAdminSession(req.cookies.get('cube_admin_session')?.value);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getCMSStore();
  const enquiries = (store.enquiries || []).filter((e: any) => !e.isRead && e.status !== 'archived').length;
  const applications = (store.jobApplications || []).filter((a: any) => (a.status || 'new') === 'new').length;
  return NextResponse.json({ enquiries, applications }, { headers: { 'Cache-Control': 'no-store' } });
}
