'use server';

import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import {
  getCMSStore,
  saveCMSStore,
  signAdminToken,
  verifyAdminToken,
  resolveAdminSession,
  revokeAdminSessions,
  AdminSession,
} from '@/lib/db/store';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_MS = 15 * 60 * 1000;

interface AttemptRecord {
  count: number;
  windowStart: number;
  blockedUntil: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

// Used to equalize timing when the email does not exist.
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8D7Qb1s6N5pQn8wXq0cJ5hVQ8G1pW';

async function getClientKey(email: string): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    'unknown';
  return `${ip}:${email.toLowerCase()}`;
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record) return { allowed: true, retryAfterMs: 0 };

  if (record.blockedUntil > now) {
    return { allowed: false, retryAfterMs: record.blockedUntil - now };
  }

  if (now - record.windowStart > WINDOW_MS) {
    loginAttempts.delete(key);
    return { allowed: true, retryAfterMs: 0 };
  }

  return { allowed: true, retryAfterMs: 0 };
}

function recordFailure(key: string) {
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now - record.windowStart > WINDOW_MS) {
    loginAttempts.set(key, { count: 1, windowStart: now, blockedUntil: 0 });
    return;
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS;
  }
  loginAttempts.set(key, record);
}

export async function loginAdminAction(formData: FormData) {
  const email = (formData.get('email') as string | null)?.trim() || '';
  const password = (formData.get('password') as string | null) || '';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const rateKey = await getClientKey(email);
  const { allowed, retryAfterMs } = checkRateLimit(rateKey);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60000);
    return {
      success: false,
      error: `Too many failed attempts. Try again in ${minutes} minute(s).`,
    };
  }

  const store = getCMSStore();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user || !user.isActive) {
    // Perform a dummy comparison so response timing does not reveal account existence.
    await bcrypt.compare(password, DUMMY_HASH);
    recordFailure(rateKey);
    return { success: false, error: 'Invalid institutional administrator credentials' };
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    recordFailure(rateKey);
    return { success: false, error: 'Invalid institutional administrator credentials' };
  }

  loginAttempts.delete(rateKey);

  const session: AdminSession = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };

  const token = signAdminToken(session, user.sessionVersion ?? 0);

  // Secure HTTP-only *browser-session* cookie (no maxAge): it is discarded when
  // the browser closes, and the token inside expires after 8 hours regardless.
  (await cookies()).set('cube_admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  // Log Audit. Re-read the store: the copy loaded before the awaits above may
  // be stale, and saving it would overwrite changes made in the meantime.
  const freshStore = getCMSStore();
  freshStore.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: user.id,
    userEmail: user.email,
    action: 'ADMIN_LOGIN',
    resourceType: 'auth',
    resourceId: user.id,
    timestamp: new Date().toISOString(),
  });
  saveCMSStore(freshStore);

  return { success: true };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('cube_admin_session')?.value;
  if (cookie) {
    const session = verifyAdminToken(cookie);
    if (session) {
      // Revoke the token server-side so a copied cookie stops working too.
      revokeAdminSessions(session.userId);
      const store = getCMSStore();
      store.auditLogs.unshift({
        id: `log_${Date.now()}`,
        userId: session.userId,
        userEmail: session.email,
        action: 'ADMIN_LOGOUT',
        resourceType: 'auth',
        resourceId: session.userId,
        timestamp: new Date().toISOString(),
      });
      saveCMSStore(store);
    }
  }

  cookieStore.delete('cube_admin_session');
  return { success: true };
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookie = (await cookies()).get('cube_admin_session')?.value;
  return resolveAdminSession(cookie);
}
