'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, RotateCw, CheckCircle2 } from 'lucide-react';

interface FlipCardProps {
  title: string;
  subtitle?: string;
  category?: string;
  description: string;
  backTitle?: string;
  backDescription?: string;
  keyPoints?: string[];
  imageSrc: string;
  href: string;
  ctaText?: string;
  badge?: string;
  accentColor?: string;
}

export default function FlipCard({
  title,
  subtitle,
  category,
  description,
  backTitle,
  backDescription,
  keyPoints = [],
  imageSrc,
  href,
  ctaText = 'Explore Details',
  badge,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full h-[470px] select-none group relative cursor-pointer"
      style={{ perspective: '1200px' }}
      // Hover only for real mice: on touch screens a tap fires mouseenter AND
      // click together, which flipped the card and immediately flipped it back.
      onPointerEnter={(e) => e.pointerType === 'mouse' && setIsFlipped(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsFlipped(!isFlipped);
        }
      }}
      role="region"
      aria-label={`${title} interactive flip card`}
    >
      <div 
        className="relative w-full h-full rounded-3xl transition duration-700 ease-out shadow-[0_10px_35px_rgba(36,50,57,0.06)] hover:shadow-[0_25px_65px_rgba(36,50,57,0.14)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg) scale(1.02)' : 'rotateY(0deg)',
        }}
      >
        
        {/* FRONT SIDE (Visible when NOT flipped, hidden when flipped) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden cube-gradient-card flex flex-col justify-between transition-opacity duration-300 ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          {/* Top Image with Badges */}
          <div className="relative h-56 w-full overflow-hidden bg-white/[0.05] shrink-0">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Soft atmospheric overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10">
              {category && (
                <span className="text-[13.5px] font-bold tracking-wider uppercase px-3 py-1 bg-white/[0.1] text-[#E3E8EA] rounded-full shadow-sm backdrop-blur-sm border border-white/15">
                  {category}
                </span>
              )}
              {badge && (
                <span className="text-[13.5px] font-bold px-2.5 py-0.5 bg-[#D89F03]/35 text-[#F3F5F6] rounded-full shadow-sm">
                  {badge}
                </span>
              )}
            </div>

            {/* Flip Hint */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.1] text-[#E3E8EA] text-[13.5px] shadow-sm backdrop-blur-sm border border-white/15">
              <RotateCw className="w-3 h-3 text-[#D89F03]" />
              <span className="text-[13.5px] font-semibold"><span className="hidden [@media(hover:hover)]:inline">Hover to Flip</span><span className="[@media(hover:hover)]:hidden">Tap to Flip</span></span>
            </div>
          </div>

          {/* Front Content Area */}
          <div className="p-6 flex-1 flex flex-col justify-between bg-transparent">
            <div>
              {subtitle && (
                <span className="text-[13.5px] font-semibold text-[#D89F03] uppercase tracking-wider block mb-1">
                  {subtitle}
                </span>
              )}
              <h3 className="font-display text-lg font-medium text-[#F3F5F6] leading-snug line-clamp-2">
                {title}
              </h3>
              <p className="text-xs text-[#A7B2B8] mt-2 line-clamp-3 leading-relaxed font-sans">
                {description}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#E3E8EA]">
              <span>View capabilities &amp; mandate</span>
              <ArrowUpRight className="w-4 h-4 text-[#D89F03] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* BACK SIDE (Visible ONLY when flipped, zero bleed-through) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden cube-gradient-glass text-[#F3F5F6] p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(36,50,57,0.12)] transition-opacity duration-300 ${
            isFlipped ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <span className="text-[13.5px] font-bold uppercase tracking-wider text-[#E3E8EA]">
                Key Mandates &amp; Capabilities
              </span>
              <button
                type="button"
                className="p-1 text-[#A7B2B8] hover:text-[#E3E8EA]"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                title="Flip back"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#D89F03]" />
              </button>
            </div>

            <h4 className="font-display text-lg font-semibold text-[#E3E8EA] mt-3">
              {backTitle || title}
            </h4>

            <p className="text-xs text-[#A7B2B8] mt-2 leading-relaxed line-clamp-3">
              {backDescription || description}
            </p>

            {keyPoints && keyPoints.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-[13.5px] font-bold text-[#F3F5F6] uppercase tracking-wider">
                  Highlights:
                </div>
                <div className="space-y-1.5">
                  {keyPoints.slice(0, 4).map((pt, idx) => (
                    <div key={idx} className="flex items-start text-xs text-[#F3F5F6]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E3E8EA] mr-2 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 font-medium">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/15" onClick={(e) => e.stopPropagation()}>
            <Link
              href={href}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-semibold text-[#E3E8EA] bg-white/[0.05] border border-white/15 hover:bg-[#D89F03]/30 hover:text-[#F3F5F6] transition shadow-md group/btn"
            >
              <span>{ctaText}</span>
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
