'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Stacked project carousel (Etihad "Flights from …" pattern) for CUBE.
 *
 * Every card has the same box and is placed purely with transforms
 * (x, scale, y, opacity), so a switch is a real slide on the compositor,
 * driven by an under-damped spring for a soft bounce. Cards enter from one
 * edge and leave by the other in the direction of travel.
 *
 * No arrows or dots: it auto-scrolls, a side card can be clicked, and the
 * stage can be swiped / dragged with a rubber-band feel. Keyboard ← → work
 * when a card has focus.
 *
 * Pauses while a card is hovered or focused, while dragging, off-screen,
 * in a hidden tab, and for reduced motion.
 */

type AnyProject = {
  slug?: string;
  id?: string;
  title: string;
  category?: string;
  heroImage?: string;
  client?: string;
  location?: string;
  featured?: boolean;
  status?: string;
};

const SHORT_CATEGORY: Record<string, string> = {
  'Building & Construction': 'Buildings · TPQA',
  'Environment & Sustainability': 'Environment · Hydrology',
  'Smart Cities': 'Smart Cities · Digital',
  'Urban Planning & Transportation': 'Urban · Transport',
};

const AUTO_MS = 2800;
const BOUNCE = { type: 'spring' as const, stiffness: 260, damping: 19, mass: 0.8 };

/** transform pose for a card `offset` slots away from the centre */
function pose(offset: number, spacing: number) {
  const abs = Math.abs(offset);
  return {
    x: offset * spacing,
    scale: abs === 0 ? 1 : abs === 1 ? 0.8 : 0.64,
    y: abs === 0 ? -12 : abs === 1 ? 26 : 52,
    opacity: abs >= 3 ? 0 : abs === 2 ? 0.55 : 1,
  };
}

export default function StackedProjectCarousel({ projects }: { projects: AnyProject[] }) {
  const items = useMemo(() => {
    const live = projects.filter((p) => p.status !== 'archived');
    const featured = live.filter((p) => p.featured);
    const pool = featured.length >= 5 ? featured : [...featured, ...live.filter((p) => !p.featured)];
    return pool.slice(0, 10);
  }, [projects]);

  const n = items.length;
  const [center, setCenter] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [cardHover, setCardHover] = useState(false);
  const [cardFocus, setCardFocus] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [spacing, setSpacing] = useState(350);
  const rootRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (step: number) => {
      if (!n) return;
      setDir(step >= 0 ? 1 : -1);
      setCenter((c) => (((c + step) % n) + n) % n);
    },
    [n]
  );

  // visibility, reduced motion, responsive spacing
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const sm = window.matchMedia('(min-width: 640px)');
    const lg = window.matchMedia('(min-width: 1024px)');
    const applySpacing = () => setSpacing(lg.matches ? 350 : sm.matches ? 270 : 190);
    applySpacing();
    sm.addEventListener('change', applySpacing);
    lg.addEventListener('change', applySpacing);

    const el = rootRef.current;
    let visible = false;
    const sync = () => setOnScreen(visible && document.visibilityState === 'visible');
    const io = el
      ? new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
          sync();
        }, { threshold: 0.3 })
      : null;
    if (el && io) io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      sm.removeEventListener('change', applySpacing);
      lg.removeEventListener('change', applySpacing);
      io?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // auto-scroll; keyed on `center` so a manual step restarts the clock
  const paused = cardHover || cardFocus || dragging || !onScreen || reduced;
  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => go(1), AUTO_MS);
    return () => clearTimeout(t);
  }, [center, paused, n, go]);

  if (n === 0) return null;

  const offsets = n >= 5 ? [-2, -1, 0, 1, 2] : n >= 3 ? [-1, 0, 1] : [0];
  const onDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -60) go(1);
    else if (swipe > 60) go(-1);
  };

  return (
    <div ref={rootRef} className="relative">
      <motion.div
        className="relative h-[480px] sm:h-[580px] overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        dragTransition={{ bounceStiffness: 420, bounceDamping: 22 }}
        onDragStart={() => setDragging(true)}
        onDragEnd={onDragEnd}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          {offsets.map((offset) => {
            const index = (((center + offset) % n) + n) % n;
            const project = items[index];
            const key = `${project.slug || project.id || index}`;
            const isCenter = offset === 0;
            const target = pose(offset, spacing);
            const href = `/projects/${project.slug || project.id || ''}`;
            const label = SHORT_CATEGORY[project.category || ''] || project.category || 'Project';
            const sub = [project.client, project.location].filter(Boolean).join(' · ');

            return (
              <motion.div
                key={key}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ ...pose(3 * d, spacing), opacity: 0 }),
                  show: { x: target.x, scale: target.scale, y: target.y, opacity: target.opacity },
                  leave: (d: number) => ({ ...pose(-3 * d, spacing), opacity: 0 }),
                }}
                initial="enter"
                animate="show"
                exit="leave"
                transition={reduced ? { duration: 0 } : BOUNCE}
                style={{ zIndex: 10 - Math.abs(offset) }}
                className={`absolute left-1/2 top-8 sm:top-10 -ml-[165px] sm:-ml-[220px] w-[330px] sm:w-[440px] h-[420px] sm:h-[500px] will-change-transform ${
                  Math.abs(offset) === 2 ? 'hidden md:block' : ''
                }`}
              >
                {isCenter ? (
                  <Link
                    href={href}
                    draggable={false}
                    onClick={(e) => dragging && e.preventDefault()}
                    onMouseEnter={() => setCardHover(true)}
                    onMouseLeave={() => setCardHover(false)}
                    onFocus={() => setCardFocus(true)}
                    onBlur={() => setCardFocus(false)}
                    className="press block h-full rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B215]"
                  >
                    <Card project={project} label={label} sub={sub} isCenter />
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-label={`Show ${project.title}`}
                    onClick={() => !dragging && go(offset)}
                    onMouseEnter={() => setCardHover(true)}
                    onMouseLeave={() => setCardHover(false)}
                    onFocus={() => setCardFocus(true)}
                    onBlur={() => setCardFocus(false)}
                    className="press block w-full h-full text-left rounded-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9B215]"
                  >
                    <Card project={project} label={label} sub={sub} isCenter={false} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <div className="flex justify-end px-5 sm:px-8 lg:px-16 -mt-2">
        <Link href="/projects" className="text-[16.5px] font-bold text-[#243239] hover:text-[#9A7015] border-b-2 border-[#C4921B] pb-0.5 transition-colors">
          View all projects
        </Link>
      </div>
    </div>
  );
}

function Card({ project, label, sub, isCenter }: { project: AnyProject; label: string; sub: string; isCenter: boolean }) {
  return (
    <div className={`relative h-full rounded-[28px] overflow-hidden bg-[#DCE4E8] ring-1 ring-black/5 ${isCenter ? 'depth-3' : 'depth-2'}`}>
      <Image
        src={project.heroImage || '/images/about/about_about.jpg'}
        alt={project.title}
        fill
        draggable={false}
        sizes="(max-width: 640px) 330px, 440px"
        className="object-cover select-none pointer-events-none"
      />
      <div className="chip-photo absolute top-4 left-4 rounded-full px-3.5 py-1.5 text-[14.5px] text-white font-bold">{label}</div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-24 pb-5 px-5">
        <div className="font-display text-white font-bold leading-snug line-clamp-2 text-xl sm:text-[26px]">{project.title}</div>
        <div className="text-[15.5px] text-[#F0C468] mt-1.5 font-semibold truncate">{sub}</div>
        <div
          className={`chip-photo mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[16px] font-bold text-white transition-opacity duration-300 ${
            isCenter ? 'opacity-100' : 'opacity-0'
          }`}
        >
          View project <ArrowRight size={14} />
        </div>
      </div>
      {isCenter && <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E9B215]/80 to-transparent" />}
    </div>
  );
}
