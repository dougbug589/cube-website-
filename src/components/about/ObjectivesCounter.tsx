'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Objectives as a "counter" slideshow: a huge yellow number rolls up to the
 * next one like an odometer while the objective slides in on a glass panel
 * beside it; a row of numbered pills (the current one lit) jumps to any
 * objective. Auto-advances; pauses on hover, focus, off screen and in
 * background tabs; arrow keys; reduced motion = no auto-advance, plain fades.
 * Transform/opacity only.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ObjectivesCounter({ items, interval = 2200 }: { items: string[]; interval?: number }) {
  const n = items.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
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

  const go = useCallback(
    (to: number) => {
      lastMove.current = performance.now();
      setI((cur) => {
        const next = ((to % n) + n) % n;
        setDir(next >= cur ? 1 : -1);
        return next;
      });
    },
    [n]
  );

  useEffect(() => {
    if (reduced || n < 2) return;
    const id = setInterval(() => {
      if (paused.current || !inView.current || document.visibilityState !== 'visible') return;
      if (performance.now() - lastMove.current < interval * 0.9) return;
      lastMove.current = performance.now();
      setDir(1);
      setI((x) => (x + 1) % n);
    }, interval);
    return () => clearInterval(id);
  }, [reduced, n, interval]);

  if (n === 0) return null;
  const num = String(i + 1).padStart(2, '0');
  const roll = reduced ? 0 : 1;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Objectives"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(i + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(i - 1);
      }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[34px]"
    >
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        {/* the rolling number: each digit is its own odometer wheel */}
        <div className="lg:col-span-4 flex lg:flex-col items-end lg:items-start gap-4">
          <div
            className="flex font-display font-extrabold leading-none tabular-nums text-[120px] sm:text-[160px] lg:text-[220px] tracking-[-0.04em]"
            // glow on the container (after the digit windows clip), so it follows the digits instead of boxing them
            style={{ filter: 'drop-shadow(0 0 22px rgba(246, 194, 46, 0.35))' }}
            aria-hidden
          >
            {num.split('').map((digit, k) => (
              <span key={k} className="relative inline-block overflow-hidden h-[1em] w-[0.62em]">
                <AnimatePresence initial={false} custom={dir}>
                  <motion.span
                    key={digit}
                    custom={dir}
                    className="absolute inset-0 text-center text-[#F6C22E]"
                    initial={{ y: `${dir * 100 * roll}%`, opacity: reduced ? 0 : 1 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: `${-dir * 100 * roll}%`, opacity: reduced ? 0 : 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    {digit}
                  </motion.span>
                </AnimatePresence>
              </span>
            ))}
          </div>
          <p className="pb-4 lg:pb-0 font-display text-[18px] font-extrabold text-[#A7B2B8] tabular-nums">
            of {String(n).padStart(2, '0')} objectives
          </p>
        </div>

        {/* the objective */}
        {/* old and new sentence share one grid cell and cross over at the same
            moment the number rolls (no wait between them) */}
        <div className="lg:col-span-8 liquid-glass rounded-[32px] p-7 sm:p-10 lg:p-12 min-h-[230px] sm:min-h-[260px] grid items-center overflow-hidden">
          <AnimatePresence initial={false} custom={dir}>
            <motion.p
              key={i}
              custom={dir}
              initial={{ opacity: 0, y: reduced ? 0 : 40 * dir }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -40 * dir }}
              transition={{ duration: 0.5, ease: EASE }}
              className="[grid-area:1/1] font-display text-[23px] sm:text-[28px] lg:text-[32px] font-bold leading-[1.35] text-[#F3F5F6]"
            >
              {items[i]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* every objective: jump to it */}
      <ol className="mt-8 lg:mt-10 flex flex-wrap gap-2.5" aria-label="All objectives">
        {items.map((obj, k) => {
          const on = k === i;
          return (
            <li key={k}>
              <button
                type="button"
                onClick={() => go(k)}
                aria-label={`Objective ${k + 1}: ${obj}`}
                aria-current={on ? 'true' : undefined}
                className={`press rounded-full h-12 min-w-12 px-4 font-display text-[17px] font-extrabold tabular-nums transition-colors duration-300 ${
                  on ? 'pill-yellow text-[#0B0D0E]' : 'glass text-[#C2CCD1] hover:text-[#F3F5F6]'
                }`}
              >
                {String(k + 1).padStart(2, '0')}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
