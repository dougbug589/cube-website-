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
  const window = Array.from({ length: Math.min(VISIBLE, n) }, (_, i) => {
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
      <div className="relative flex items-end justify-center px-4 sm:px-6 overflow-hidden pt-6 pb-8 min-h-[380px]">
        {window.map(({ offset, index, project }) => {
          const isCenter = offset === 0;
          const abs = Math.abs(offset);
          const href = `/projects/${project.slug || project.id || ''}`;
          const label = SHORT_CATEGORY[project.category || ''] || project.category || 'Project';
          const sub = project.location || project.client || 'Tamil Nadu · IIT Madras';
          const z = 20 - abs;
          const key = `${project.slug || project.id || index}`;

          const card = (
            <motion.div
              layout
              key={key}
              initial={false}
              animate={{
                scale: isCenter ? 1 : abs === 1 ? 0.92 : 0.84,
                y: isCenter ? -18 : abs === 1 ? 4 : 16,
                opacity: abs === 2 ? 0.75 : 1,
                x: offset * (isCenter ? 0 : 0),
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              style={{ zIndex: z }}
              className={`relative shrink-0 rounded-xl overflow-hidden bg-[#33454E] ring-1 ring-white/10 ${
                isCenter
                  ? 'w-[260px] sm:w-[300px] h-[340px] sm:h-[360px] shadow-[0_30px_80px_rgba(10,18,24,0.65)]'
                  : 'w-[190px] sm:w-[230px] h-[280px] sm:h-[300px] shadow-[0_20px_50px_rgba(10,18,24,0.45)]'
              } ${abs === 2 ? 'hidden md:block' : ''} ${offset !== -half ? '-ml-8 sm:-ml-10' : ''}`}
            >
              <Image
                src={project.heroImage || '/images/about/about_about.jpg'}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 60vw, 320px"
                className={`object-cover transition-transform duration-700 ${isCenter ? 'scale-100' : 'scale-105'}`}
              />
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-md px-2.5 py-1 text-[10px] text-[#33454E] font-medium shadow">
                {label}
              </div>
              <div className="absolute inset-x-0 bottom-0 text-left bg-gradient-to-t from-black/85 via-black/35 to-transparent pt-20 pb-4 px-4">
                <div className={`text-white font-light leading-snug line-clamp-2 ${isCenter ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
                  {project.title}
                </div>
                <div className="text-[11px] text-[#E9B215] mt-1 font-light truncate">{sub}</div>
                {isCenter && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-white/90 border-b border-[#C4921B] pb-0.5">
                    View project <ArrowRight size={12} />
                  </div>
                )}
              </div>
              {/* gold specular edge on the hero card */}
              {isCenter && <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E9B215]/80 to-transparent" />}
            </motion.div>
          );

          return isCenter ? (
            <Link key={key} href={href} className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B215] rounded-xl" style={{ zIndex: z }}>
              {card}
            </Link>
          ) : (
            <button
              key={key}
              type="button"
              aria-label={`Show ${project.title}`}
              onClick={() => setCenter(index)}
              className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B215] rounded-xl hover:-translate-y-1.5 transition-transform duration-300"
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
            className="w-10 h-10 rounded-full grid place-items-center text-white/80 bg-white/[0.06] border border-white/10 hover:bg-[#C4921B] hover:text-[#2B3B44] hover:border-[#C4921B] transition"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next project"
            className="w-10 h-10 rounded-full grid place-items-center text-white/80 bg-white/[0.06] border border-white/10 hover:bg-[#C4921B] hover:text-[#2B3B44] hover:border-[#C4921B] transition"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
          <div className="ml-3 flex items-center gap-1">
            {items.map((_, i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === center ? 'w-5 bg-[#E9B215]' : 'w-1 bg-white/25'}`} />
            ))}
          </div>
        </div>
        <Link href="/projects" className="text-sm text-white/90 hover:text-[#E9B215] border-b border-[#C4921B] pb-0.5 font-light transition">
          View all
        </Link>
      </div>
    </div>
  );
}
