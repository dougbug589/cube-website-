'use client';

import { useEffect } from 'react';

/**
 * Removes service workers and Cache Storage entries left behind by older
 * deployments of this site. A stale service worker can keep serving an old
 * cached HTML/JS bundle (e.g. the previous dark theme) on the first
 * navigation until the page is refreshed. This runs once per page load and
 * is a no-op when there is nothing to clean up.
 */
export default function LegacyCacheCleanup() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister().catch(() => {});
          });
        })
        .catch(() => {});
    }

    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {});
    }
  }, []);

  return null;
}
