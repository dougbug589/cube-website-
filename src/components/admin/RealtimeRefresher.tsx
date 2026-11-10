'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RealtimeRefresher({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        router.refresh();
      }
    };

    const timer = setInterval(refresh, intervalMs);
    window.addEventListener('focus', refresh);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [router, intervalMs]);

  return null;
}
