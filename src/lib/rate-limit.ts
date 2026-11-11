import crypto from 'crypto';
import { getCMSBackend, getSupabaseAdmin } from '@/lib/db/backend';

interface LocalRecord {
  count: number;
  windowStart: number;
}

const localRecords = new Map<string, LocalRecord>();

function storageKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function consumeLocal(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const existing = localRecords.get(key);
  if (!existing || now - existing.windowStart >= windowMs) {
    localRecords.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (existing.count >= max) {
    return { allowed: false, retryAfterMs: existing.windowStart + windowMs - now };
  }
  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/**
 * Atomically consume a request from a rate-limit bucket. Supabase-backed
 * deployments share buckets across instances; local development keeps the
 * existing in-process behavior when Supabase is not configured.
 */
export async function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterMs: number }> {
  const hashedKey = storageKey(key);
  if (getCMSBackend() !== 'supabase') return consumeLocal(hashedKey, max, windowMs);

  try {
    const { data, error } = await getSupabaseAdmin().rpc('consume_rate_limit', {
      p_key: hashedKey,
      p_max_requests: max,
      p_window_ms: windowMs,
    });
    if (error || !data) throw error || new Error('Rate-limit RPC returned no data');
    const result = Array.isArray(data) ? data[0] : data;
    return {
      allowed: Boolean(result.allowed),
      retryAfterMs: Number(result.retry_after_ms) || 0,
    };
  } catch (error) {
    console.error('Distributed rate-limit check failed; using local fallback:', error);
    return consumeLocal(hashedKey, max, windowMs);
  }
}

export async function clearRateLimit(key: string): Promise<void> {
  const hashedKey = storageKey(key);
  localRecords.delete(hashedKey);
  if (getCMSBackend() !== 'supabase') return;

  try {
    const { error } = await getSupabaseAdmin().rpc('clear_rate_limit', { p_key: hashedKey });
    if (error) throw error;
  } catch (error) {
    console.error('Distributed rate-limit clear failed:', error);
  }
}
