'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, HeartHandshake, Lightbulb, Mountain, ShieldCheck, Target } from 'lucide-react';

/**
 * Core values as a vertical "picker wheel" (like the iOS date picker): the
 * value names roll upward on a 3D drum, the current one large and lit in the
 * middle, neighbours tilting away above and below; the quote card beside it
 * slides up in step (old and new share one grid cell, so there is no gap
 * between the wheel and the card). Endless (keys run v-3 … v+3), auto-
 * advances, click a name to roll to it, arrow keys; pauses on hover, focus,
 * off screen and in background tabs; reduced motion = no auto-advance and
 * fades. Transform/opacity only.
 */

type Value = { title: string; description: string };
const ICONS = [ShieldCheck, Award, HeartHandshake, Mountain, Lightbulb, Target];
const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: 'spring' as const, stiffness: 170, damping: 24, mass: 0.9 };
const mod = (a: number, n: number) => ((a % n) + n) % n;

const split = (d: string) => {
  const m = d.match(/^\s*[“"]?([\s\S]*?)[”"]?\s*[—–-]\s*([^—–-]+)$/);
  return m ? { quote: m[1].trim(), author: m[2].trim() } : { quote: d, author: '' };
};

export default function CoreValuesPicker({ values, interval = 1800 }: { values: Value[]; interval?: number }) {
  const n = values.length;
  const [v, setV] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const inView = useRef(false);
  const lastMove = useRef(0);
  const [reduced, setReduced] = useState(false);
  const [rowH, setRowH] = useState(84);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setRowH(e.contentRect.width < 640 ? 58 : 84));
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

  if (n === 0) return null;
  const active = mod(v, n);
  const { quote, author } = split(values[active].description);
  const Icon = ICONS[active % ICONS.length];
  const slots = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Core values"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go(1);
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go(-1);
      }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[34px]"
    >
      {/* the wheel */}
      <div className="lg:col-span-5 relative select-none" style={{ height: rowH * 5, perspective: 900 }}>
        {/* the selection band */}
        <span aria-hidden className="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-[22px] liquid-glass ring-1 ring-[#F6C22E]/40" style={{ height: rowH + 8 }} />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
          }}
        >
          {slots.map((d) => {
            const key = v + d;
            const k = mod(key, n);
            const ad = Math.abs(d);
            const RowIcon = ICONS[k % ICONS.length];
            return (
              <motion.button
                key={key}
                type="button"
                tabIndex={-1}
                onClick={() => d !== 0 && go(d)}
                className="absolute inset-x-0 top-1/2 flex items-center gap-4 px-6 sm:px-8 text-left"
                style={{ height: rowH, marginTop: -rowH / 2, transformOrigin: 'center center' }}
                initial={{ y: d * rowH, rotateX: d * -24, opacity: 0 }}
                animate={{ y: d * rowH, rotateX: d * -24, opacity: ad > 2 ? 0 : ad === 0 ? 1 : ad === 1 ? 0.5 : 0.22, scale: ad === 0 ? 1 : 0.86 }}
                transition={reduced ? { duration: 0.2 } : SPRING}
                aria-hidden={d !== 0}
              >
                <RowIcon size={rowH > 60 ? 30 : 22} strokeWidth={2} className={d === 0 ? 'text-[#F6C22E]' : 'text-[#A7B2B8]'} />
                <span className={`font-display font-extrabold leading-none ${rowH > 60 ? 'text-[44px]' : 'text-[30px]'} ${d === 0 ? 'text-[#F3F5F6]' : 'text-[#C2CCD1]'}`}>
                  {values[k].title}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* the quote, sliding up with the wheel */}
      <div className="lg:col-span-7 liquid-glass rounded-[32px] p-7 sm:p-10 lg:p-12 min-h-[300px] grid items-center overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={v}
            className="[grid-area:1/1]"
            initial={{ opacity: 0, y: reduced ? 0 : 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -50 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-2xl pill-yellow text-[#0B0D0E]">
                <Icon size={22} strokeWidth={2} />
              </span>
              <p className="label-mono">{String(active + 1).padStart(2, '0')} · {values[active].title}</p>
            </div>
            <p className="mt-6 font-display text-[22px] sm:text-[26px] lg:text-[28px] font-bold leading-[1.4] text-[#F3F5F6]">“{quote}”</p>
            {author && <p className="mt-5 text-[17px] font-bold text-[#F6C22E]">— {author}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
