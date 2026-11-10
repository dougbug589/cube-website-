'use client';

import { RefObject, useEffect, useState } from 'react';

/**
 * Scroll-spy for the sticky in-page anchor bars (About, Media, Verticals).
 *
 * - Highlights the section the reader is currently looking at (previously the
 *   highlight only changed when a pill was tapped, so it was usually wrong).
 * - Keeps the active pill visible inside a horizontally scrolling bar, which
 *   matters on phones where most pills are off-screen.
 */
export function useScrollSpy(ids: string[], barRef?: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // A section becomes active once its top crosses ~35% of the viewport.
      const line = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom, short final sections can never reach the line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) {
        const last = [...ids].reverse().find((id) => document.getElementById(id));
        if (last) current = last;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Slide the active pill into view within the bar (horizontal only).
  useEffect(() => {
    const bar = barRef?.current;
    if (!bar) return;
    const pill = bar.querySelector<HTMLElement>(`[data-anchor="${active}"]`);
    if (!pill) return;
    const barRect = bar.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const target = bar.scrollLeft + (pillRect.left - barRect.left) - (barRect.width - pillRect.width) / 2;
    bar.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [active, barRef]);

  return [active, setActive] as const;
}
