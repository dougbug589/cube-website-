'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CMS_UPDATED_EVENT } from '@/lib/live';
import RotatingHeadline from '@/components/hero/RotatingHeadline';

/**
 * Home hero — deliberately quiet.
 * Inset rounded media stage (CUBE film on capable devices, photo slideshow
 * otherwise) with one headline, one line of copy and two actions. A slim
 * caption bar names the project on screen and auto-advances with a
 * compositor-only progress line.
 */

interface Slide {
  id: string;
  image: string;
  tag: string;
  location: string;
  href: string;
}

const FALLBACK_SLIDES: Slide[] = [
  { id: 'iitt', image: '/images/hero/slides_iit-tirupathi.jpg', tag: 'IIT Tirupati Permanent Campus', location: 'Andhra Pradesh', href: '/projects/iit-tirupathi' },
  { id: 'cpcl', image: '/images/hero/slides_cpcl-arc.jpg', tag: 'CPCL ARHC Precast Housing', location: 'Chennai', href: '/projects/cpcl-arhc' },
  { id: 'pmay', image: '/images/hero/slides_ashiana.jpg', tag: 'PMAY Housing for All', location: 'Tamil Nadu', href: '/projects' },
  { id: 'niche', image: '/images/hero/slides_niche.jpg', tag: 'NICHE Industrial Park', location: 'SIPCOT Irungattukottai', href: '/projects/upt2' },
];

const SLIDE_MS = 7000;

export default function EtihadHero() {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Live hero slides from the CMS (admin → Hero Slides), bundled fallback.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/public/hero-slides', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !Array.isArray(data) || data.length === 0) return;
        const mapped: Slide[] = data
          .filter((s: any) => s && s.imageUrl)
          .map((s: any) => ({
            id: String(s.id),
            image: s.imageUrl,
            tag: s.projectTag || '',
            location: s.location || '',
            href: s.projectLink || '/projects',
          }));
        if (mapped.length) setSlides(mapped);
      } catch {
        /* keep fallback */
      }
    };
    load();
    window.addEventListener(CMS_UPDATED_EVENT, load);
    return () => {
      active = false;
      window.removeEventListener(CMS_UPDATED_EVENT, load);
    };
  }, []);

  // CUBE film (public/videos/cube-hero.mp4, 36 MB): wide screens, motion allowed, no data saver.
  useEffect(() => {
    const conn = (navigator as any).connection;
    const saveData = Boolean(conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wide = window.matchMedia('(min-width: 768px)').matches;
    setUseVideo(!saveData && !reduce && wide);
  }, []);

  // Pause film + slideshow when the hero is off-screen or the tab is hidden.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let visible = true;
    const sync = () => {
      const on = visible && document.visibilityState === 'visible';
      setPaused(!on);
      const v = videoRef.current;
      if (v) {
        if (on) v.play().catch(() => {});
        else v.pause();
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    }, { threshold: 0.05 });
    io.observe(section);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [useVideo]);

  // Auto-advance captions / photos.
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [idx, paused, slides.length]);

  const slide = slides[idx % slides.length];

  return (
    <section ref={sectionRef} className="relative px-3 sm:px-4 lg:px-6 pt-3">
      <div className="relative isolate overflow-hidden rounded-[28px] lg:rounded-[36px] min-h-[620px] h-[calc(100svh-24px)] max-h-[900px] text-white shadow-[0_40px_100px_-50px_rgba(36,50,57,0.6)]">
        {/* ── Media ── */}
        <div className="absolute inset-0 -z-10 bg-[#243239]">
          <AnimatePresence initial={false}>
            {!videoPlaying && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1.12 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 1.4, ease: 'easeInOut' }, scale: { duration: 10, ease: 'linear' } }}
                className="absolute inset-0 will-change-transform"
              >
                <Image src={slide.image} alt="" fill priority sizes="100vw" className="object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
          {useVideo && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
              aria-hidden="true"
              poster={slides[0]?.image}
              onPlaying={() => setVideoPlaying(true)}
              onError={() => setUseVideo(false)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}
            >
              <source src="/videos/cube-hero.mp4" type="video/mp4" />
            </video>
          )}
          {/* legibility scrims */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B262C]/75 via-[#1B262C]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/70 via-transparent to-[#1B262C]/30" />
        </div>

        {/* ── Copy ── */}
        <div className="h-full flex flex-col justify-end px-6 sm:px-10 lg:px-16 pb-24 sm:pb-28 lg:pb-32 pt-28">
          <div className="max-w-5xl">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 text-[14px] font-bold tracking-wide text-[#F2F5F6]/90"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E9B215] shadow-[0_0_10px_#E9B215]" />
              Centre of Excellence · IIT Madras × Govt of Tamil Nadu
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <RotatingHeadline
                paused={paused}
                className="mt-4 font-display font-extrabold tracking-[-0.02em] leading-[1.06] text-[clamp(2.6rem,4.8vw,4.5rem)] text-white"
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-[18px] sm:text-[19px] font-semibold text-[#F2F5F6]/90 leading-relaxed max-w-xl"
            >
              Structural assurance, environmental testing and urban planning for India&apos;s public institutions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/projects"
                className="btn-gold gold-shimmer inline-flex items-center gap-2 h-[52px] px-7 rounded-full text-[16px] font-extrabold"
              >
                Explore projects <ArrowRight size={17} strokeWidth={2.25} />
              </Link>
              <Link
                href="/contact"
                className="press liquid-glass-dark inline-flex items-center gap-2 h-[52px] px-7 rounded-full text-white text-[16px] font-bold"
              >
                Talk to CUBE
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ── Caption: project currently on screen ── */}
        <div className="hidden sm:block absolute inset-x-10 lg:inset-x-16 bottom-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={slide.href} className="group inline-flex items-center gap-2 text-[15px] text-white/85 hover:text-white transition-colors">
                <span className="font-semibold">{slide.tag}</span>
                {slide.location && <span className="text-white/55">· {slide.location}</span>}
                <ArrowUpRight size={15} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
