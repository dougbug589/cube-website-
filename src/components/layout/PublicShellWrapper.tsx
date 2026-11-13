'use client';

import React, { useEffect } from 'react';
import { markHydrated } from '@/lib/hydration';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UniversalAnnouncementPopup from '@/components/common/UniversalAnnouncementPopup';
import ScrollProgressBar from '@/components/common/ScrollProgressBar';
import LiveSync from '@/components/common/LiveSync';
import RevealOnScroll from '@/components/common/RevealOnScroll';
import SplashScreen from '@/components/common/SplashScreen';
import NavProgress from '@/components/common/NavProgress';

/**
 * Public shell: fixed ambient canvas, floating glass top bar, full-bleed content.
 */
export default function PublicShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  useEffect(() => markHydrated(), []);

  if (isAdmin) {
    // Admin interface must be completely separate from public website header/footer
    return (
      <main className="min-h-screen bg-white/[0.05]">
        {pathname !== '/admin/login' && <LiveSync />}
        {children}
      </main>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0B0D0E]">
      {/* Ambient canvas: fixed, transform-only animation, sits under everything */}
      <div aria-hidden className="canvas-field" />
      <div aria-hidden className="canvas-grain" />
      <LiveSync />
      <ScrollProgressBar />
      <NavProgress />
      <UniversalAnnouncementPopup />
      <RevealOnScroll />

      {/*
        The header lives OUTSIDE any element with `filter` / `backdrop-filter` /
        `transform`: those become the containing block for position:fixed
        children and would scroll the bar away with the page.
      */}
      <Navbar />

      <SplashScreen />

      {/* page-shell: lowered while the splash shows, springs up as it lifts */}
      <div className="page-shell relative z-[1] flex flex-col min-h-screen">
        <main className="flex-1 w-full overflow-x-clip">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
