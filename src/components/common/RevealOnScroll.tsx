'use client';

import React, { useEffect } from 'react';

/**
 * Global scroll-reveal engine: any element with the `.reveal` class
 * animates in (fade + rise) the first time it enters the viewport.
 * Respects prefers-reduced-motion via CSS.
 */
export default function RevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const scan = () => {
      document.querySelectorAll('.reveal:not(.revealed)').forEach((el) => observer.observe(el));
    };
    scan();
    // Re-scan when SPA route content settles
    const t = setTimeout(scan, 800);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return null;
}
