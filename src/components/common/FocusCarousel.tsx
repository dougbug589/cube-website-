'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Horizontal "focus" carousel: one card sits in the middle at full size, its
 * neighbours shrink and dim towards the edges. Endless loop, auto-advances,
 * drag / swipe / arrow keys, click a side card to bring it to the middle.
 * No arrows or dots (site rule). Pauses on hover or keyboard focus, while off
 * screen or in a background tab, and never auto-advances for reduced motion.
 *
 * Positions are an unbounded "virtual" index: card keys are v-3 … v+3 and the
 * item shown is items[(key) mod n], so stepping just slides the same keyed
 * cards along (springs) and mounts one new card at the hidden edge. No
 * cloning or snap-back needed.
 */

const SPRING = { type: 'spring' as const, stiffness: 240, damping: 30, mass: 0.9 };
const mod = (a: number, n: number) => ((a % n) + n) % n;

export default function FocusCarousel<T>({
  items,
  render,
  label,
  interval = 4000,
  heightClass = 'h-[300px]',
  maxCard = 560,
  keyOf,
  variant = 'focus',
}: {
  items: T[];
  render: (item: T, active: boolean) => React.ReactNode;
  label: string;
  interval?: number;
  /** fixed height of the stage (cards fill it) */
  heightClass?: string;
  /** widest the middle card gets, px */
  maxCard?: number;
  keyOf?: (item: T, i: number) => string;
  /** focus: middle card large, neighbours shrink/dim. equal: a row of identical
   *  cards (1 on phones, 3 from 768px) that all slide along together */
  variant?: 'focus' | 'equal';
}) {
  const n = items.length;
  const [v, setV] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  const paused = useRef(false);
  const inView = useRef(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const lastMove = useRef(0);
  const go = useCallback((d: number) => {
    lastMove.current = performance.now();
    setV((x) => x + d);
  }, []);

  // auto-advance: one interval; skips a beat after a manual move, and while
  // hovered / focused / off screen / in a background tab
  useEffect(() => {
    if (reduced || n < 2) return;
    const id = setInterval(() => {
      if (paused.current || !inView.current || document.visibilityState !== 'visible') return;
      if (performance.now() - lastMove.current < interval * 0.9) return;
      lastMove.current = performance.now();
      setV((x) => x + 1);
    }, interval);
    return () => clearInterval(id);
  }, [reduced, n, interval]);

  // drag / swipe
  const downX = useRef<number | null>(null);
  const moved = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    downX.current = e.clientX;
    moved.current = false;
  };
  const onUp = (e: React.PointerEvent) => {
    if (downX.current === null) return;
    const dx = e.clientX - downX.current;
    downX.current = null;
    if (Math.abs(dx) > 45) {
      moved.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };

  if (n === 0) return null;

  const equal = variant === 'equal';
  const perView = width < 768 ? 1 : 3;
  const GAP = 20;
  const cardW = equal
    ? (width - GAP * (perView - 1)) / perView
    : Math.min(maxCard, Math.max(260, width * (width < 640 ? 0.84 : 0.46)));
  const step = equal ? cardW + GAP : cardW * 0.92 + 28; // focus: neighbours (scaled 0.86) sit clear of the middle card
  const span = equal ? (perView - 1) / 2 : width < 640 ? 1 : 2; // visible cards each side

  const slots: number[] = [];
  for (let d = -(span + 1); d <= span + 1; d++) slots.push(v + d);

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        else if (e.key === 'ArrowLeft') go(-1);
      }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => (downX.current = null)}
      className={`relative ${heightClass} overflow-hidden select-none touch-pan-y focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[32px]`}
      // no mask-image here: it would cut the cards' backdrop blur (liquid glass)
    >
      {slots.map((key) => {
        const d = key - v;
        const ad = Math.abs(d);
        const idx = mod(key, n);
        const active = d === 0;
        const hidden = ad > span;
        return (
          <motion.div
            key={key}
            className="absolute top-0 bottom-0 left-1/2"
            style={{ width: cardW, marginLeft: -cardW / 2, zIndex: 10 - ad, pointerEvents: hidden ? 'none' : 'auto' }}
            initial={equal ? { x: d * step, scale: 1, opacity: 1 } : { x: d * step, scale: 0.78, opacity: 0 }}
            animate={
              equal
                ? // identical cards; ones outside the row are clipped by the stage, so they slide in/out
                  { x: d * step, scale: 1, opacity: 1 }
                : {
                    x: d * step,
                    scale: active ? 1 : ad === 1 ? 0.86 : 0.76,
                    opacity: hidden ? 0 : active ? 1 : ad === 1 ? 0.55 : 0.25,
                  }
            }
            transition={SPRING}
            aria-hidden={equal ? hidden : !active}
            onClickCapture={(e) => {
              if (moved.current) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (!active && !equal) {
                e.preventDefault();
                e.stopPropagation();
                go(d);
              }
            }}
          >
            <div className={`h-full ${active || equal ? '' : 'cursor-pointer'}`} key={keyOf ? keyOf(items[idx], idx) : idx}>
              {render(items[idx], active)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
