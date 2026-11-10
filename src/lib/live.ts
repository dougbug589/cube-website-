'use client';

import { useEffect, useRef, useState } from 'react';

/** Fired on window whenever the CMS store changes (see LiveSync). */
export const CMS_UPDATED_EVENT = 'cube:cms-updated';

/** Run `callback` every time admin content changes (and on tab re-focus). */
export function useCmsUpdates(callback: () => void) {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(() => {
    const run = () => ref.current();
    window.addEventListener(CMS_UPDATED_EVENT, run);
    window.addEventListener('focus', run);
    return () => {
      window.removeEventListener(CMS_UPDATED_EVENT, run);
      window.removeEventListener('focus', run);
    };
  }, []);
}

/**
 * Keep a list in sync with a public CMS API endpoint.
 *
 * - Fetches on mount and again instantly whenever the admin saves anything.
 * - An empty array from the API is RESPECTED (e.g. everything archived), so
 *   archived content can never reappear via the hardcoded fallback.
 * - `fallback` is only used if the API is unreachable.
 */
export function useLiveList<T = any>(
  url: string,
  fallback: T[],
  transform?: (data: any[]) => T[],
  options: { skipInitialFetch?: boolean } = {}
): T[] {
  const [items, setItems] = useState<T[]>(fallback);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const load = async () => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(transformRef.current ? transformRef.current(data) : data);
      }
    } catch {
      // Network error: keep whatever we are showing.
    }
  };

  useEffect(() => {
    if (!options.skipInitialFetch) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useCmsUpdates(load);
  return items;
}
