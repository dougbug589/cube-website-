'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Endless horizontal marquee: one or more rows drifting sideways, alternate
 * rows in opposite directions, edges fading out. Hover pauses; drag scrubs
 * (with a little momentum). Each row's content is rendered twice and the
 * offset wraps at half the track, so the loop is seamless. Motion is a rAF
 * loop writing transform directly (no React renders), stopped while off
 * screen or in a background tab; reduced motion = no drift, drag only.
 */
export default function Marquee({
  rows,
  speed = 34,
  gapClass = 'gap-4',
  label,
}: {
  rows: React.ReactNode[][];
  /** px per second */
  speed?: number;
  gapClass?: string;
  label: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tracks = trackRefs.current.filter(Boolean) as HTMLDivElement[];
    const pos = tracks.map((_, i) => (i % 2 ? -0.5 : 0)); // fraction of half-width; odd rows start offset
    // loop length = where the second copy starts (copy width + gap)
    const period = (t: HTMLDivElement) => (t.children[1] as HTMLElement | undefined)?.offsetLeft || t.scrollWidth / 2;
    const half = tracks.map(period);
    const x = tracks.map((_, i) => pos[i] * half[i]);
    let hover = false;
    let inView = false;
    let raf = 0;
    let last = 0;
    let drag: { row: number; startX: number; startOff: number; lastX: number; lastT: number; vel: number } | null = null;
    const fling = tracks.map(() => 0);

    const wrap = (i: number) => {
      const h = half[i];
      if (h <= 0) return;
      while (x[i] <= -h) x[i] += h;
      while (x[i] > 0) x[i] -= h;
    };
    const paint = (i: number) => {
      tracks[i].style.transform = `translate3d(${x[i]}px,0,0)`;
    };
    tracks.forEach((_, i) => {
      wrap(i);
      paint(i);
    });

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(64, t - last) / 1000 : 0;
      last = t;
      if (!inView || document.visibilityState !== 'visible') return;
      tracks.forEach((_, i) => {
        if (drag && drag.row === i) return;
        const dir = i % 2 ? 1 : -1;
        let dx = 0;
        if (!hover && !reduced) dx += dir * speed * dt;
        if (Math.abs(fling[i]) > 1) {
          dx += fling[i] * dt;
          fling[i] *= Math.pow(0.04, dt); // ease out in ~1 s
        } else fling[i] = 0;
        if (dx) {
          x[i] += dx;
          wrap(i);
          paint(i);
        }
      });
    };
    raf = requestAnimationFrame(frame);

    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0 });
    io.observe(root);
    const ro = new ResizeObserver(() => {
      tracks.forEach((t, i) => {
        half[i] = period(t);
        wrap(i);
        paint(i);
      });
    });
    tracks.forEach((t) => ro.observe(t));

    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);
    const rowOf = (target: EventTarget | null) => tracks.findIndex((t) => t.contains(target as Node));
    const onDown = (e: PointerEvent) => {
      const row = rowOf(e.target);
      if (row < 0) return;
      drag = { row, startX: e.clientX, startOff: x[row], lastX: e.clientX, lastT: performance.now(), vel: 0 };
      fling[row] = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const now = performance.now();
      const i = drag.row;
      x[i] = drag.startOff + (e.clientX - drag.startX);
      wrap(i);
      // keep the drag anchor valid after a wrap
      drag.startOff = x[i] - (e.clientX - drag.startX);
      paint(i);
      const dtm = Math.max(1, now - drag.lastT);
      drag.vel = ((e.clientX - drag.lastX) / dtm) * 1000;
      drag.lastX = e.clientX;
      drag.lastT = now;
    };
    const onUp = () => {
      if (!drag) return;
      fling[drag.row] = Math.max(-2400, Math.min(2400, drag.vel));
      drag = null;
    };
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [rows, speed]);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={label}
      className="relative space-y-4 overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing py-2"
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)',
      }}
    >
      {rows.map((row, r) => (
        <div key={r} ref={(el) => { trackRefs.current[r] = el; }} className={`flex w-max will-change-transform ${gapClass}`}>
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1 || undefined} className={`flex shrink-0 ${gapClass}`}>
              {row.map((node, i) => (
                <div key={i} className="shrink-0" draggable={false} onDragStart={(e) => e.preventDefault()}>
                  {node}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
