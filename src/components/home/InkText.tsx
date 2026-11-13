'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Text that inks in as it is read: each word goes from pale to full ink as the
 * block moves up through the viewport (word i is fully inked once the block's
 * progress passes its share). Driven by one scroll listener writing opacity on
 * the word spans in rAF; no React re-renders. Fully inked for reduced motion,
 * and the server HTML is fully inked too (no flash of pale text without JS).
 */
export default function InkText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>('[data-w]'));
    const n = spans.length;
    let frame = 0;
    let lastInked = -1;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the block's top is at 95% of the viewport, 1 when its bottom
      // reaches 75%: fully inked while it is still in the lower part of the
      // screen, so nobody ever has to read pale words.
      const start = vh * 0.95;
      const end = vh * 0.75;
      const progress = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const inked = progress * (n + 4); // a soft 4-word leading edge
      if (Math.abs(inked - lastInked) < 0.05) return;
      lastInked = inked;
      for (let i = 0; i < n; i++) {
        const k = Math.min(1, Math.max(0, inked - i) / 4);
        spans[i].style.opacity = String(0.22 + 0.78 * k);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [text]);

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span data-w className="transition-opacity duration-300 ease-out">
            {w}
          </span>{' '}
        </React.Fragment>
      ))}
    </p>
  );
}
