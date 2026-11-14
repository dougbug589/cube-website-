'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, type MotionValue } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

/**
 * News as a "newsroom" slideshow: a stage with the story photo (cross-fades
 * with a short slide, no zoom) beside a glass panel with date, category,
 * title, summary and the link to the story; under it a rail of every story
 * as a small thumbnail, each with a yellow bar that fills while its story is
 * on stage. Auto-advances (timer pauses, not restarts, on hover, focus, off
 * screen and in background tabs); click a thumbnail, the arrows, arrow keys
 * or swipe the photo. Reduced motion = no auto-advance, plain fades.
 * Transform/opacity only.
 */

export type Story = {
  id?: string;
  slug?: string;
  title: string;
  date?: string;
  category?: string;
  summary?: string;
  excerpt?: string;
  image?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;
const FALLBACK = '/images/about/about_about.jpg';
const href = (s: Story) => `/media/news/${s.slug || s.id}`;
const pad = (k: number) => String(k).padStart(2, '0');

export default function NewsSlideshow({ stories, interval = 5000 }: { stories: Story[]; interval?: number }) {
  const n = stories.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const progress = useMotionValue(0);
  const elapsed = useRef(0);
  const paused = useRef(false);
  const inView = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLOListElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = useCallback(
    (to: number, d?: number) => {
      elapsed.current = 0;
      progress.set(0);
      setI((cur) => {
        const next = ((to % n) + n) % n;
        setDir(d ?? (next >= cur ? 1 : -1));
        return next;
      });
    },
    [n, progress]
  );

  // one rAF clock: the active bar fills with it and the slide changes when it is full
  useEffect(() => {
    if (reduced || n < 2) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(100, t - last);
      last = t;
      if (!paused.current && inView.current && document.visibilityState === 'visible') {
        elapsed.current += dt;
        progress.set(Math.min(1, elapsed.current / interval));
        if (elapsed.current >= interval) {
          elapsed.current = 0;
          progress.set(0);
          setDir(1);
          setI((x) => (x + 1) % n);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, n, interval, progress]);

  // keep the active thumbnail in view when the rail scrolls sideways (phones);
  // scrolls the rail only, never the page
  useEffect(() => {
    const rail = railRef.current;
    const item = rail?.children[i] as HTMLElement | undefined;
    if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({ left: item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [i, reduced]);

  if (n === 0) return null;
  const s = stories[i];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="News"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(i + 1, 1);
        else if (e.key === 'ArrowLeft') go(i - 1, -1);
      }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[34px]"
    >
      {/* the stage */}
      {/* the stage: its height never changes between stories (every story's
          text sits in the same grid cell, so the tallest one sets the height) */}
      <div className="glass glass-edge rounded-[32px] overflow-hidden grid lg:grid-cols-12">
        <motion.div
          className="relative lg:col-span-6 aspect-[16/10] lg:aspect-auto lg:min-h-[440px] overflow-hidden bg-[#1A1F22] cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'pan-y' }}
          drag={n > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 450) go(info.offset.x < 0 ? i + 1 : i - 1, info.offset.x < 0 ? 1 : -1);
          }}
        >
          {/* photos cross-fade with a short slide; no zoom (scaling a small
              photo softens it and makes it shimmer) */}
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={i}
              custom={dir}
              className="absolute inset-0"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: `${dir * 6}%` }}
              animate={{ opacity: 1, x: '0%' }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: `${-dir * 3}%` }}
              transition={{ duration: reduced ? 0.25 : 0.7, ease: EASE }}
            >
              <Image
                src={s.image || FALLBACK}
                alt={s.title}
                fill
                priority={i === 0}
                quality={90}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover pointer-events-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          {/* story number */}
          <p aria-hidden className="absolute left-5 sm:left-7 bottom-4 sm:bottom-5 font-display font-extrabold leading-none tabular-nums pointer-events-none">
            <span className="text-[44px] sm:text-[60px] text-[#F6C22E]">{pad(i + 1)}</span>
            <span className="ml-2 text-[18px] sm:text-[20px] text-white/80">/ {pad(n)}</span>
          </p>
        </motion.div>

        <div className="lg:col-span-6 p-7 sm:p-9 lg:p-10 flex flex-col">
          <div className="grid flex-1">
            {stories.map((st, k) => {
              const on = k === i;
              const t = st.summary || st.excerpt;
              return (
                <motion.div
                  key={st.id || st.slug || k}
                  aria-hidden={!on}
                  className="[grid-area:1/1]"
                  initial={false}
                  animate={
                    on
                      ? { opacity: 1, y: 0, visibility: 'visible' as const }
                      : { opacity: 0, y: reduced ? 0 : -12, transitionEnd: { visibility: 'hidden' as const, y: reduced ? 0 : 20 } }
                  }
                  transition={{ duration: on ? 0.45 : 0.25, delay: on ? 0.1 : 0, ease: EASE }}
                >
                  <p className="label-mono">{[k === 0 ? 'Latest' : null, st.category, st.date].filter(Boolean).join(' · ')}</p>
                  <h2 className="mt-3 font-display text-[26px] sm:text-[30px] font-extrabold text-[#F3F5F6] leading-tight">{st.title}</h2>
                  {t && <p className="mt-4 text-[18.5px] text-[#DDE3E6] leading-relaxed line-clamp-6">{t}</p>}
                </motion.div>
              );
            })}
          </div>
          <div className="pt-8 flex items-center justify-between gap-3">
            <Link href={href(s)} className="press btn-liquid-gold inline-flex items-center gap-2 h-12 px-5 sm:px-6 rounded-full text-[15.5px] sm:text-[16px] font-extrabold whitespace-nowrap">
              Read the story <ArrowUpRight size={16} strokeWidth={2.25} />
            </Link>
            {n > 1 && (
              <span className="flex gap-2 shrink-0">
                <button type="button" onClick={() => go(i - 1, -1)} aria-label="Previous story" className="press jiggle grid place-items-center w-11 h-11 sm:w-12 sm:h-12 rounded-full btn-soft">
                  <ArrowLeft size={18} strokeWidth={2.25} />
                </button>
                <button type="button" onClick={() => go(i + 1, 1)} aria-label="Next story" className="press jiggle grid place-items-center w-11 h-11 sm:w-12 sm:h-12 rounded-full btn-soft">
                  <ArrowRight size={18} strokeWidth={2.25} />
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* the rail: every story; the bar on top fills while it is on stage */}
      {n > 1 && (
        <ol
          ref={railRef}
          aria-label="All stories"
          className="mt-5 flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-2 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {stories.map((st, k) => {
            const on = k === i;
            return (
              <li key={st.id || st.slug || k} className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-auto">
                <button
                  type="button"
                  onClick={() => go(k)}
                  aria-label={`Show story ${k + 1}: ${st.title}`}
                  aria-current={on ? 'true' : undefined}
                  className={`press group relative w-full h-full text-left rounded-[20px] overflow-hidden flex items-center gap-3 p-2.5 pr-4 transition-[background-color,opacity,box-shadow] duration-300 ${
                    on ? 'liquid-glass ring-2 ring-[#F6C22E]' : 'glass opacity-75 hover:opacity-100'
                  }`}
                >
                  <Bar on={on} done={k < i} progress={progress} reduced={reduced} />
                  <span className="relative w-[84px] h-[64px] shrink-0 rounded-[14px] overflow-hidden bg-[#1A1F22]">
                    <Image src={st.image || FALLBACK} alt="" fill sizes="84px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    {st.date && <span className={`block text-[13px] font-bold tabular-nums ${on ? 'text-[#F6C22E]' : 'text-[#A7B2B8]'}`}>{st.date}</span>}
                    <span className="block mt-0.5 text-[15px] font-bold text-[#F3F5F6] leading-snug line-clamp-2">{st.title}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function Bar({ on, done, progress, reduced }: { on: boolean; done: boolean; progress: MotionValue<number>; reduced: boolean }) {
  return (
    <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-white/10">
      <motion.span
        className="absolute inset-0 origin-left bg-[#F6C22E]"
        style={{ scaleX: on ? (reduced ? 1 : progress) : done ? 1 : 0 }}
      />
    </span>
  );
}
