'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronDown, Search, ArrowUpRight, 
  ShieldCheck, Phone, Sparkles
} from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import GlobalSearchModal from '@/components/common/GlobalSearchModal';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // 1. Hide on scroll-down, reveal on scroll-up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 25);

      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        // Scrolling down -> hide navbar
        setVisible(false);
      } else {
        // Scrolling up -> show navbar
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  // 3. Mobile drawer body scroll lock & focus trap
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex flex-col items-center ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Floating Apple-Style Glass Navbar Container */}
        <div className={`w-full transition-all duration-500 ${scrolled ? 'max-w-6xl px-4 pt-3' : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-2'}`}>
          <div
            className={`transition-all duration-500 rounded-full ${
              scrolled
                ? 'apple-glass border border-white/90 px-6 h-16'
                : 'bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgba(7,14,92,0.03),inset_0_1px_1px_rgba(255,255,255,0.95)] px-6 h-20'
            } flex items-center justify-between`}
          >
            {/* Left: CUBE Emblem */}
            <Link href="/" className="flex items-center group shrink-0">
              <div className={`relative transition-all duration-300 ${scrolled ? 'h-10 w-44 sm:w-52' : 'h-11 w-52 sm:w-60'}`}>
                <Image
                  src="/images/branding/cube-live-logo.png"
                  alt="CUBE"
                  fill
                  className="object-contain object-left transition-transform duration-300 group-hover:scale-[1.02]"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation Links with Sliding Morphing Active Indicator */}
            <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 relative">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || (item.children && item.children.some(c => pathname === c.href));
                const hasChildren = Boolean(item.children && item.children.length > 0);

                return (
                  <div
                    key={item.title}
                    className="relative"
                    onMouseEnter={() => hasChildren && setActiveDropdown(item.title)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className={`relative flex items-center px-3 xl:px-4 py-2 text-xs font-semibold tracking-wider transition-colors duration-300 rounded-full z-10 shrink-0 ${
                        isActive
                          ? 'text-[#070E5C] font-bold'
                          : 'text-[#24272B] hover:text-[#070E5C]'
                      }`}
                    >
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 bg-[#BBD6EA]/70 text-[#070E5C] rounded-full border border-white/80">
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown className="w-3.5 h-3.5 ml-1 text-[#747B83] transition-transform duration-300 group-hover:rotate-180" />
                      )}
                    </Link>

                    {/* Sliding Morphing Active Pill Background */}
                    {isActive && (
                      <motion.div
                        layoutId="navActiveIndicator"
                        className="absolute inset-0 rounded-full bg-[#EAF2F8] border border-[#BDD7E8] shadow-xs -z-0"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Glass Dropdown Menu with Staggered Entrance */}
                    <AnimatePresence>
                      {hasChildren && item.children && activeDropdown === item.title && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-0 pt-3 w-80 z-50"
                        >
                          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/90 shadow-[0_25px_60px_rgba(7,14,92,0.12),0_1px_3px_rgba(0,0,0,0.05)] p-2.5 max-h-[380px] overflow-y-auto overscroll-contain">
                            <div className="space-y-1 pr-1">
                              {item.children.map((sub, sIdx) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <motion.div
                                    key={sub.title}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: sIdx * 0.03 }}
                                  >
                                    <Link
                                      href={sub.href}
                                      className={`block px-3.5 py-2.5 rounded-2xl transition-all duration-200 ${
                                        isSubActive
                                          ? 'bg-[#EAF2F8] text-[#070E5C] font-bold border border-[#BBD6EA]/60'
                                          : 'text-[#24272B] hover:text-[#070E5C] hover:bg-[#EAF2F8] hover:translate-x-1'
                                      }`}
                                    >
                                      <div className="text-xs font-semibold leading-snug">{sub.title}</div>
                                      {sub.description && (
                                        <div className="text-[11px] text-[#747B83] line-clamp-1 mt-0.5 font-normal">
                                          {sub.description}
                                        </div>
                                      )}
                                    </Link>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Right Quick Controls */}
            <div className="hidden lg:flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 xl:p-2.5 rounded-full bg-white/70 hover:bg-white text-[#24272B] transition-all flex items-center space-x-1.5 text-xs border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-95 shrink-0"
                title="Search website"
              >
                <Search className="w-3.5 h-3.5 text-[#747B83]" />
                <span className="text-[#747B83] hidden 2xl:inline text-[11px]">Search</span>
                <kbd className="hidden 2xl:inline text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 text-[#747B83] border border-slate-200">⌘K</kbd>
              </button>

              <Link
                href="/contact"
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] hover:bg-[#D99A42] hover:text-white border border-[#BBD6EA] transition-all duration-300 shadow-[0_4px_16px_rgba(7,14,92,0.06)] flex items-center space-x-1.5 active:scale-95 shrink-0"
              >
                <span>Contact</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full bg-white/80 text-[#24272B] border border-white/80 shadow-xs"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-full bg-white/80 text-[#24272B] border border-white/80 shadow-xs"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer with Staggered Entrance & Focus Trap */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={drawerRef}
              tabIndex={-1}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-[94%] max-w-md mx-auto mt-2 rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(7,14,92,0.15)] p-5 lg:hidden max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain outline-none z-50"
            >
              <div className="space-y-1">
                {navigationItems.map((item, mIdx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: mIdx * 0.04 }}
                    className="py-1"
                  >
                    <Link
                      href={item.href}
                      onClick={() => !item.children && setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-semibold text-[#24272B] hover:text-[#070E5C] hover:bg-[#EAF2F8] transition-colors"
                    >
                      <span>{item.title}</span>
                      {item.children && <ChevronDown className="w-4 h-4 text-[#747B83]" />}
                    </Link>
                    {item.children && (
                      <div className="pl-4 pr-1 py-1 space-y-1">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.title}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-1.5 rounded-xl text-xs text-[#747B83] hover:text-[#070E5C] hover:bg-[#EAF2F8] transition-colors"
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                <div className="pt-4 mt-2 border-t border-[#E5E7EB]">
                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-full text-xs font-semibold text-center text-white bg-[#070E5C] hover:bg-[#D99A42] transition-colors block shadow-sm"
                  >
                    Contact CUBE
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
