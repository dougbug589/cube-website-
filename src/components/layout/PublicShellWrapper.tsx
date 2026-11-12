'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UniversalAnnouncementPopup from '@/components/common/UniversalAnnouncementPopup';
import ScrollProgressBar from '@/components/common/ScrollProgressBar';
import LiveSync from '@/components/common/LiveSync';
import RevealOnScroll from '@/components/common/RevealOnScroll';

export default function PublicShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin interface must be completely separate from public website header/footer
    return (
      <main className="min-h-screen bg-slate-100">
        {pathname !== '/admin/login' && <LiveSync />}
        {children}
      </main>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#2B3B44] p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center">
      <LiveSync />
      <ScrollProgressBar />
      <UniversalAnnouncementPopup />
      <RevealOnScroll />

      {/*
        The Navbar (fixed header, mobile drawer, search dialog) must live OUTSIDE
        any element with `filter` / `backdrop-filter` / `transform`: those turn
        the element into the containing block for position:fixed children, which
        made the header scroll away with the page instead of staying on screen.
      */}
      <Navbar />

      {/* ═══ Etihad Slate Frame — dark canvas, gold hairline edge ═══ */}
      <div className="w-full max-w-[1720px] bg-[#2B3B44] rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] border border-[#C4921B]/25 shadow-[0_24px_80px_rgba(15,25,32,0.55),inset_0_1px_1px_rgba(245,239,228,0.08)] flex flex-col flex-1 overflow-clip relative">
        {/* Gold specular edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C4921B]/70 to-transparent opacity-90 pointer-events-none z-30" />

        <div className="flex flex-col flex-1">
          <main className="flex-1 w-full overflow-x-clip">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
