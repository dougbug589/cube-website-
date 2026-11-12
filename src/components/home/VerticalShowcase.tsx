'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

/**
 * Verticals — auto-advancing showcase, kept deliberately sparse.
 *
 * Left: four selector cards. A liquid-glass highlight springs between them
 * (shared layoutId, OxygenOS-style overshoot) and carries the gold progress
 * line that drives the auto-switch.
 * Right: one large card per vertical: full-bleed image, title, one line,
 * three capability chips, one link. The image swaps with a scale + blur
 * settle; the text lifts in. All transform / opacity / filter.
 *
 * Pauses on hover, keyboard focus, off-screen, hidden tab, reduced motion.
 */

type Vertical = {
  id?: string;
  slug: string;
  title: string;
  shortTitle?: string;
  tagline?: string;
  heroImage: string;
  projectCount?: number;
  capabilities?: string[];
};

const STEP_MS = 4500;
const SPRING = { type: 'spring' as const, stiffness: 380, damping: 30, mass: 0.8 };

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
    let visible = false;
    const sync = () => setOnScreen(visible && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    }, { threshold: 0.25 });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
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
      className="grid lg:grid-cols-12 gap-6 lg:gap-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      {/* Selector */}
      <div
        role="tablist"
        aria-label="Verticals"
        aria-orientation="vertical"
        className="lg:col-span-4 flex lg:flex-col gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 py-1 lg:mx-0 lg:px-0"
      >
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
              className="press relative shrink-0 lg:shrink text-left rounded-[24px] px-6 py-5 lg:py-6 min-w-[220px] lg:min-w-0"
            >
              {/* resting surface */}
              <span aria-hidden className="absolute inset-0 rounded-[24px] bg-white/50 border border-[#33454E]/[0.07]" />
              {/* sliding liquid-glass highlight */}
              {on && (
                <motion.span
                  layoutId="vertical-highlight"
                  transition={SPRING}
                  aria-hidden
                  className="liquid-glass is-solid depth-2 absolute inset-0 rounded-[24px]"
                />
              )}
              <span className="relative flex items-center gap-4">
                <span
                  className={`grid place-items-center w-11 h-11 rounded-2xl font-display text-[16.5px] font-extrabold tabular-nums transition-colors duration-300 ${
                    on ? 'bg-[#F0C468] text-[#243239]' : 'bg-[#33454E]/[0.06] text-[#7A888E]'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={`font-display text-[19px] lg:text-xl font-bold leading-snug whitespace-nowrap transition-colors duration-300 ${on ? 'text-[#243239]' : 'text-[#5B6A71]'}`}>
                  {item.shortTitle || item.title}
                </span>
              </span>
              {/* progress line */}
              <span aria-hidden className="absolute left-6 right-6 bottom-2.5 h-[3px] rounded-full bg-[#33454E]/[0.06] overflow-hidden">
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
      <div className="lg:col-span-8">
        <div className="relative overflow-hidden rounded-[32px] depth-3 min-h-[460px] lg:min-h-[520px] bg-[#243239]">
          {/* image: scale + blur settle */}
          <AnimatePresence initial={false}>
            <motion.div
              key={`img-${v.slug}`}
              initial={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 will-change-transform"
            >
              <Image src={v.heroImage} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/35 via-transparent to-transparent" />

          {/* content card floating on the image */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={v.slug}
              id={`vpanel-${v.slug}`}
              role="tabpanel"
              aria-labelledby={`vtab-${v.slug}`}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              transition={SPRING}
              className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 lg:right-auto lg:max-w-[560px] liquid-glass is-solid depth-2 rounded-[26px] p-6 lg:p-8 text-[#243239]"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-display text-[26px] lg:text-[30px] font-extrabold leading-tight">{v.title}</h3>
                  {v.tagline && <p className="mt-2 text-[16px] text-[#46565E] leading-relaxed">{v.tagline}</p>}
                </div>
                {typeof v.projectCount === 'number' && (
                  <div className="text-right shrink-0">
                    <p className="font-display text-[34px] font-extrabold leading-none text-[#C4921B]">{v.projectCount}</p>
                    <p className="text-[15px] text-[#5B6A71] mt-1">projects</p>
                  </div>
                )}
              </div>

              {v.capabilities && v.capabilities.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {v.capabilities.slice(0, 3).map((c) => (
                    <li key={c} className="rounded-full bg-[#33454E]/[0.06] border border-[#33454E]/10 px-3.5 py-1.5 text-[15.5px] font-semibold text-[#243239]">
                      {c.replace(/\s*\([^)]*\)/g, '')}
                    </li>
                  ))}
                </ul>
              )}

              <Link
                href={`/verticals/${v.slug}`}
                className="press btn-gold gold-shimmer mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold"
              >
                Explore {v.shortTitle || 'vertical'}
                <ArrowUpRight size={17} strokeWidth={2.25} />
              </Link>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
