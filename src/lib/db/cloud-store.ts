/**
 * Supabase (PostgreSQL) persistence for the CMS store.
 *
 * The CMS keeps exactly the same in-memory shape it always had (one object
 * with a key per collection). In the database each top-level key is one row
 * of `public.cms_store` holding that collection as JSONB:
 *
 *   key text PK | data jsonb | version int | updated_at timestamptz
 *
 * Safe for serverless / multi-instance hosting:
 *  - Only collections that actually changed are written.
 *  - Every write is conditional on the row version that was read
 *    (optimistic concurrency). If another instance saved first, the change is
 *    re-applied on top of the newer data, record by record (by `id`), so
 *    concurrent saves never overwrite each other.
 *
 * This module is framework-agnostic (no '@/...' imports) so it can be unit
 * tested with a fake client.
 */

export const CMS_TABLE = 'cms_store';

type Row = { key: string; data: unknown; version: number; updated_at?: string };

/** Minimal subset of the supabase-js client used here. */
export type CloudClient = {
  from: (table: string) => any;
};

interface Snapshot {
  json: Record<string, string>;
  versions: Record<string, number>;
}

const MAX_CONFLICT_RETRIES = 5;

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function hasIds(list: unknown): list is { id: string }[] {
  return (
    Array.isArray(list) &&
    list.every((x) => x && typeof x === 'object' && typeof (x as any).id === 'string')
  );
}

/**
 * Three-way merge for one collection.
 * base = what this instance read, ours = what it wants to save,
 * theirs = what another instance saved in the meantime.
 */
export function mergeCollection(base: unknown, ours: unknown, theirs: unknown): unknown {
  if (!hasIds(base) || !hasIds(ours) || !hasIds(theirs)) return ours;

  const baseMap = new Map(base.map((x) => [x.id, JSON.stringify(x)]));
  const oursMap = new Map(ours.map((x) => [x.id, x]));

  const removed = new Set(base.filter((x) => !oursMap.has(x.id)).map((x) => x.id));
  const modified = new Set(
    ours.filter((x) => baseMap.has(x.id) && baseMap.get(x.id) !== JSON.stringify(x)).map((x) => x.id)
  );

  // New records keep their relative position: before the first pre-existing
  // record (the usual `unshift`) go to the front, the rest to the back.
  const front: any[] = [];
  const back: any[] = [];
  let seenExisting = false;
  for (const item of ours) {
    if (baseMap.has(item.id)) {
      seenExisting = true;
    } else {
      (seenExisting ? back : front).push(item);
    }
  }

  const theirIds = new Set(theirs.map((x) => x.id));
  const merged = theirs
    .filter((x) => !removed.has(x.id))
    .map((x) => (modified.has(x.id) ? oursMap.get(x.id)! : x));

  return [
    ...front.filter((x) => !theirIds.has(x.id)),
    ...merged,
    ...back.filter((x) => !theirIds.has(x.id)),
  ];
}

export interface CloudDriver {
  /** Load the whole store (a private deep copy the caller may mutate). */
  load(): Promise<Record<string, unknown> | null>;
  /** Persist changed collections of a store previously returned by load(). */
  save(store: Record<string, unknown>): Promise<void>;
  /** Insert the initial store if the table is empty. */
  seed(store: Record<string, unknown>): Promise<void>;
  /** Monotonic-ish version stamp (ms) of the latest save. */
  version(): Promise<number>;
}

export function createCloudDriver(client: CloudClient, opts: { cacheMs?: number } = {}): CloudDriver {
  const cacheMs = opts.cacheMs ?? 1500;
  const snapshots = new WeakMap<object, Snapshot>();

  let cache: { rows: Row[]; at: number } | null = null;
  let inflight: Promise<Row[]> | null = null;

  async function fetchRows(): Promise<Row[]> {
    const { data, error } = await client.from(CMS_TABLE).select('key,data,version,updated_at');
    if (error) throw new Error(`CMS database read failed: ${error.message}`);
    return (data || []) as Row[];
  }

  async function getRows(): Promise<Row[]> {
    if (cache && Date.now() - cache.at < cacheMs) return cache.rows;
    if (!inflight) {
      inflight = fetchRows()
        .then((rows) => {
          cache = { rows, at: Date.now() };
          return rows;
        })
        .finally(() => {
          inflight = null;
        });
    }
    return inflight;
  }

  function updateCachedRow(key: string, data: unknown, version: number) {
    if (!cache) return;
    const rows = cache.rows.filter((r) => r.key !== key);
    rows.push({ key, data: clone(data), version, updated_at: new Date().toISOString() });
    cache = { rows, at: cache.at };
  }

  async function fetchRow(key: string): Promise<Row | null> {
    const { data, error } = await client
      .from(CMS_TABLE)
      .select('key,data,version,updated_at')
      .eq('key', key)
      .maybeSingle();
    if (error) throw new Error(`CMS database read failed: ${error.message}`);
    return (data as Row) || null;
  }

  /** Conditional write. Returns the new version, or null on a version conflict. */
  async function tryWrite(key: string, data: unknown, expected: number | undefined): Promise<number | null> {
    const now = new Date().toISOString();
    if (expected === undefined) {
      const { error } = await client.from(CMS_TABLE).insert({ key, data, version: 1, updated_at: now });
      if (!error) return 1;
      if (error.code === '23505') return null; // someone created it first
      throw new Error(`CMS database write failed (${key}): ${error.message}`);
    }
    const { data: updated, error } = await client
      .from(CMS_TABLE)
      .update({ data, version: expected + 1, updated_at: now })
      .eq('key', key)
      .eq('version', expected)
      .select('version');
    if (error) throw new Error(`CMS database write failed (${key}): ${error.message}`);
    return Array.isArray(updated) && updated.length > 0 ? expected + 1 : null;
  }

  return {
    async load() {
      const rows = await getRows();
      if (rows.length === 0) return null;

      const store: Record<string, unknown> = {};
      const snap: Snapshot = { json: {}, versions: {} };
      for (const row of rows) {
        store[row.key] = clone(row.data);
        snap.json[row.key] = JSON.stringify(row.data);
        snap.versions[row.key] = row.version;
      }
      snapshots.set(store, snap);
      return store;
    },

    async save(store) {
      let snap = snapshots.get(store);
      if (!snap) {
        snap = { json: {}, versions: {} };
        snapshots.set(store, snap);
      }

      for (const key of Object.keys(store)) {
        const value = store[key];
        if (value === undefined) continue;
        const json = JSON.stringify(value);
        if (snap.json[key] === json) continue; // unchanged

        // Our change is always measured against what we originally read...
        const base: unknown = snap.json[key] !== undefined ? JSON.parse(snap.json[key]) : [];
        let toWrite: unknown = value;
        let expected: number | undefined = snap.versions[key];

        for (let attempt = 0; ; attempt++) {
          const written = await tryWrite(key, toWrite, expected);
          if (written !== null) {
            snap.json[key] = JSON.stringify(toWrite);
            snap.versions[key] = written;
            if (toWrite !== value) store[key] = clone(toWrite);
            updateCachedRow(key, toWrite, written);
            break;
          }
          if (attempt >= MAX_CONFLICT_RETRIES) {
            throw new Error(`CMS database write conflict on "${key}" — please retry.`);
          }
          // ...and re-applied on top of the newest data another instance saved.
          const theirs = await fetchRow(key);
          toWrite = theirs ? mergeCollection(base, value, theirs.data) : value;
          expected = theirs ? theirs.version : undefined;
        }
      }
    },

    async seed(initial) {
      const now = new Date().toISOString();
      const rows = Object.entries(initial)
        .filter(([, v]) => v !== undefined)
        .map(([key, data]) => ({ key, data, version: 1, updated_at: now }));
      const { error } = await client
        .from(CMS_TABLE)
        .upsert(rows, { onConflict: 'key', ignoreDuplicates: true });
      if (error) throw new Error(`CMS database seed failed: ${error.message}`);
      cache = null;
    },

    async version() {
      const { data, error } = await client
        .from(CMS_TABLE)
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);
      if (error || !data || data.length === 0) return 0;
      const t = Date.parse((data[0] as any).updated_at);
      return Number.isFinite(t) ? t : 0;
    },
  };
}
