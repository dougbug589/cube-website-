'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronUp, ChevronDown, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Leader } from '@/types';

interface Vertical3DTeamCarouselProps {
  members: Leader[];
  title?: string;
  subtitle?: string;
  tagline?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function Vertical3DTeamCarousel({
  members,
  title = "Distinguished Institutional Governance",
  subtitle = "Guided by the leadership of IIT Madras and senior Secretaries of the Government of Tamil Nadu.",
  tagline = "Governance & Leadership",
  ctaText = "View Complete Governing Board",
  ctaHref = "/about/board-members",
}: Vertical3DTeamCarouselProps) {
  const list = members && members.length > 0 ? members : [
    {
      name: "Prof. V Kamakoti",
      role: "Chairman, CUBE",
      organization: "Director, IIT Madras",
      image: "/images/leadership/board_member_kamakoti.jpg",
      category: "Board Member"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartY = useRef(0);

  const total = list.length;

  const updateCarousel = useCallback((newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const normalized = (newIndex + total) % total;
    setCurrentIndex(normalized);
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  }, [isAnimating, total]);

  const handlePrev = useCallback(() => updateCarousel(currentIndex - 1), [currentIndex, updateCarousel]);
  const handleNext = useCallback(() => updateCarousel(currentIndex + 1), [currentIndex, updateCarousel]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [currentIndex, isPaused, updateCarousel]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        handlePrev();
      } else if (e.key === 'ArrowDown') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  const currentMember = list[currentIndex];

  const getCardOffsetClass = (i: number) => {
    const offset = (i - currentIndex + total) % total;
    if (offset === 0) return 'center-card';
    if (offset === 1) return 'down-1-card';
    if (offset === 2) return 'down-2-card';
    if (offset === total - 1) return 'up-1-card';
    if (offset === total - 2) return 'up-2-card';
    return 'hidden-card';
  };

  return (
    <section 
      className="py-24 bg-gradient-to-b from-[#FFFFFF] via-[#F6FAFD] to-[#EAF2F8] border-b border-[#E5E7EB] relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#BBD6EA]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-white/60 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#D99A42] font-bold inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{tagline}</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight mt-2">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#747B83] mt-2">
            {subtitle}
          </p>
        </div>

        {/* Vertical 3D Stage Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 min-h-[520px]">
          
          {/* LEFT: 3D Cylindrical Vertical Carousel Track */}
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <div 
              className="relative w-[340px] sm:w-[440px] h-[440px] flex items-center justify-center"
              style={{ perspective: '1100px' }}
              onTouchStart={(e) => {
                touchStartY.current = e.changedTouches[0].screenY;
              }}
              onTouchEnd={(e) => {
                const diff = touchStartY.current - e.changedTouches[0].screenY;
                if (Math.abs(diff) > 40) {
                  if (diff > 0) handleNext();
                  else handlePrev();
                }
              }}
            >
              {list.map((member, i) => {
                const offsetClass = getCardOffsetClass(i);
                if (offsetClass === 'hidden-card') return null;

                const isCenter = offsetClass === 'center-card';

                return (
                  <div
                    key={`${member.name}-${i}`}
                    onClick={() => updateCarousel(i)}
                    className={`absolute w-[320px] sm:w-[410px] h-[220px] sm:h-[240px] rounded-3xl transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] cursor-pointer select-none overflow-hidden ${
                      isCenter 
                        ? 'z-30 shadow-[0_20px_45px_-12px_rgba(7,14,92,0.18)] border-2 border-white ring-1 ring-[#BDD7E8]' 
                        : 'shadow-md border border-white/70 hover:opacity-90'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      ...(offsetClass === 'center-card' && {
                        transform: 'translateY(0) scale(1.05) translateZ(0)',
                        opacity: 1,
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F6FAFD 50%, #EAF2F8 100%)',
                      }),
                      ...(offsetClass === 'up-1-card' && {
                        transform: 'translateY(-130px) scale(0.9) translateZ(-110px)',
                        opacity: 0.82,
                        zIndex: 20,
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F6FB 100%)',
                      }),
                      ...(offsetClass === 'up-2-card' && {
                        transform: 'translateY(-240px) scale(0.78) translateZ(-260px)',
                        opacity: 0.45,
                        zIndex: 10,
                        background: '#FFFFFF',
                      }),
                      ...(offsetClass === 'down-1-card' && {
                        transform: 'translateY(130px) scale(0.9) translateZ(-110px)',
                        opacity: 0.82,
                        zIndex: 20,
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #F1F6FB 100%)',
                      }),
                      ...(offsetClass === 'down-2-card' && {
                        transform: 'translateY(240px) scale(0.78) translateZ(-260px)',
                        opacity: 0.45,
                        zIndex: 10,
                        background: '#FFFFFF',
                      }),
                    }}
                  >
                    {/* Balanced 2-Column Split: Portrait Circle + Info Panel for Perfect Headshot Cropping */}
                    <div className="relative w-full h-full p-5 flex items-center gap-4 sm:gap-5">
                      
                      {/* Portrait Avatar Container - Always perfectly framed without clipping forehead or chin */}
                      <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-sm border-2 border-white bg-slate-100 ring-1 ring-[#BDD7E8]/60">
                        <Image
                          src={member.image || '/images/leadership/about_leader.jpg'}
                          alt={member.name}
                          fill
                          sizes="(max-width: 640px) 112px, 128px"
                          priority={isCenter}
                          className={`object-cover object-top transition-all duration-700 ${
                            isCenter ? 'grayscale-0 scale-100' : 'grayscale contrast-125 scale-105'
                          }`}
                        />
                      </div>

                      {/* Right Details inside Card */}
                      <div className="flex-1 min-w-0 pr-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#070E5C] border border-[#BDD7E8]/80 shadow-xs mb-1.5">
                          <ShieldCheck className="w-3 h-3 text-[#D99A42]" />
                          <span className="truncate">{member.category || 'Board Member'}</span>
                        </span>

                        <h4 className="font-serif text-base sm:text-lg font-semibold text-[#24272B] tracking-tight leading-snug line-clamp-2">
                          {member.name}
                        </h4>

                        <p className="text-xs font-semibold text-[#070E5C] mt-1 line-clamp-1">
                          {member.role}
                        </p>

                        <p className="text-[11px] text-[#747B83] mt-0.5 line-clamp-1">
                          {member.organization || 'IIT Madras / Govt of Tamil Nadu'}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Frosted Apple Glass Details & Controls Section */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            
            {/* Nav Arrows (Light Professional Apple Pill) */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                aria-label="Previous member"
                className="w-11 h-11 rounded-full apple-glass border border-[#BDD7E8] text-[#070E5C] flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-sm group"
              >
                <ChevronUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next member"
                className="w-11 h-11 rounded-full apple-glass border border-[#BDD7E8] text-[#070E5C] flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-sm group"
              >
                <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
              </button>
              <span className="text-[11px] font-semibold text-[#747B83] uppercase tracking-wider ml-2">
                {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </div>

            {/* Member Info Card with Apple Frosted Glass */}
            <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl apple-glass-card border border-[#BDD7E8]/80 text-left transition-all duration-500 shadow-[0_16px_36px_-12px_rgba(7,14,92,0.06)]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]">
                    {currentMember?.category || 'Leadership'}
                  </span>
                  {currentMember?.organization && (
                    <span className="text-[11px] text-[#747B83] font-medium truncate">
                      {currentMember.organization}
                    </span>
                  )}
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#24272B] tracking-tight">
                  {currentMember?.name}
                </h3>

                <p className="text-sm font-semibold text-[#070E5C]">
                  {currentMember?.role}
                </p>

                <p className="text-xs text-[#747B83] leading-relaxed pt-2 border-t border-[#E5E7EB]">
                  Contributing strategic oversight, institutional governance, and technical validation across CUBE applied research operations.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold text-[#070E5C] bg-white border border-[#BDD7E8] hover:bg-[#EAF2F8] hover:scale-105 active:scale-95 shadow-sm transition-all"
                >
                  <span>{ctaText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 text-[#D99A42]" />
                </Link>
                <Link
                  href="/about/chairman-message"
                  className="text-xs font-semibold text-[#747B83] hover:text-[#070E5C] transition-colors"
                >
                  Read Messages &rarr;
                </Link>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2 pt-1">
              {list.map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateCarousel(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex 
                      ? 'w-7 bg-[#070E5C]' 
                      : 'w-2 bg-[#BDD7E8]/70 hover:bg-[#747B83]'
                  }`}
                />
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

