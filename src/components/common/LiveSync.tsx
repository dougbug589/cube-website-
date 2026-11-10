'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CMS_UPDATED_EVENT } from '@/lib/live';

/**
 * Subscribes to /api/public/live. When an admin saves content, every open tab
 * re-renders server components (router.refresh) and client lists refetch
 * (CMS_UPDATED_EVENT) within ~1 second. Falls back to polling if SSE fails.
 */
export default function LiveSync() {
  const router = useRouter();

  useEffect(() => {
    let lastVersion: string | null = null;
    let es: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let debounce: ReturnType<typeof setTimeout> | null = null;

    const announce = () => {
      if (debounce) clearTimeout(debounce);
      // Coalesce bursts of saves into a single refresh.
      debounce = setTimeout(() => {
        window.dispatchEvent(new Event(CMS_UPDATED_EVENT));
        router.refresh();
      }, 150);
    };

    const onVersion = (version: string) => {
      if (lastVersion !== null && version !== lastVersion) announce();
      lastVersion = version;
    };

    if (typeof EventSource !== 'undefined') {
      es = new EventSource('/api/public/live');
      es.addEventListener('version', (e) => onVersion((e as MessageEvent).data));
    } else {
      pollTimer = setInterval(() => router.refresh(), 15000);
    }

    return () => {
      es?.close();
      if (pollTimer) clearInterval(pollTimer);
      if (debounce) clearTimeout(debounce);
    };
  }, [router]);

  return null;
}
