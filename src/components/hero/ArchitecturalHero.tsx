'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ShieldCheck, Sparkles, Building2, 
  Layers, ChevronRight, Play, Compass, Award, ExternalLink
} from 'lucide-react';
import { GlassPanel, GlassButton } from '@/components/common/AppleLiquidGlass';

interface HeroSlide {
  id: number;
  image: string;
  category: string;
  title: string;
  italicWord: string;
  subtitle: string;
  description: string;
  projectHref: string;
  projectName: string;
  location: string;
  statNumber: string;
  statLabel: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: '/images/hero/slides_iit-tirupathi.jpg',
    category: 'Institutional Campus PMC',
    title: 'Engineering Ideas.',
    italicWord: 'Shaping',
    subtitle: 'Tomorrow.',
    description: 'Translating advanced structural modeling, soil mechanics, and sustainable hydrology from IIT Madras into high-performance public infrastructure.',
    projectHref: '/projects/iit-tirupathi',
    projectName: 'IIT Tirupati Permanent Campus',
    location: 'Andhra Pradesh & IIT Madras',
    statNumber: '40+',
    statLabel: 'Landmark State Schemes Assured',
  },
  {
    id: 2,
    image: '/images/hero/slides_cpcl-arc.jpg',
    category: 'Third Party Quality Assurance',
    title: 'Precision Quality.',
    italicWord: 'Resilient',
    subtitle: 'Housing.',
    description: 'Independent Third Party Quality Assurance (TPQA), precast structural design verification, and concrete durability testing ensuring multi-generational safety.',
    projectHref: '/projects/cpcl-arhc',
    projectName: 'CPCL Industrial & ARHC Precast Housing',
    location: 'Tamil Nadu & Chennai',
    statNumber: '100%',
    statLabel: 'Rigorous Technical Proof Checking',
  },
  {
    id: 3,
    image: '/images/hero/slides_ashiana.jpg',
    category: 'Housing Proof Checking',
    title: 'Structural Assurance.',
    italicWord: 'Community',
    subtitle: 'Impact.',
    description: 'Providing comprehensive structural design, foundation analysis, and third-party engineering consultancy for affordable housing schemes across Tamil Nadu.',
    projectHref: '/projects',
    projectName: 'Pradhan Mantri Awas Yojana (PMAY TN)',
    location: 'Statewide Tamil Nadu',
    statNumber: '10,000+',
    statLabel: 'Residential Units Assured',
  },
  {
    id: 4,
    image: '/images/hero/slides_design-engineering-consultancy.jpg',
    category: 'Applied Research Translation',
    title: 'Academic Intellect.',
    italicWord: 'Public',
    subtitle: 'Governance.',
    description: 'Bridging world-renowned civil engineering faculty with municipal field execution across smart cities, water resources, and transport networks.',
    projectHref: '/about',
    projectName: 'Government of Tamil Nadu & IIT Madras',
    location: 'IIT Madras Research Park',
    statNumber: '80+',
    statLabel: 'Distinguished Researchers & Engineers',
  },
];

export default function ArchitecturalHero() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const slide = HERO_SLIDES[currentIdx];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-[96vh] bg-[#FFFFFF] pt-28 sm:pt-32 pb-16 flex flex-col justify-between overflow-hidden select-none">
      
      {/* Background Architectural Canvas with Looping Background Video & Apple Cinematic Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Looping Ambient Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center filter contrast-[1.08] brightness-[0.96]"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>

        {/* Apple VisionOS-style Frosted Glass Vignette: Darkens & tints smoothly so light blue & pure white fonts glow with 4K clarity */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/40 backdrop-blur-[2px]" />
        
        {/* Soft top blend */}
        <div className="absolute top-0 left-0 right-0 h-32 z-20 bg-gradient-to-b from-slate-950/85 via-slate-900/40 to-transparent" />
        
        {/* Deep bottom fade out into page white */}
        <div className="absolute bottom-0 left-0 right-0 h-48 z-20 bg-gradient-to-t from-white via-white/80 to-transparent" />

        {/* Ambient Cyan/Ice-Blue Refractive Glow for Apple Cinematic Look */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] z-10 bg-[#38bdf8]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] z-10 bg-[#60a5fa]/15 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Top Institutional Metadata Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs tracking-wider uppercase font-semibold text-white/80 border-b border-white/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_12px_#38bdf8] animate-pulse" />
            <span className="text-white font-bold tracking-wider">Centre of Excellence</span>
            <span>&bull;</span>
            <span className="text-white/80">Govt of Tamil Nadu &amp; IIT Madras</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 text-[11px] font-semibold tracking-wider transition-all shadow-sm backdrop-blur-md flex items-center gap-1.5 active:scale-95"
            >
              <span>View All 40+ Schemes</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#38bdf8]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Hero Spatial Stage: Clean Full-Width Editorial Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 z-10 flex flex-col justify-center py-6 sm:py-10">
        <div className="max-w-3xl space-y-6">
          
          {/* Category Pill & State Scheme Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <motion.div
              key={`cat-${slide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/40 text-white text-xs font-semibold shadow-sm backdrop-blur-xl"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{slide.category}</span>
            </motion.div>

            <span className="text-[11px] font-medium text-white/90 px-3 py-1 rounded-full bg-white/10 border border-white/25 backdrop-blur-md">
              {slide.location}
            </span>
          </div>

          {/* Split-Text Animated Editorial Headline (Cormorant Garamond) */}
          <motion.div
            key={`headline-${slide.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.5rem] font-light tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] leading-[1.08]">
              {slide.title}{' '}
              <span className="italic font-normal text-[#7dd3fc] drop-shadow-[0_0_24px_rgba(56,189,248,0.4)] border-b-2 border-[#38bdf8] pb-0.5">
                {slide.italicWord}
              </span>{' '}
              {slide.subtitle}
            </h1>
          </motion.div>

          {/* Sub-line Editorial Copy */}
          <p className="text-sm sm:text-base text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] max-w-2xl leading-relaxed font-sans font-normal">
            {slide.description}
          </p>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/projects"
              className="px-7 py-3 rounded-full bg-white text-[#070E5C] font-semibold text-xs tracking-wider transition-all shadow-[0_4px_20px_rgba(255,255,255,0.35)] hover:bg-[#e0f2fe] hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Explore Our Projects</span>
              <ArrowUpRight className="w-4 h-4 text-[#0284c7]" />
            </Link>

            <Link
              href={slide.projectHref}
              className="px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/35 font-semibold text-xs tracking-wider transition-all shadow-sm backdrop-blur-xl active:scale-95 flex items-center gap-1.5"
            >
              <span>{slide.projectName}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#7dd3fc]" />
            </Link>
          </div>

          {/* Slide Navigation Controls & Indicators */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center space-x-2">
              {HERO_SLIDES.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIdx(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-500 rounded-full cursor-pointer ${
                    currentIdx === idx 
                      ? 'w-8 h-2 bg-[#38bdf8] shadow-[0_0_12px_#38bdf8]' 
                      : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">
              0{currentIdx + 1} / 0{HERO_SLIDES.length}
            </span>
          </div>

        </div>
      </div>

    </section>
  );
}
