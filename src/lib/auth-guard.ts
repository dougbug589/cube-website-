import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveAdminSession, UserRole, AdminSession } from '@/lib/db/store';

const ALL_ROLES: UserRole[] = ['super_admin', 'admin', 'editor', 'viewer'];

export async function requireAdmin(allowedRoles: UserRole[] = ALL_ROLES): Promise<AdminSession> {
  const token = (await cookies()).get('cube_admin_session')?.value;
  const session = resolveAdminSession(token);

  if (!session) {
    redirect('/admin/login?expired=true');
  }

  if (!allowedRoles.includes(session.role)) {
    redirect('/admin');
  }

  return session;
}
