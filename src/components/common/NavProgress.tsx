'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Gold progress line for page changes. It appears only if a navigation takes
 * longer than ~100 ms (fast, prefetched pages never flash it), creeps towards
 * 85% while waiting and snaps to 100% and fades when the new page is shown.
 * Driven by direct style writes (transform/opacity), no React re-renders.
 */
export default function NavProgress() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<number | null>(null);
  const shown = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const start = () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => {
        shown.current = true;
        bar.style.transition = 'none';
        bar.style.opacity = '1';
        bar.style.transform = 'scaleX(0.1)';
        void bar.offsetWidth; // commit the start state before animating
        bar.style.transition = 'transform 2.8s cubic-bezier(0.08, 0.7, 0.2, 1)';
        bar.style.transform = 'scaleX(0.85)';
      }, 100);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a || !a.href || a.hasAttribute('download')) return;
      if (a.target && a.target !== '_self') return;
      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      if (url.origin !== location.origin || url.pathname.startsWith('/admin')) return;
      if (url.pathname === location.pathname) return; // same page or #anchor
      if (/\.(pdf|jpe?g|png|webp|mp4|docx?|xlsx?|zip)$/i.test(url.pathname)) return;
      start();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // New page rendered: finish (or cancel if it was never shown).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const bar = barRef.current;
    if (showTimer.current) clearTimeout(showTimer.current);
    if (!bar || !shown.current) return;
    shown.current = false;
    bar.style.transition = 'transform 0.2s ease-out, opacity 0.3s ease 0.15s';
    bar.style.transform = 'scaleX(1)';
    bar.style.opacity = '0';
  }, [pathname]);

  return <div ref={barRef} aria-hidden className="nav-progress" />;
}
