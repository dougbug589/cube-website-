'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';

/**
 * Verticals as an auto-advancing showcase.
 *
 * Left: numbered selector. The active row carries a gold progress line
 * (CSS scaleX, compositor-only) that drives the auto-switch.
 * Right: one vertical at a time: image, positioning line, capabilities as
 * a checklist, and three key services. Crossfades on opacity/transform only.
 *
 * Pauses on hover, keyboard focus, off-screen, hidden tab, reduced motion.
 */

type Vertical = {
  id?: string;
  slug: string;
  title: string;
  shortTitle?: string;
  tagline?: string;
  description?: string;
  heroImage: string;
  projectCount?: number;
  capabilities?: string[];
  keyServices?: { title: string; description: string }[];
};

const STEP_MS = 6500;

export default function VerticalShowcase({ verticals }: { verticals: Vertical[] }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const n = verticals.length;
  const paused = hovered || !onScreen || reduced;

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting && document.visibilityState === 'visible'), {
      threshold: 0.25,
    });
    io.observe(el);
    const vis = () => setOnScreen(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', vis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % n), STEP_MS);
    return () => clearTimeout(t);
  }, [active, paused, n]);

  if (n === 0) return null;
  const v = verticals[active % n];

  return (
    <div
      ref={rootRef}
      className="grid lg:grid-cols-12 gap-6 lg:gap-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      {/* Selector */}
      <div role="tablist" aria-label="Verticals" aria-orientation="vertical" className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 lg:mx-0 lg:px-0">
        {verticals.map((item, i) => {
          const on = i === active % n;
          return (
            <button
              key={item.slug}
              type="button"
              role="tab"
              id={`vtab-${item.slug}`}
              aria-selected={on}
              aria-controls={`vpanel-${item.slug}`}
              onClick={() => setActive(i)}
              className={`press group relative shrink-0 lg:shrink text-left rounded-2xl px-5 py-4 lg:py-5 transition-[background-color,border-color,box-shadow] duration-300 border ${
                on
                  ? 'bg-white/85 border-[#C4921B]/35 shadow-[0_18px_40px_-24px_rgba(36,50,57,0.45)]'
                  : 'bg-white/40 border-[#33454E]/12 hover:bg-white/70'
              }`}
            >
              <div className="flex items-baseline gap-4">
                <span className={`font-display text-sm font-bold tabular-nums ${on ? 'text-[#C4921B]' : 'text-[#7A888E]'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className={`font-display text-[17px] lg:text-lg font-bold leading-snug whitespace-nowrap lg:whitespace-normal ${on ? 'text-[#243239]' : 'text-[#46565E]'}`}>
                    {item.shortTitle || item.title}
                  </p>
                  <p className="hidden lg:block mt-1 text-[14px] text-[#5B6A71] leading-snug line-clamp-1">{item.title}</p>
                </div>
              </div>
              {/* progress line */}
              <span className="absolute left-5 right-5 bottom-0 h-[2px] rounded-full bg-[#33454E]/10 overflow-hidden">
                {on && (
                  <span
                    key={`${item.slug}-${active}`}
                    className="progress-fill bg-[#F0C468]"
                    style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="lg:col-span-8 relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={v.slug}
            id={`vpanel-${v.slug}`}
            role="tabpanel"
            aria-labelledby={`vtab-${v.slug}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="glass glass-blur overflow-hidden grid md:grid-cols-5"
          >
            <div className="relative md:col-span-2 h-60 md:h-auto min-h-[260px]">
              <Image src={v.heroImage} alt="" fill sizes="(max-width: 768px) 100vw, 30vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/60 via-transparent to-transparent" />
              {typeof v.projectCount === 'number' && (
                <div className="absolute left-4 bottom-4 text-white">
                  <p className="font-display text-3xl font-bold leading-none">{v.projectCount}</p>
                  <p className="text-[13px] text-white/80 mt-1">projects delivered</p>
                </div>
              )}
            </div>

            <div className="md:col-span-3 p-6 lg:p-8 flex flex-col">
              <h3 className="font-display text-2xl lg:text-[28px] font-bold text-[#243239] leading-tight">{v.title}</h3>
              {v.tagline && <p className="mt-2 text-[16px] text-[#46565E] leading-relaxed">{v.tagline}</p>}

              {v.capabilities && v.capabilities.length > 0 && (
                <ul className="mt-5 grid sm:grid-cols-2 gap-x-5 gap-y-2.5">
                  {v.capabilities.slice(0, 4).map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-[14.5px] text-[#243239] leading-snug">
                      <span className="mt-0.5 grid place-items-center w-5 h-5 rounded-full bg-[#C4921B]/15 shrink-0">
                        <Check size={12} strokeWidth={3} className="text-[#9A7015]" />
                      </span>
                      <span className="line-clamp-2">{c}</span>
                    </li>
                  ))}
                </ul>
              )}

              {v.keyServices && v.keyServices.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#33454E]/15 grid sm:grid-cols-3 gap-4">
                  {v.keyServices.slice(0, 3).map((s) => (
                    <div key={s.title}>
                      <p className="text-[14.5px] font-bold text-[#243239] leading-snug">{s.title}</p>
                      <p className="mt-1 text-[13.5px] text-[#5B6A71] leading-relaxed line-clamp-3">{s.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-6">
                <Link
                  href={`/verticals/${v.slug}`}
                  className="group inline-flex items-center gap-2 text-[15px] font-bold text-[#243239] hover:text-[#9A7015] transition-colors"
                >
                  Explore {v.shortTitle || 'this vertical'}
                  <ArrowUpRight size={17} className="text-[#C4921B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
