'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Global scroll-reveal engine.
 * `.reveal` fades + rises once when it enters the viewport;
 * `.reveal-stagger` does the same for its direct children with a short cascade.
 * A MutationObserver picks up content that mounts later (route changes, live CMS
 * refreshes) without rescanning the whole document on a timer.
 * Reduced motion is handled in CSS (elements render visible, no transition).
 */
export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Reveal on entry, and also anything already scrolled past (anchor
          // jumps, restored scroll position) so content above never stays hidden.
          if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }
    );

    const selector = '.reveal:not(.revealed), .reveal-stagger:not(.revealed)';
    const observe = (root: ParentNode) => root.querySelectorAll(selector).forEach((el) => io.observe(el));
    observe(document);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n instanceof Element) {
            if (n.matches(selector)) io.observe(n);
            observe(n);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
