'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Monogram } from '@/components/common/PersonCard';

/**
 * Governing Body as a shuffled deck of portrait cards: the top card flicks
 * off to the side with a spin and the next one rises to the front, the rest
 * sit fanned behind it. Full portraits only (no cropped strips). The name,
 * role and organisation of the top card slide in on a glass panel beside the
 * deck. Auto-advances; swipe/drag the top card (either way) or use the arrow
 * keys; pauses on hover, focus, off screen and in background tabs; reduced
 * motion = no auto-advance and simple fades. Transform/opacity only.
 */

type Member = { name: string; role?: string; organization?: string; image?: string };

const VISIBLE = 4; // cards drawn in the stack (the 4th fades in at the back)
const SPRING = { type: 'spring' as const, stiffness: 260, damping: 26, mass: 0.9 };
const EASE = [0.22, 1, 0.36, 1] as const;

export default function BoardDeck({ members, interval = 2200, label }: { members: Member[]; interval?: number; label: string }) {
  const n = members.length;
  const [top, setTop] = useState(0);
  const [dir, setDir] = useState(-1); // which side the leaving card flies to
  const rootRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const inView = useRef(false);
  const lastMove = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const next = useCallback(
    (side = -1) => {
      lastMove.current = performance.now();
      setDir(side);
      setTop((t) => (t + 1) % n);
    },
    [n]
  );
  const prev = useCallback(() => {
    lastMove.current = performance.now();
    setDir(1);
    setTop((t) => (t - 1 + n) % n);
  }, [n]);

  useEffect(() => {
    if (reduced || n < 2) return;
    const id = setInterval(() => {
      if (paused.current || !inView.current || document.visibilityState !== 'visible') return;
      if (performance.now() - lastMove.current < interval * 0.9) return;
      next(-1);
    }, interval);
    return () => clearInterval(id);
  }, [reduced, n, interval, next]);

  if (n === 0) return null;
  const m = members[top];
  const stack = Array.from({ length: Math.min(VISIBLE, n) }, (_, depth) => ({ depth, idx: (top + depth) % n }));

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next(-1);
        else if (e.key === 'ArrowLeft') prev();
      }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[34px]"
    >
      {/* the deck */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="relative w-[min(340px,78vw)] aspect-[4/5] mt-4 mb-8">
          <AnimatePresence initial={false} custom={dir}>
            {stack
              .slice()
              .reverse()
              .map(({ depth, idx }) => {
                const p = members[idx];
                const isTop = depth === 0;
                // fan the cards behind out to alternate sides so the deck reads as a deck
                const side = depth % 2 ? 1 : -1;
                const tilt = depth === 0 ? 0 : side * (4 + depth * 1.5);
                return (
                  <motion.div
                    key={p.name}
                    custom={dir}
                    className="absolute inset-0"
                    style={{ zIndex: 10 - depth, touchAction: 'pan-y' }}
                    initial={{ opacity: 0, y: 30, scale: 0.88, rotate: 0 }}
                    animate={{
                      opacity: depth >= VISIBLE - 1 ? 0 : 1,
                      y: depth * 10,
                      x: depth === 0 ? 0 : side * (18 + depth * 10),
                      scale: 1 - depth * 0.04,
                      rotate: tilt,
                    }}
                    exit={
                      reduced
                        ? { opacity: 0, transition: { duration: 0.25 } }
                        : {
                            x: dir * 420,
                            y: -40,
                            rotate: dir * 22,
                            opacity: 0,
                            zIndex: 20,
                            transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                          }
                    }
                    transition={SPRING}
                    drag={isTop ? 'x' : false}
                    dragSnapToOrigin
                    dragElastic={0.6}
                    onDragEnd={(_, info) => {
                      if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) next(info.offset.x < 0 ? -1 : 1);
                    }}
                    whileDrag={{ scale: 1.03, rotate: 0 }}
                  >
                    <div
                      className={`relative w-full h-full rounded-[30px] overflow-hidden bg-[#1A1F22] ${
                        isTop ? 'ring-2 ring-[#F6C22E] shadow-[0_0_30px_-4px_rgba(246,194,46,0.45),0_30px_60px_-24px_rgba(0,0,0,0.85)] cursor-grab active:cursor-grabbing' : 'shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)]'
                      }`}
                    >
                      {p.image ? (
                        <Image src={p.image} alt={isTop ? p.name : ''} fill sizes="340px" className="object-cover object-[50%_22%] pointer-events-none" draggable={false} />
                      ) : (
                        <Monogram name={p.name} className="absolute inset-0" />
                      )}
                      {/* cards further back sit in shadow */}
                      <span aria-hidden className="absolute inset-0 bg-[#0B0D0E] pointer-events-none transition-opacity duration-500" style={{ opacity: depth * 0.18 }} />
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      </div>

      {/* details of the top card */}
      <div className="lg:col-span-7 liquid-glass rounded-[30px] p-7 sm:p-9 lg:p-11 min-h-[260px] flex flex-col">
        <p className="font-display text-[15px] font-extrabold tabular-nums text-[#A7B2B8]">
          <span className="text-[#F6C22E]">{String(top + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
        </p>
        <div className="mt-4 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={m.name}
              initial={{ opacity: 0, x: reduced ? 0 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduced ? 0 : -16 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              <p className="label-mono">{m.role || 'Board Member'}</p>
              <h3 className="mt-3 font-display text-[30px] sm:text-[40px] font-extrabold text-[#F3F5F6] leading-tight">{m.name}</h3>
              {m.organization && <p className="mt-3 text-[18px] sm:text-[19px] text-[#DDE3E6] leading-relaxed max-w-2xl">{m.organization}</p>}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
