import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Which persistence backend the CMS uses.
 *
 *  - 'supabase': PostgreSQL table `cms_store` + Supabase Storage buckets.
 *    Enabled automatically when SUPABASE_SERVICE_ROLE_KEY and a Supabase URL
 *    are set. Required for serverless / multi-instance hosting (Vercel etc.).
 *  - 'file': local JSON file in ./data-store (default for local development
 *    and for the local admin server that publishes to the live site).
 *  - 'published': read-only public website (e.g. on Vercel). Content comes
 *    from src/content/published-store.json, which the local admin publishes
 *    to GitHub after every change; Vercel rebuilds from it. No admin here.
 *    Selected automatically on Vercel when Supabase is not configured.
 *
 * CMS_BACKEND=file|supabase|published forces a mode.
 */
export type CMSBackend = 'supabase' | 'file' | 'published';

const supabaseUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function getCMSBackend(): CMSBackend {
  const forced = (process.env.CMS_BACKEND || '').toLowerCase();
  if (forced === 'file') return 'file';
  if (forced === 'published') return 'published';
  if (forced === 'supabase') {
    if (!supabaseUrl() || !serviceKey()) {
      throw new Error('CMS_BACKEND=supabase requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.');
    }
    return 'supabase';
  }
  if (supabaseUrl() && serviceKey()) return 'supabase';
  // Vercel has no writable disk: serve the published snapshot read-only.
  return process.env.VERCEL ? 'published' : 'file';
}

/** True on the read-only public deployment (no admin, no local data file). */
export function isPublishedSite(): boolean {
  return getCMSBackend() === 'published';
}

const g = globalThis as unknown as { __cubeSupabaseAdmin?: SupabaseClient };

/**
 * Server-only privileged client. The service-role key bypasses RLS, so it must
 * never be imported into client components (it is only read from server env).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!g.__cubeSupabaseAdmin) {
    g.__cubeSupabaseAdmin = createClient(supabaseUrl(), serviceKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return g.__cubeSupabaseAdmin;
}

export const STORAGE_BUCKETS = {
  uploads: process.env.SUPABASE_UPLOADS_BUCKET || 'cms-uploads',
  resumes: process.env.SUPABASE_RESUMES_BUCKET || 'resumes',
} as const;
