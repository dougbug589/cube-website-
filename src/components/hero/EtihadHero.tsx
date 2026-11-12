'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Search, Building2, MapPin, Users, Layers, FileText, ChevronDown, Sparkles,
} from 'lucide-react';
import { CMS_UPDATED_EVENT } from '@/lib/live';

/**
 * Etihad-official hero: full-bleed photo with slow Ken-Burns crossfade, slate
 * scrim, light-weight headline, and the floating white "project search"
 * widget (pill tabs + gold Search button) that drives the Projects page filters.
 */

interface Slide {
  id: string;
  image: string;
  tag: string;
  location: string;
  href: string;
}

const FALLBACK_SLIDES: Slide[] = [
  { id: 'iitt', image: '/images/hero/slides_iit-tirupathi.jpg', tag: 'IIT Tirupati Permanent Campus · PMC', location: 'Andhra Pradesh', href: '/projects/iit-tirupathi' },
  { id: 'cpcl', image: '/images/hero/slides_cpcl-arc.jpg', tag: 'CPCL ARHC Precast Housing · TPQA', location: 'Chennai, Tamil Nadu', href: '/projects/cpcl-arhc' },
  { id: 'pmay', image: '/images/hero/slides_ashiana.jpg', tag: 'PMAY Housing · 40+ schemes', location: 'Tamil Nadu', href: '/projects' },
  { id: 'niche', image: '/images/hero/slides_niche.jpg', tag: 'NICHE Industrial Park · Master planning', location: 'SIPCOT Irungattukottai', href: '/projects/upt2' },
];

const SECTORS = [
  { label: 'All sectors', value: 'All' },
  { label: 'Building & Construction', value: 'Building & Construction' },
  { label: 'Environment & Sustainability', value: 'Environment & Sustainability' },
  { label: 'Smart Cities', value: 'Smart Cities' },
  { label: 'Urban Planning & Transportation', value: 'Urban Planning & Transportation' },
];

const SCOPES = ['Any scope', 'TPQA', 'PMC', 'Proof checking', 'Structural design', 'Flood modelling', 'Master planning'];

const VERTICALS = [
  { label: 'Building & Construction', slug: 'building-construction' },
  { label: 'Environment & Sustainability', slug: 'environment-sustainability' },
  { label: 'Smart Cities', slug: 'smart-cities' },
  { label: 'Urban Planning & Transportation', slug: 'urban-planning-transportation' },
];

type Tab = 'projects' | 'verticals' | 'tenders';

export default function EtihadHero() {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [idx, setIdx] = useState(0);
  const [tab, setTab] = useState<Tab>('projects');
  const [sector, setSector] = useState('All');
  const [location, setLocation] = useState('');
  const [scope, setScope] = useState('Any scope');
  const [vertical, setVertical] = useState(VERTICALS[0].slug);

  // Live hero slides from the CMS (admin → Hero Slides), fallback to bundled images.
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

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[idx % slides.length];

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (tab === 'tenders') {
      router.push('/tenders');
      return;
    }
    if (tab === 'verticals') {
      router.push(`/verticals#${vertical}`);
      return;
    }
    const params = new URLSearchParams();
    if (sector !== 'All') params.set('category', sector);
    const q = [location.trim(), scope !== 'Any scope' ? scope : ''].filter(Boolean).join(' ');
    if (q) params.set('q', q);
    const qs = params.toString();
    router.push(qs ? `/projects?${qs}` : '/projects');
  };

  const tabs: { key: Tab; label: string }[] = useMemo(
    () => [
      { key: 'projects', label: 'Project search' },
      { key: 'verticals', label: 'Verticals' },
      { key: 'tenders', label: 'Tenders' },
    ],
    []
  );

  return (
    <section className="relative min-h-[560px] lg:min-h-[600px] bg-[#2B3B44] text-white overflow-hidden select-none">
      {/* ── Photo stage with slow Ken Burns crossfade ── */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.4, ease: 'easeInOut' }, scale: { duration: 9, ease: 'linear' } }}
            className="absolute inset-0"
          >
            <Image src={slide.image} alt="" fill priority sizes="100vw" className="object-cover object-center" />
          </motion.div>
        </AnimatePresence>
        {/* Etihad scrim: slate top glow, transparent middle, solid slate bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F2B32]/55 via-[#2B3B44]/10 to-[#2B3B44]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F2B32]/60 via-[#1F2B32]/20 to-transparent" />
      </div>

      {/* ── Top-right quick controls (glass) ── */}
      <div className="absolute top-20 lg:top-5 right-5 lg:right-8 z-20 hidden sm:flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + '-tag'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center gap-2 bg-[#33454E]/70 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-[11px] font-light text-white/90 max-w-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E9B215] shadow-[0_0_8px_#E9B215] animate-pulse shrink-0" />
            <span className="truncate">{slide.tag}</span>
            {slide.location && <span className="text-white/40 shrink-0">· {slide.location}</span>}
          </motion.div>
        </AnimatePresence>
        <Link
          href="/about"
          className="flex items-center gap-1.5 bg-[#33454E]/70 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 text-[11px] font-light text-white/90 hover:bg-[#33454E] transition"
        >
          <span className="w-4 h-4 bg-[#C4921B] rounded-full grid place-items-center text-[8px] font-bold text-[#2B3B44]">IN</span>
          <span>IIT Madras · Govt of TN</span>
        </Link>
      </div>

      {/* ── Copy ── */}
      <div className="relative z-10 max-w-5xl px-5 sm:px-8 lg:px-16 pt-32 sm:pt-36 lg:pt-32">
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="headline-light text-[2.4rem] sm:text-5xl lg:text-[3.6rem] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
        >
          Where will engineering take you?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 text-sm sm:text-[15px] text-white/85 font-light max-w-xl leading-relaxed"
        >
          Structurally assuring India&apos;s institutions — from IIT campuses to national housing, across 9 states.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={slide.href}
            className="group inline-flex items-center gap-1.5 mt-5 text-sm text-white font-medium underline-offset-4 hover:underline"
          >
            Explore projects
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>

      {/* ── Floating search widget ── */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-4xl mx-5 sm:mx-8 lg:ml-16 lg:mr-8 mt-8 mb-12"
      >
        <div className="rounded-2xl bg-white/[0.97] backdrop-blur-2xl text-[#243239] shadow-[0_24px_70px_rgba(15,25,32,0.5),inset_0_1px_0_rgba(255,255,255,0.9)] border border-white/70 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 pt-3 px-3 sm:px-4 border-b border-[#EDEFF1] overflow-x-auto">
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`relative text-[13px] px-4 sm:px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                    active ? 'text-white' : 'text-[#5A6B74] hover:bg-[#F5F5F5]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="hero-tab"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-[#33454E] shadow-[0_6px_16px_rgba(51,69,78,0.35)]"
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
            <span className="ml-auto hidden md:flex items-center gap-1.5 text-[11px] text-[#8A98A0] pb-1 pr-2 whitespace-nowrap">
              <Sparkles size={12} className="text-[#C4921B]" /> Live CMS data
            </span>
          </div>

          {/* Fields */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-3 p-3 sm:p-4"
            >
              {tab === 'projects' && (
                <>
                  <Field icon={Building2} label="Sector">
                    <Select value={sector} onChange={setSector} options={SECTORS.map((s) => ({ label: s.label, value: s.value }))} />
                  </Field>
                  <Field icon={MapPin} label="Location">
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Chennai, Tirupati, Madurai…"
                      className="w-full bg-transparent text-[13px] text-[#243239] font-medium placeholder:text-[#B0B9BE] placeholder:font-normal outline-none"
                    />
                  </Field>
                  <Field icon={Users} label="Scope">
                    <Select value={scope} onChange={setScope} options={SCOPES.map((s) => ({ label: s, value: s }))} />
                  </Field>
                </>
              )}
              {tab === 'verticals' && (
                <>
                  <Field icon={Layers} label="Vertical" className="sm:col-span-2 lg:col-span-2">
                    <Select value={vertical} onChange={setVertical} options={VERTICALS.map((v) => ({ label: v.label, value: v.slug }))} />
                  </Field>
                  <div className="hidden lg:flex items-center text-[12px] text-[#5A6B74] font-light px-2">
                    Four disciplines, one faculty bench — explore services, labs and projects per vertical.
                  </div>
                </>
              )}
              {tab === 'tenders' && (
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 border border-[#E4E7EA] rounded-xl px-4 py-2.5">
                  <FileText size={18} strokeWidth={1.5} className="text-[#33454E] shrink-0" />
                  <div className="leading-tight">
                    <div className="text-[11px] text-[#8A98A0]">Procurement</div>
                    <div className="text-[13px] text-[#243239] font-medium">Open tenders, EOIs and empanelment notices</div>
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="gold-shimmer bg-[#C4921B] hover:bg-[#B07F14] text-white font-medium text-sm px-8 py-3 lg:py-0 rounded-xl transition-colors self-stretch inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(196,146,27,0.35)]"
              >
                <Search size={15} strokeWidth={2} />
                {tab === 'tenders' ? 'View tenders' : tab === 'verticals' ? 'Explore' : 'Search'}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.form>

      {/* slide dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 right-5 lg:right-8 z-10 flex items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === idx % slides.length ? 'w-7 bg-[#E9B215]' : 'w-1.5 bg-white/40 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  className = '',
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`border border-[#E4E7EA] rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors hover:border-[#C4921B] focus-within:border-[#C4921B] focus-within:shadow-[0_0_0_3px_rgba(196,146,27,0.12)] ${className}`}>
      <Icon size={18} strokeWidth={1.5} className="text-[#33454E] shrink-0" />
      <div className="leading-tight min-w-0 flex-1">
        <div className="text-[11px] text-[#8A98A0]">{label}</div>
        {children}
      </div>
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent text-[13px] text-[#243239] font-medium outline-none pr-5 truncate cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#8A98A0] pointer-events-none" />
    </div>
  );
}
