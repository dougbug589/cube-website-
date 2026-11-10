'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UniversalAnnouncementPopup from '@/components/common/UniversalAnnouncementPopup';
import ScrollProgressBar from '@/components/common/ScrollProgressBar';
import LiveSync from '@/components/common/LiveSync';

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
    <div className="relative min-h-screen bg-[#F0F4F8] p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center">
      <LiveSync />
      <ScrollProgressBar />
      <UniversalAnnouncementPopup />
      
      {/* Outer Floating Apple Glass Frame Canvas */}
      <div className="w-full max-w-[1720px] bg-white/95 backdrop-blur-[36px] saturate-[180%] rounded-[28px] sm:rounded-[36px] lg:rounded-[44px] border border-white/90 shadow-[0_24px_80px_rgba(7,14,92,0.12),0_4px_24px_rgba(36,39,43,0.04),inset_0_1.5px_2px_rgba(255,255,255,1)] flex flex-col flex-1 overflow-hidden relative">
        {/* Specular edge highlight around frame */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent opacity-95 pointer-events-none z-30" />
        
        <Navbar />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
