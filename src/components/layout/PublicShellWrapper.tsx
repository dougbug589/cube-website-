'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UniversalAnnouncementPopup from '@/components/common/UniversalAnnouncementPopup';
import ScrollProgressBar from '@/components/common/ScrollProgressBar';
import LiveSync from '@/components/common/LiveSync';
import RevealOnScroll from '@/components/common/RevealOnScroll';

/**
 * Etihad-style shell: a fixed slate rail on the left (desktop) or a compact
 * glass top bar (mobile), and full-bleed content to the right of the rail.
 */
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
    <div className="relative min-h-screen bg-[#2B3B44]">
      <LiveSync />
      <ScrollProgressBar />
      <UniversalAnnouncementPopup />
      <RevealOnScroll />

      {/*
        Chrome lives OUTSIDE any element with `filter` / `backdrop-filter` /
        `transform`: those become the containing block for position:fixed
        children and would scroll the rail / bar away with the page.
      */}
      <Sidebar />
      <Navbar />

      {/* Content column: shifted right of the 176px rail on desktop */}
      <div className="lg:pl-44 flex flex-col min-h-screen">
        <main className="flex-1 w-full overflow-x-clip">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
