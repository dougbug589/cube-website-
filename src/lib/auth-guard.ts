import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCMSStore, verifyAdminToken, UserRole, AdminSession } from '@/lib/db/store';

const ALL_ROLES: UserRole[] = ['super_admin', 'admin', 'editor', 'viewer'];

export async function requireAdmin(allowedRoles: UserRole[] = ALL_ROLES): Promise<AdminSession> {
  const token = (await cookies()).get('cube_admin_session')?.value;
  const session = token ? verifyAdminToken(token) : null;

  if (!session) {
    redirect('/admin/login');
  }

  const store = getCMSStore();
  const user = store.users.find((u) => u.id === session.userId);

  if (!user || !user.isActive) {
    redirect('/admin/login?expired=true');
  }

  if (!allowedRoles.includes(user.role)) {
    redirect('/admin');
  }

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}
