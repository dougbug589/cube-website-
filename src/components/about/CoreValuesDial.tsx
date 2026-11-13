'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Award, HeartHandshake, Lightbulb, Mountain, ShieldCheck, Target } from 'lucide-react';

/**
 * Core values as a round "dial": the values sit as glass pills around a large
 * ring that turns on a spring, bringing the next value to the top (12
 * o'clock); the value at the top is lit yellow and its quote fades in on a
 * frosted disc in the middle of the ring. Pills counter-rotate with the ring
 * (same motion value) so their labels stay upright. Endless (the angle keeps
 * growing), auto-advances, click a pill to turn to it, arrow keys; pauses on
 * hover, focus, off screen and in background tabs; reduced motion = no
 * auto-turn and no spin. Phones put the quote under a smaller ring.
 * Only transform/opacity animate.
 */

type Value = { title: string; description: string };
const ICONS = [ShieldCheck, Award, HeartHandshake, Mountain, Lightbulb, Target];
const EASE = [0.22, 1, 0.36, 1] as const;

// "“quote” — Author" -> { quote, author }
const split = (d: string) => {
  const m = d.match(/^\s*[“"]?([\s\S]*?)[”"]?\s*[—–-]\s*([^—–-]+)$/);
  return m ? { quote: m[1].trim(), author: m[2].trim() } : { quote: d, author: '' };
};

export default function CoreValuesDial({ values, interval = 1800 }: { values: Value[]; interval?: number }) {
  const n = values.length;
  const step = 360 / Math.max(1, n);
  const [v, setV] = useState(0); // unbounded, so the dial keeps turning one way
  const angle = useMotionValue(0);
  const counter = useTransform(angle, (a) => -a);
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(620);
  const paused = useRef(false);
  const inView = useRef(false);
  const lastMove = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize(Math.min(640, Math.max(300, e.contentRect.width - 8))));
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // turn the ring so value v sits at 12 o'clock
  useEffect(() => {
    const target = -v * step;
    if (reduced) angle.set(target);
    else {
      const c = animate(angle, target, { type: 'spring', stiffness: 90, damping: 16, mass: 0.9 });
      return () => c.stop();
    }
  }, [v, step, reduced, angle]);

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
  const active = ((v % n) + n) % n;
  const phone = size < 520;
  const R = size / 2 - (phone ? 34 : 46); // radius the pills sit on
  const disc = Math.round(size * (phone ? 0.5 : 0.6));
  const { quote, author } = split(values[active].description);
  const ActiveIcon = ICONS[active % ICONS.length];

  const quoteBlock = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={values[active].title}
        initial={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduced ? 0 : -8 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="text-center"
      >
        {/* (the lit pill at 12 o'clock already shows the icon) */}
        <p className={`font-display font-extrabold text-[#F3F5F6] ${phone ? 'text-[24px]' : 'text-[28px]'}`}>{values[active].title}</p>
        <p className={`mt-2 text-[#DDE3E6] leading-relaxed ${phone ? 'text-[17px]' : 'text-[15.5px] xl:text-[16.5px]'}`}>“{quote}”</p>
        {author && <p className="mt-2 text-[14.5px] font-bold text-[#F6C22E]">— {author}</p>}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Core values"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        else if (e.key === 'ArrowLeft') go(-1);
      }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="flex flex-col items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[40px]"
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* the ring and the "you are here" notch at 12 o'clock */}
        <span aria-hidden className="absolute rounded-full border border-white/15" style={{ inset: size / 2 - R }} />
        <span aria-hidden className="absolute left-1/2 -translate-x-1/2 w-[3px] h-5 rounded-full bg-[#F6C22E]" style={{ top: size / 2 - R - (phone ? 30 : 38) }} />

        {/* centre disc: the active value (desktop / tablet) */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 liquid-glass rounded-full grid place-items-center"
          style={{ width: disc, height: disc, padding: phone ? 18 : disc * 0.12 }}
        >
          {phone ? (
            <span className="grid place-items-center w-14 h-14 rounded-2xl pill-yellow text-[#0B0D0E]">
              <ActiveIcon size={26} strokeWidth={2} />
            </span>
          ) : (
            quoteBlock
          )}
        </div>

        {/* the turning ring of values */}
        <motion.div className="absolute inset-0" style={{ rotate: angle }}>
          {values.map((val, k) => {
            const Icon = ICONS[k % ICONS.length];
            const a = (k * step * Math.PI) / 180;
            const x = Math.sin(a) * R;
            const y = -Math.cos(a) * R;
            const on = k === active;
            let d = (k - active) % n;
            if (d > n / 2) d -= n;
            if (d < -n / 2) d += n;
            return (
              <motion.button
                key={val.title}
                type="button"
                onClick={() => d !== 0 && go(d)}
                aria-label={`Show ${val.title}`}
                aria-current={on ? 'true' : undefined}
                className={`press absolute inline-flex items-center gap-2 rounded-full whitespace-nowrap font-bold transition-colors duration-300 ${
                  phone ? 'h-11 px-3.5 text-[14.5px]' : 'h-12 px-4 text-[16px]'
                } ${on ? 'pill-yellow text-[#0B0D0E]' : 'glass text-[#F3F5F6] hover:bg-white/[0.1]'}`}
                // plain rounded px (not calc with long decimals) so server and client HTML match
                style={{ x: '-50%', y: '-50%', left: Math.round(size / 2 + x), top: Math.round(size / 2 + y), rotate: counter }}
              >
                <Icon size={phone ? 16 : 18} strokeWidth={2.25} />
                {val.title}
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* phones: the quote sits under the dial */}
      {phone && <div className="liquid-glass rounded-[28px] p-6 mt-4 w-full max-w-md">{quoteBlock}</div>}
    </div>
  );
}
