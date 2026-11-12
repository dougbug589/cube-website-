'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

interface PageHeaderProps {
  badge: string;
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  backHref?: string;
}

export default function PageHeader({ badge, title, description, breadcrumbs, backHref }: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    // Only step back through history when the previous page was on this site;
    // otherwise (opened from Google, a shared link, a new tab) "Back" used to
    // leave the website or do nothing. Fall back to the breadcrumb parent.
    const cameFromThisSite =
      typeof document !== 'undefined' &&
      document.referrer.startsWith(window.location.origin) &&
      window.history.length > 1;
    if (cameFromThisSite) {
      router.back();
      return;
    }
    const parent = [...(breadcrumbs || [])].reverse().find((crumb) => crumb.href)?.href;
    router.push(parent || '/');
  };

  return (
    <div className="bg-gradient-to-b from-[#FFFFFF] via-[#FAF8F4] to-[#F5EFE4] text-[#24272B] pt-28 sm:pt-32 pb-12 sm:pb-16 border-b border-[#E5E7EB] relative overflow-hidden select-none">
      {/* Subtle Architectural Dot Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#24272B 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Soft Light Atmosphere Accent (Zero Dark Gradient) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#F5EFE4] to-transparent rounded-full blur-3xl pointer-events-none opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Navigation Strip: Back Button + Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5E7EB]">
          
          {/* Universal Clean Light Back Button */}
          <button
            onClick={handleBack}
            className="group inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white hover:bg-[#F5EFE4] text-[#24272B] hover:text-[#2B3B44] text-xs font-semibold border border-[#E5E7EB] transition-all duration-200 shadow-sm"
            title="Go back to previous page"
            aria-label="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-[#747B83]" />
            <span>Back</span>
          </button>

          {/* Clean Light Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-xs text-[#747B83] overflow-x-auto py-1 font-sans">
            <Link href="/" className="hover:text-[#2B3B44] transition flex-shrink-0">Home</Link>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="w-3.5 h-3.5 text-[#E5E7EB] flex-shrink-0" />
                {b.href ? (
                  <Link href={b.href} className="hover:text-[#2B3B44] transition flex-shrink-0">{b.label}</Link>
                ) : (
                  <span className="text-[#2B3B44] font-semibold truncate">{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Editorial Light Header Content */}
        <div className="w-full space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2B3B44] bg-[#F5EFE4] border border-[#C9BCA6] px-3.5 py-1.5 rounded-full shadow-sm">
              {badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light text-[#24272B] leading-tight tracking-tight"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base md:text-lg text-[#747B83] leading-relaxed max-w-4xl font-sans"
          >
            {description}
          </motion.p>
        </div>

      </div>
    </div>
  );
}
