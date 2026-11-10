import fs from 'fs';
import path from 'path';
import { getCMSBackend, getSupabaseAdmin, STORAGE_BUCKETS } from '@/lib/db/backend';
import { RESUME_DIR } from '@/lib/resumes';

/**
 * Storage for uploaded files.
 *  - 'uploads': admin media (served publicly at /uploads/<name>)
 *  - 'resumes': applicant CVs (private, admin-only download route)
 *
 * Supabase mode -> private Storage buckets. File mode -> local disk
 * (public/uploads and data-store/resumes, exactly as before).
 */
export type StorageArea = 'uploads' | 'resumes';

const LOCAL_DIRS: Record<StorageArea, string> = {
  uploads: path.join(process.cwd(), 'public', 'uploads'),
  resumes: RESUME_DIR,
};

/** Names are always generated server-side; this rejects anything else. */
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,200}$/;

function assertSafe(name: string) {
  if (!SAFE_NAME.test(name) || name.includes('..')) {
    throw new Error('Invalid storage object name');
  }
}

export async function putFile(
  area: StorageArea,
  name: string,
  data: Buffer,
  contentType: string
): Promise<void> {
  assertSafe(name);
  if (getCMSBackend() === 'supabase') {
    const { error } = await getSupabaseAdmin()
      .storage.from(STORAGE_BUCKETS[area])
      .upload(name, data, { contentType, upsert: false, cacheControl: '31536000' });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    return;
  }
  const dir = LOCAL_DIRS[area];
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), data);
}

export async function getFile(area: StorageArea, name: string): Promise<Buffer | null> {
  try {
    assertSafe(name);
  } catch {
    return null;
  }
  if (getCMSBackend() === 'supabase') {
    const { data, error } = await getSupabaseAdmin().storage.from(STORAGE_BUCKETS[area]).download(name);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }
  const filePath = path.join(LOCAL_DIRS[area], name);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}
