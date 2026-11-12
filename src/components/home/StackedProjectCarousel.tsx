'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Etihad "Flights from Kolkata" stacked carousel, for CUBE projects.
 * Five overlapping cards; the centre card is elevated and larger. Auto-rotates,
 * pauses on hover/focus, arrows + keyboard, click a side card to centre it.
 */

type AnyProject = {
  slug?: string;
  id?: string;
  title: string;
  category?: string;
  heroImage?: string;
  description?: string;
  client?: string;
  location?: string;
  scopeOfWork?: string[];
  featured?: boolean;
  status?: string;
};

const SHORT_CATEGORY: Record<string, string> = {
  'Building & Construction': 'Buildings · TPQA',
  'Environment & Sustainability': 'Environment · Hydrology',
  'Smart Cities': 'Smart Cities · Digital',
  'Urban Planning & Transportation': 'Urban · Transport',
};

const VISIBLE = 5; // odd number, centre = 2

export default function StackedProjectCarousel({ projects }: { projects: AnyProject[] }) {
  const items = useMemo(() => {
    const live = projects.filter((p) => p.status !== 'archived');
    const featured = live.filter((p) => p.featured);
    const pool = featured.length >= VISIBLE ? featured : [...featured, ...live.filter((p) => !p.featured)];
    return pool.slice(0, 10);
  }, [projects]);

  const [center, setCenter] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const n = items.length;
  const next = useCallback(() => setCenter((c) => (n ? (c + 1) % n : 0)), [n]);
  const prev = useCallback(() => setCenter((c) => (n ? (c - 1 + n) % n : 0)), [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    timer.current = setInterval(next, 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, n, next]);

  if (n === 0) return null;

  const half = Math.floor(VISIBLE / 2);
  const visible = Array.from({ length: Math.min(VISIBLE, n) }, (_, i) => {
    const offset = i - half;
    const index = (center + offset + n) % n;
    return { offset, index, project: items[index] };
  });

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }}
    >
      {/* Stage */}
      <div className="relative flex items-end justify-center px-4 sm:px-6 overflow-hidden pt-10 pb-14 min-h-[460px] sm:min-h-[540px]">
        {visible.map(({ offset, index, project }) => {
          const isCenter = offset === 0;
          const abs = Math.abs(offset);
          const href = `/projects/${project.slug || project.id || ''}`;
          const label = SHORT_CATEGORY[project.category || ''] || project.category || 'Project';
          const sub = project.location || project.client || 'Tamil Nadu · IIT Madras';
          const z = 20 - abs;
          const key = `${project.slug || project.id || index}`;

          const card = (
            <motion.div
              key={key}
              initial={false}
              animate={{
                scale: isCenter ? 1 : abs === 1 ? 0.9 : 0.8,
                y: isCenter ? -22 : abs === 1 ? 6 : 22,
                opacity: abs === 2 ? 0.7 : 1,
                filter: abs === 2 ? 'blur(1.5px)' : 'blur(0px)',
              }}
              transition={{ type: 'spring', stiffness: 240, damping: 24, mass: 0.9 }}
              style={{ zIndex: z }}
              className={`relative shrink-0 rounded-[26px] overflow-hidden bg-[#DCE4E8] ring-1 ring-black/5 will-change-transform ${
                isCenter
                  ? 'w-[290px] sm:w-[380px] h-[400px] sm:h-[470px] depth-3'
                  : 'w-[220px] sm:w-[290px] h-[330px] sm:h-[400px] depth-2'
              } ${abs === 2 ? 'hidden md:block' : ''} ${offset !== -half ? '-ml-10 sm:-ml-14' : ''}`}
            >
              <Image
                src={project.heroImage || '/images/about/about_about.jpg'}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 70vw, 380px"
                className={`object-cover transition-transform duration-700 ${isCenter ? 'scale-100' : 'scale-105'}`}
              />
              <div className="liquid-glass-dark absolute top-4 left-4 rounded-full px-3.5 py-1.5 text-[12.5px] text-white font-bold">
                {label}
              </div>
              <div className="absolute inset-x-0 bottom-0 text-left bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-24 pb-5 px-5">
                <div className={`font-display text-white font-bold leading-snug line-clamp-2 ${isCenter ? 'text-xl sm:text-[26px]' : 'text-base sm:text-lg'}`}>
                  {project.title}
                </div>
                <div className="text-[13.5px] text-[#F0C468] mt-1.5 font-semibold truncate">{sub}</div>
                {isCenter && (
                  <div className="liquid-glass-dark mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[14px] font-bold text-white">
                    View project <ArrowRight size={14} />
                  </div>
                )}
              </div>
              {/* gold specular edge on the hero card */}
              {isCenter && <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E9B215]/80 to-transparent" />}
            </motion.div>
          );

          return isCenter ? (
            <Link key={key} href={href} className="press relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B215] rounded-[26px]" style={{ zIndex: z }}>
              {card}
            </Link>
          ) : (
            <button
              key={key}
              type="button"
              aria-label={`Show ${project.title}`}
              onClick={() => setCenter(index)}
              className="press relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B215] rounded-[26px]"
              style={{ zIndex: z }}
            >
              {card}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 sm:px-8 lg:px-16">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous project"
            className="press jiggle w-11 h-11 rounded-full grid place-items-center text-[#243239] bg-white/80 border border-[#33454E]/15 shadow-sm hover:bg-[#F0C468] hover:text-[#243239] hover:border-[#C4921B] transition"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next project"
            className="press jiggle w-11 h-11 rounded-full grid place-items-center text-[#243239] bg-white/80 border border-[#33454E]/15 shadow-sm hover:bg-[#F0C468] hover:text-[#243239] hover:border-[#C4921B] transition"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
          <div className="ml-3 flex items-center gap-1">
            {items.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === center ? 'w-6 bg-[#F0C468]' : 'w-1.5 bg-[#33454E]/25'}`} />
            ))}
          </div>
        </div>
        <Link href="/projects" className="text-[15px] font-bold text-[#243239] hover:text-[#9A7015] border-b-2 border-[#C4921B] pb-0.5 transition-colors">
          View all
        </Link>
      </div>
    </div>
  );
}
