'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Monogram } from '@/components/common/PersonCard';

/**
 * 3D cylinder carousel (after the Codrops / CodePen "3D carousel" pattern):
 * every portrait sits on the outside of a drum that turns one step at a time.
 * The card facing you is lit with its name plate; cards further round the
 * drum fade into shadow, and the far side is hidden (backface). Endless,
 * auto-advancing, drag/swipe to spin, click a card to bring it to the front,
 * arrow keys; pauses on hover, focus, off screen and in background tabs;
 * reduced motion = no auto-spin. Only transform + opacity animate.
 */

type Person = { name: string; role?: string; organization?: string; department?: string; image?: string };

const SPRING = { type: 'spring' as const, stiffness: 120, damping: 22, mass: 0.9 };

export default function RingCarousel({ people, interval = 2000, label }: { people: Person[]; interval?: number; label: string }) {
  const n = people.length;
  const [v, setV] = useState(0); // unbounded: the drum keeps turning the same way
  const rootRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1200);
  const paused = useRef(false);
  const inView = useRef(false);
  const lastMove = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const go = useCallback((d: number) => {
    lastMove.current = performance.now();
    setV((x) => x + d);
  }, []);

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

  // drag / swipe: every ~cardW/2 of travel turns one step
  const down = useRef<{ x: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  if (n === 0) return null;

  const phone = w < 640;
  const cardW = phone ? 210 : 250;
  const cardH = phone ? 330 : 380;
  const gap = phone ? 14 : 22;
  const theta = 360 / n;
  const radius = ((cardW + gap) * n) / (2 * Math.PI);
  const active = ((v % n) + n) % n;

  return (
    <div
      ref={rootRef}
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
      onPointerDown={(e) => (down.current = { x: e.clientX, moved: false })}
      onPointerUp={(e) => {
        if (!down.current) return;
        const dx = e.clientX - down.current.x;
        down.current = null;
        if (Math.abs(dx) > 40) {
          suppressClick.current = true;
          go(-Math.sign(dx) * Math.max(1, Math.round(Math.abs(dx) / (cardW * 0.6))));
          setTimeout(() => (suppressClick.current = false), 0);
        }
      }}
      onPointerCancel={() => (down.current = null)}
      className="relative overflow-hidden select-none touch-pan-y focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[32px]"
      style={{ height: cardH + 115, perspective: phone ? 1100 : 1700 }}
    >
      {/* the drum */}
      <motion.div
        className="absolute left-1/2 top-[40px]"
        style={{ width: cardW, height: cardH, marginLeft: -cardW / 2, transformStyle: 'preserve-3d', z: -radius }}
        initial={false}
        animate={{ rotateY: -v * theta }}
        transition={SPRING}
      >
        {people.map((p, k) => {
          // signed distance (in steps) from the front card
          let d = (k - active) % n;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const ad = Math.abs(d);
          const front = ad === 0;
          return (
            <div
              key={p.name + k}
              className="absolute inset-0"
              style={{ transform: `rotateY(${k * theta}deg) translateZ(${radius}px)`, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              aria-hidden={!front}
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  if (suppressClick.current || front) return;
                  go(d);
                }}
                className={`relative block w-full h-full rounded-[26px] overflow-hidden bg-[#1A1F22] text-left transition-shadow duration-500 ${
                  front ? 'ring-2 ring-[#F6C22E] shadow-[0_0_30px_-4px_rgba(246,194,46,0.5),0_30px_60px_-20px_rgba(0,0,0,0.8)]' : 'cursor-pointer'
                }`}
              >
                {p.image ? (
                  <Image src={p.image} alt={front ? p.name : ''} fill sizes={`${cardW}px`} className="object-cover object-[50%_20%]" draggable={false} />
                ) : (
                  <Monogram name={p.name} className="absolute inset-0" />
                )}
                {/* name plate */}
                <span className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#0B0D0E]/95 via-[#0B0D0E]/70 to-transparent pt-12">
                  <span className="block font-display text-[18px] font-bold text-white leading-snug">{p.name}</span>
                  {p.role && <span className="mt-0.5 block text-[14px] font-semibold text-[#F6C22E] leading-snug line-clamp-2">{p.role}</span>}
                </span>
                {/* shade cards as they turn away */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[#0B0D0E] transition-opacity duration-700 pointer-events-none"
                  style={{ opacity: Math.min(0.78, ad * 0.2) }}
                />
              </button>
            </div>
          );
        })}
      </motion.div>

      {/* who is in front, read out under the drum */}
      <p className="absolute inset-x-0 bottom-4 text-center text-[16px] text-[#C2CCD1] px-4 truncate" aria-live="polite">
        <span className="font-bold text-[#F3F5F6]">{people[active].name}</span>
        {(people[active].organization || people[active].department) && <> · {people[active].organization || people[active].department}</>}
      </p>
    </div>
  );
}
