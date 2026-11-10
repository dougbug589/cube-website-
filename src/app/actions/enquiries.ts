'use server';

import { cookies, headers } from 'next/headers';
import { getCMSStore, saveCMSStore, verifyAdminToken, UserRole } from '@/lib/db/store';
import { revalidatePath } from 'next/cache';

export interface SubmitEnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  category: string;
  subject?: string;
  message: string;
  sourcePage?: string;
}

const MAX_FIELD_LENGTH = 5000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUBMISSION_WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS_PER_WINDOW = 5;
const submissions = new Map<string, { count: number; windowStart: number }>();

async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  return (
    forwarded?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = submissions.get(ip);

  if (!record || now - record.windowStart > SUBMISSION_WINDOW_MS) {
    submissions.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= MAX_SUBMISSIONS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  submissions.set(ip, record);
  return false;
}

async function assertAdmin(
  allowedRoles: UserRole[] = ['super_admin', 'admin']
): Promise<{ ok: true; session: NonNullable<ReturnType<typeof verifyAdminToken>> } | { ok: false; error: string }> {
  const token = (await cookies()).get('cube_admin_session')?.value;
  if (!token) return { ok: false, error: 'Unauthorized: Authentication required' };

  const session = verifyAdminToken(token);
  if (!session) return { ok: false, error: 'Unauthorized: Session expired' };

  const store = getCMSStore();
  const user = store.users.find((u) => u.id === session.userId);
  if (!user || !user.isActive) {
    return { ok: false, error: 'Unauthorized: Account is inactive or no longer exists' };
  }
  if (!allowedRoles.includes(user.role)) {
    return { ok: false, error: 'Forbidden: Insufficient privileges' };
  }

  return {
    ok: true,
    session: {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
}

export async function submitEnquiryAction(payload: SubmitEnquiryPayload) {
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const message = payload.message?.trim();

  if (!name || !email || !message) {
    return { success: false, error: 'Name, email, and message are required.' };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  if (
    name.length > 200 ||
    email.length > 320 ||
    message.length > MAX_FIELD_LENGTH ||
    (payload.phone?.length || 0) > 50 ||
    (payload.organization?.length || 0) > 300 ||
    (payload.subject?.length || 0) > 300
  ) {
    return { success: false, error: 'One or more fields exceed the allowed length.' };
  }

  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return {
      success: false,
      error: 'Too many submissions. Please try again later.',
    };
  }

  const store = getCMSStore();

  const newEnquiry = {
    id: `enq_${Date.now()}`,
    name,
    email,
    phone: payload.phone?.trim() || 'N/A',
    organization: payload.organization?.trim() || 'N/A',
    category: payload.category?.trim() || 'General Technical Enquiry',
    subject: payload.subject?.trim() || `New ${payload.category} from ${name}`,
    message,
    sourcePage: payload.sourcePage || '/contact',
    isRead: false,
    timestamp: new Date().toISOString(),
  };

  if (!store.enquiries) {
    store.enquiries = [];
  }

  store.enquiries.unshift(newEnquiry);

  // Add audit log
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: 'public_citizen',
    userEmail: email,
    action: 'REALTIME_ENQUIRY_RECEIVED',
    resourceType: 'enquiry',
    resourceId: newEnquiry.id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);

  // Real-time server revalidation for admin dashboard
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/enquiries');

  return { success: true, enquiryId: newEnquiry.id };
}

export async function markEnquiryAsReadAction(id: string) {
  const auth = await assertAdmin(['super_admin', 'admin', 'editor']);
  if (!auth.ok) return { success: false, error: auth.error };

  const store = getCMSStore();
  const item = store.enquiries.find((e) => e.id === id);
  if (!item) return { success: false, error: 'Enquiry not found' };

  item.isRead = true;
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: auth.session.userId,
    userEmail: auth.session.email,
    action: 'MARK_ENQUIRY_READ',
    resourceType: 'enquiry',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);
  revalidatePath('/admin/enquiries');
  revalidatePath('/admin/dashboard');
  return { success: true };
}

export async function deleteEnquiryAction(id: string, archiveRemark?: string) {
  const auth = await assertAdmin(['super_admin', 'admin']);
  if (!auth.ok) return { success: false, error: auth.error };

  const store = getCMSStore();
  const item = store.enquiries.find((e) => e.id === id);
  if (!item) return { success: false, error: 'Enquiry not found' };

  item.status = item.status === 'archived' ? 'active' : 'archived';
  if (archiveRemark) {
    item.archiveRemark = archiveRemark.slice(0, 1000);
    item.archivedAt = new Date().toISOString();
  }

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: auth.session.userId,
    userEmail: auth.session.email,
    action: item.status === 'archived' ? 'ARCHIVE_ENQUIRY' : 'RESTORE_ENQUIRY',
    resourceType: 'enquiry',
    resourceId: id,
    timestamp: new Date().toISOString(),
  });

  saveCMSStore(store);
  revalidatePath('/admin/enquiries');
  revalidatePath('/admin/dashboard');
  return { success: true };
}
