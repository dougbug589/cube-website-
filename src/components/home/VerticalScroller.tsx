'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

/**
 * Verticals, driven by scrolling (wide screens): the section pins in place and
 * scrolling steps through the four verticals. A big photo cross-fades to each
 * vertical, a glass card carries its title, line and services, and a gold rail
 * on the left shows progress. Clicking a vertical scrolls to it.
 * Phones and tablets get four stacked photo cards instead (no pinning).
 * Scroll work is rAF-throttled; the rail is updated by direct style writes and
 * React only re-renders when the active vertical changes.
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

// Larger photos (1920px) of each vertical's own projects for the big frame.
const BIG: Record<string, string> = {
  'building-construction': '/images/hero/slides_design-engineering-consultancy.jpg',
  'environment-sustainability': '/images/hero/slides_ashiana.jpg',
  'smart-cities': '/images/projects/smart-cities/images_smartcity.jpg',
  'urban-planning-transportation': '/images/hero/slides_niche.jpg',
};
const STEP_VH = 85; // scroll distance per vertical

export default function VerticalScroller({ verticals }: { verticals: Vertical[] }) {
  const n = verticals.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || n === 0) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!mq.matches) return;
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-offset')) || 93;
      const r = track.getBoundingClientRect();
      const stickyH = window.innerHeight - nav;
      const total = Math.max(1, r.height - stickyH);
      const p = Math.min(1, Math.max(0, (nav - r.top) / total));
      if (railRef.current) railRef.current.style.transform = `scaleY(${Math.max(0.02, p)})`;
      const idx = Math.min(n - 1, Math.floor(p * n));
      setActive((a) => (a === idx ? a : idx));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [n]);

  const jump = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-offset')) || 93;
    const stickyH = window.innerHeight - nav;
    const total = track.offsetHeight - stickyH;
    const top = track.getBoundingClientRect().top + window.scrollY - nav;
    window.scrollTo({ top: top + ((i + 0.5) / n) * total, behavior: 'smooth' });
  };

  if (n === 0) return null;
  const v = verticals[active];

  return (
    <>
      {/* wide screens: pinned, scroll-driven; the active vertical's photo
          fills the whole section behind the list and the info card */}
      <div ref={trackRef} className="hidden lg:block relative" style={{ height: `${n * STEP_VH}vh` }}>
        <div className="sticky top-[var(--nav-offset,93px)] h-[calc(100vh-var(--nav-offset,93px))] flex items-center">
          {/* full-bleed photo layer (breaks out of the page shell) */}
          <div aria-hidden className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden">
            {verticals.map((x, i) => (
              <div
                key={x.slug}
                className="absolute inset-0 transition-[opacity,transform] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ opacity: i === active ? 1 : 0, transform: i === active ? 'scale(1)' : 'scale(1.06)' }}
              >
                <Image src={BIG[x.slug] || x.heroImage} alt="" fill sizes="100vw" quality={75} className="object-cover" loading="eager" />
              </div>
            ))}
            {/* blend into the page above and below, light wash for the glass */}
            <div className="absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-[#EEF2F4] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-t from-[#EEF2F4] to-transparent" />
            {/* left margin, where the section guide sits on very wide screens */}
            <div className="absolute inset-y-0 left-0 w-[230px] bg-gradient-to-r from-[#EEF2F4] via-[#EEF2F4]/85 to-transparent hidden min-[1900px]:block" />
            <div className="absolute inset-0 bg-[#F6F8F9]/15" />
          </div>

          <div className="relative w-full grid grid-cols-12 gap-8 xl:gap-10 items-center">
            {/* list + progress rail, on glass */}
            <div className="col-span-4 liquid-glass is-solid rounded-[30px] p-7 xl:p-8">
              <div className="relative pl-7">
                <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-[#33454E]/10 overflow-hidden">
                  <span ref={railRef} className="block w-full h-full origin-top bg-gradient-to-b from-[#E9B215] to-[#C4921B]" style={{ transform: 'scaleY(0.02)' }} />
                </span>
                <ol className="space-y-1.5">
                  {verticals.map((x, i) => {
                    const on = i === active;
                    return (
                      <li key={x.slug}>
                        <button
                          type="button"
                          onClick={() => jump(i)}
                          aria-current={on ? 'true' : undefined}
                          className="group w-full text-left py-2.5 flex items-baseline gap-4"
                        >
                          <span className={`font-display text-[17px] font-extrabold tabular-nums transition-colors duration-500 ${on ? 'text-[#C4921B]' : 'text-[#33454E]/35'}`}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span
                            className={`font-display font-extrabold leading-tight transition-colors duration-500 ${
                              on ? 'text-[26px] xl:text-[30px] text-[#243239]' : 'text-[21px] xl:text-[23px] text-[#33454E]/50 group-hover:text-[#33454E]/80'
                            }`}
                          >
                            {x.title}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            {/* the active vertical's card */}
            <div className="col-span-7 col-start-6 xl:col-span-6 xl:col-start-7 liquid-glass is-solid rounded-[30px] p-8 xl:p-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={v.slug}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <h3 className="font-display text-[32px] xl:text-[38px] font-extrabold text-[#243239] leading-tight">{v.title}</h3>
                    {typeof v.projectCount === 'number' && v.projectCount > 0 && (
                      <span className="text-right shrink-0">
                        <span className="block font-display text-[38px] font-extrabold leading-none text-[#C4921B] tabular-nums">{v.projectCount}</span>
                        <span className="block mt-1 text-[15px] font-semibold text-[#3B4B53]">projects</span>
                      </span>
                    )}
                  </div>
                  {v.tagline && <p className="mt-3 text-[19.5px] text-[#2B3A41] leading-relaxed">{v.tagline}</p>}
                  {v.capabilities && v.capabilities.length > 0 && (
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {v.capabilities.slice(0, 5).map((c) => (
                        <li key={c} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-[#33454E]/10 px-3.5 py-1.5 text-[15px] font-semibold text-[#243239]">
                          <CheckCircle2 size={15} className="text-[#C4921B]" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link href={`/verticals/${v.slug}`} className="press btn-liquid-gold mt-7 inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold">
                    Explore {v.shortTitle || v.title} <ArrowUpRight size={16} strokeWidth={2.25} />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* phones and tablets: stacked cards */}
      <div className="lg:hidden grid sm:grid-cols-2 gap-4 reveal-stagger">
        {verticals.map((x) => (
          <Link key={x.slug} href={`/verticals/${x.slug}`} className="press group relative h-80 rounded-[28px] overflow-hidden depth-2 bg-[#DCE4E8]">
            <Image src={BIG[x.slug] || x.heroImage} alt={x.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/85 via-[#1B262C]/20 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="block font-display text-[26px] font-extrabold leading-tight">{x.title}</span>
              {x.tagline && <span className="mt-1.5 block text-[16.5px] text-white/90 leading-snug line-clamp-2">{x.tagline}</span>}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
