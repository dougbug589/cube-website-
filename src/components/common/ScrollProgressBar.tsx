'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Gold reading-progress hairline.
 * Compositor-only: updates `transform: scaleX()` directly on the element inside a
 * rAF, so scrolling never triggers React renders or layout.
 */
export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div aria-hidden className="fixed top-0 inset-x-0 h-[2px] z-[60] pointer-events-none">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-[#D89F03] via-[#D89F03] to-[#D89F03] will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
