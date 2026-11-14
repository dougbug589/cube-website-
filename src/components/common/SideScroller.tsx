'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A row that scrolls sideways: swipe or trackpad, the mouse wheel while the
 * pointer is over it (eased; at either end the wheel goes back to scrolling
 * the page), click-and-drag with a mouse (a drag never fires a click), or
 * arrow keys when focused. Snaps card by card on phones. A thin yellow bar
 * under it shows the position; the edges fade only on the side with more to
 * show. Children are the <li> items.
 */
export default function SideScroller({
  children,
  ariaLabel,
  label,
  className = 'gap-6',
}: {
  children: React.ReactNode;
  ariaLabel: string;
  /** optional caption above the row; " · scroll sideways" is added when it scrolls */
  label?: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLOListElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const [thumb, setThumb] = useState(1); // visible share of the track, 0..1

  const measure = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    setEdge({ start: t.scrollLeft <= 4, end: t.scrollLeft >= max - 4 });
    const share = t.clientWidth / t.scrollWidth;
    setThumb(share);
    // position bar: written straight to the DOM on every scroll frame
    if (thumbRef.current) thumbRef.current.style.transform = `translateX(${max > 0 ? (t.scrollLeft / max) * ((1 - share) / share) * 100 : 0}%)`;
  }, []);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    measure();
    t.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(t);

    // vertical wheel -> eased sideways scroll, until the track reaches an end
    let target = t.scrollLeft;
    let raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const glide = () => {
      const d = target - t.scrollLeft;
      if (Math.abs(d) < 0.5) {
        t.scrollLeft = target;
        raf = 0;
        return;
      }
      t.scrollLeft += d * 0.18;
      raf = requestAnimationFrame(glide);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // pinch zoom / trackpad sideways: native
      const max = t.scrollWidth - t.clientWidth;
      if (max <= 0) return;
      const from = raf ? target : t.scrollLeft;
      const delta = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? t.clientWidth : 1);
      if ((delta > 0 && from >= max - 1) || (delta < 0 && from <= 1)) return; // at the end: let the page scroll
      e.preventDefault();
      target = Math.max(0, Math.min(max, from + delta));
      if (reduce) t.scrollLeft = target;
      else if (!raf) raf = requestAnimationFrame(glide);
    };
    t.addEventListener('wheel', onWheel, { passive: false });

    // click-and-drag with a mouse (touch and pen keep native scrolling)
    let drag: { x: number; left: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(raf);
      raf = 0;
      drag = { x: e.clientX, left: t.scrollLeft, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 4) return;
      if (!drag.moved) {
        drag.moved = true;
        t.setPointerCapture(e.pointerId);
        t.style.cursor = 'grabbing';
        t.style.userSelect = 'none';
      }
      t.scrollLeft = drag.left - dx;
      target = t.scrollLeft;
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      if (drag.moved) {
        // swallow the click that ends a drag
        const stop = (ev: Event) => ev.preventDefault();
        t.addEventListener('click', stop, { capture: true, once: true });
        setTimeout(() => t.removeEventListener('click', stop, { capture: true }), 0);
        if (t.hasPointerCapture(e.pointerId)) t.releasePointerCapture(e.pointerId);
      }
      t.style.cursor = '';
      t.style.userSelect = '';
      drag = null;
    };
    t.addEventListener('pointerdown', onDown);
    t.addEventListener('pointermove', onMove);
    t.addEventListener('pointerup', onUp);
    t.addEventListener('pointercancel', onUp);

    return () => {
      t.removeEventListener('scroll', measure);
      t.removeEventListener('wheel', onWheel);
      t.removeEventListener('pointerdown', onDown);
      t.removeEventListener('pointermove', onMove);
      t.removeEventListener('pointerup', onUp);
      t.removeEventListener('pointercancel', onUp);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measure]);

  const scrollable = thumb < 0.995;
  const fade = `linear-gradient(to right, ${edge.start ? '#000' : 'transparent'} 0, #000 ${edge.start ? '0' : '48px'}, #000 calc(100% - ${edge.end ? '0px' : '72px'}), ${edge.end ? '#000' : 'transparent'} 100%)`;

  return (
    <div>
      {label && (
        <p className="label-mono mb-6">
          {label}
          {scrollable ? ' · scroll sideways' : ''}
        </p>
      )}

      <ol
        ref={trackRef}
        tabIndex={0}
        aria-label={ariaLabel}
        onDragStart={(e) => e.preventDefault()}
        className={`flex overflow-x-auto snap-x snap-mandatory md:snap-none scroll-px-1 pb-4 md:cursor-grab [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[30px] ${className}`}
        style={{ WebkitMaskImage: fade, maskImage: fade }}
      >
        {children}
      </ol>

      {/* position bar */}
      {scrollable && (
        <div aria-hidden className="mt-4 h-[3px] rounded-full bg-white/10 overflow-hidden">
          <span ref={thumbRef} className="block h-full rounded-full bg-[#F6C22E]" style={{ width: `${thumb * 100}%` }} />
        </div>
      )}
    </div>
  );
}
