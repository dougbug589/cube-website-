'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, ShieldCheck, ChevronLeft, ChevronRight, 
  Compass 
} from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  projectLink: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    image: '/images/hero/slides_iit-tirupathi.jpg',
    badge: 'Centre of Excellence • IIT Madras & Govt of Tamil Nadu',
    title: 'Transforming Urbanization Through Applied Engineering',
    subtitle: 'IIT Tirupati Permanent Campus Engineering Consultancy',
    description: 'Translating world-class academic research into resilient buildings, advanced water management, smart city systems, and sustainable transport networks.',
    projectLink: '/projects/iit-tirupathi'
  },
  {
    id: 2,
    image: '/images/hero/slides_cpcl-arc.jpg',
    badge: 'Industrial Infrastructure & Affordable Housing',
    title: 'Precision Structural Assurance for Marquee Infrastructure',
    subtitle: 'CPCL ARHC & Industrial Projects',
    description: 'Providing independent Third Party Quality Assurance (TPQA) and precast structural design verification across major state and national developments.',
    projectLink: '/projects/cpcl-arhc'
  },
  {
    id: 3,
    image: '/images/hero/slides_design-engineering-consultancy.jpg',
    badge: 'Housing For All • Design & Engineering',
    title: 'Advanced Engineering & Proof Checking for 40+ Schemes',
    subtitle: 'Pradhan Mantri Awas Yojana (PMAY) Across Tamil Nadu',
    description: 'Providing comprehensive structural design, foundation analysis, and third-party engineering consultancy for affordable housing schemes across Tamil Nadu.',
    projectLink: '/projects'
  },
  {
    id: 4,
    image: '/images/hero/slides_niche.jpg',
    badge: 'Sustainable Industrial & Urban Infrastructure',
    title: 'Designing With Nature: Sustainable Industrial Planning',
    subtitle: 'NICHE Industrial Park, SIPCOT Irungattukottai',
    description: 'Comprehensive master planning, ecological stormwater management, and internal circulation design for next-generation industrial parks.',
    projectLink: '/projects/upt2'
  },
  {
    id: 5,
    image: '/images/hero/slides_ashiana.jpg',
    badge: 'Senior Living & High-Rise Safety',
    title: 'Rigorous Structural Audit & Seismic Proof Checking',
    subtitle: 'Ashiana Shubham High-Rise Residential Development',
    description: 'End-to-end structural peer review, durability modeling, and seismic safety assurance safeguarding thousands of resident lives.',
    projectLink: '/projects'
  },
  {
    id: 6,
    image: '/images/hero/slides_mahindra.jpg',
    badge: 'Integrated Industrial City Advisory',
    title: 'Holistic Urban Mobility & Infrastructure Solutions',
    subtitle: 'Mahindra World City Integrated Master Plan Advisory',
    description: 'Applied transport engineering, pedestrian safety audits, and ecological drainage networks for integrated industrial townships.',
    projectLink: '/projects'
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatic 5-second image transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const active = HERO_SLIDES[currentSlide];

  return (
    <section 
      className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#070E5C] pt-20 select-none"
      aria-label="CUBE Infrastructure Projects Carousel"
    >
      {/* Background Slides with Automatic 5s Cross-fade */}
      {HERO_SLIDES.map((slide, idx) => {
        const isCurrent = idx === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={idx === 0}
              className={`object-cover object-center transition-transform duration-[5500ms] ease-out ${
                isCurrent ? 'scale-105' : 'scale-100'
              }`}
            />
            {/* CUBE Navy Brand Gradient Overlay (#070E5C) */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070E5C]/95 via-[#070E5C]/80 to-[#070E5C]/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070E5C] via-transparent to-[#070E5C]/60" />
          </div>
        );
      })}

      {/* Foreground Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="max-w-3xl">
          
          {/* Institutional Badge with Gold Border */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#070E5C]/90 border border-[#D7A00F]/50 backdrop-blur-md shadow-lg mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#D7A00F] animate-ping" />
            <ShieldCheck className="w-4 h-4 text-[#D7A00F]" />
            <span className="text-xs font-bold tracking-wide text-[#FDF6DE]">
              {active.badge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.12]">
            {active.title}
          </h1>

          {/* Subtitle with Gold Highlight */}
          <p className="mt-3 text-sm sm:text-base font-bold text-[#D7A00F] tracking-wide flex items-center">
            <Compass className="w-4 h-4 mr-2 text-[#D7A00F] flex-shrink-0" />
            <span>{active.subtitle}</span>
          </p>

          {/* Description */}
          <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
            {active.description}
          </p>

          {/* Action CTAs: Secondary Gold & White Outline */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={active.projectLink}
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-[#070E5C] bg-[#D7A00F] hover:bg-[#BF8C0B] transition-all shadow-cube-glow hover:shadow-xl flex items-center group"
            >
              <span>Explore 40+ Projects</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/about"
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-[#C4CAD8]/40 backdrop-blur-md transition-all flex items-center"
            >
              <span>About CUBE Mandate</span>
            </Link>

            <Link
              href="/cel"
              className="px-4 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-[#D7A00F] hover:text-white transition flex items-center"
            >
              <span>CEL Testing Lab &rarr;</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Clean Minimal Controls */}
      <div className="absolute bottom-8 right-6 sm:right-12 z-20 flex items-center space-x-3">
        {/* Prev Arrow */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="p-2.5 rounded-xl bg-[#070E5C]/80 hover:bg-[#D7A00F] hover:text-[#070E5C] text-white border border-[#C4CAD8]/30 backdrop-blur-md transition-all shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="flex space-x-1.5 px-3 py-2.5 rounded-xl bg-[#070E5C]/80 border border-[#C4CAD8]/30 backdrop-blur-md items-center">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentSlide ? 'w-7 bg-[#D7A00F] shadow-sm shadow-[#D7A00F]/50' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Next Arrow */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="p-2.5 rounded-xl bg-[#070E5C]/80 hover:bg-[#D7A00F] hover:text-[#070E5C] text-white border border-[#C4CAD8]/30 backdrop-blur-md transition-all shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
