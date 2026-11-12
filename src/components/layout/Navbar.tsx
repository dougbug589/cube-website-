'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronDown, Search, ArrowUpRight, 
  ShieldCheck, Phone, Sparkles, House
} from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import GlobalSearchModal from '@/components/common/GlobalSearchModal';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Which mobile accordion section is expanded (one at a time keeps the list short).
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

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

  // 1b. Publish the header's on-screen height so sticky in-page bars (About,
  // Media, Verticals anchor tabs) sit just below it, and slide up when it hides.
  useEffect(() => {
    const updateOffset = () => {
      const el = pillRef.current;
      const bottom = visible && el ? el.getBoundingClientRect().bottom : 0;
      document.documentElement.style.setProperty('--nav-offset', `${Math.max(0, Math.round(bottom))}px`);
    };
    updateOffset();
    const settle = setTimeout(updateOffset, 520);
    window.addEventListener('resize', updateOffset);
    return () => {
      clearTimeout(settle);
      window.removeEventListener('resize', updateOffset);
    };
  }, [visible, scrolled]);

  // 2. Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
    setActiveDropdown(null);
  }, [pathname]);

  // 3. Mobile drawer body scroll lock, focus, and Escape-to-close
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      setMobileExpanded(null); // reopen with every section collapsed
      return;
    }
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileMenuOpen]);

  // Ctrl+K / ⌘K opens (and closes) site search, as the hint in the header says.
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileSection = (title: string) =>
    setMobileExpanded((current) => (current === title ? null : title));

  return (
    <>
      {/* Tap-outside backdrop for the mobile menu (previously only the X closed it) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-backdrop"
            aria-hidden
            onClick={closeMobileMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#2B3B44]/60 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out flex flex-col items-center ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Frosted band behind the floating header once the page is scrolled:
            page text under the header blurs and fades out instead of showing
            sharply cut off beside / behind the pill. Moves with the header. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-28 bg-[#2B3B44]/75 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_55%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_55%,transparent)] transition-opacity duration-500 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Floating Apple-Style Glass Navbar Container */}
        <div className={`w-full max-w-[1720px] mx-auto transition-all duration-500 px-2 sm:px-4 md:px-6 lg:px-8 ${scrolled ? 'pt-3' : 'pt-2 sm:pt-4 md:pt-6 lg:pt-8'}`}>
          <div
            ref={pillRef}
            className={`transition-all duration-500 rounded-full ${
              scrolled
                ? 'apple-glass px-5 h-16'
                : 'bg-[#33454E]/75 backdrop-blur-3xl backdrop-saturate-150 border border-[#C9BCA6]/25 shadow-[0_16px_40px_rgba(15,25,32,0.5),inset_0_1px_1px_rgba(245,239,228,0.1)] px-6 h-20'
            } flex items-center justify-between`}
          >
            {/* Left: CUBE Emblem — pearl chip keeps the dark logo legible on slate */}
            <Link href="/" className="flex items-center group shrink-0">
              <div className={`relative transition-all duration-300 ${scrolled ? 'h-10 w-44 sm:w-52' : 'h-11 w-48 sm:w-56'} rounded-xl bg-[#F5EFE4]/95 px-2.5 py-1.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_10px_rgba(15,25,32,0.3)]`}>
                <Image
                  src="/images/branding/cube-live-logo.png"
                  alt="CUBE"
                  fill
                  className="object-contain object-left transition-transform duration-300 group-hover:scale-[1.02] p-1.5"
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
                      className={`relative flex items-center whitespace-nowrap px-2.5 xl:px-4 py-2 text-[13px] xl:text-[15px] tracking-wider transition-colors duration-300 rounded-full z-10 shrink-0 ${
                        isActive
                          ? 'text-[#E9B215] font-bold bg-[#2B3B44]/70 backdrop-blur-xl border border-[#C4921B]/40 shadow-[0_4px_14px_rgba(15,25,32,0.35)]'
                          : 'text-[#C9BCA6] font-semibold border border-transparent hover:text-[#F5EFE4] hover:bg-white/[0.06]'
                      }`}
                    >
                      {item.title === 'Home' && <House aria-hidden className="w-3.5 h-3.5 mr-1.5" />}
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-1 whitespace-nowrap text-[9px] font-bold px-1.5 py-0.5 bg-[#C4921B] text-[#2B3B44] rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown className="w-3.5 h-3.5 ml-1 text-[#A89476] transition-transform duration-300 group-hover:rotate-180" />
                      )}
                    </Link>

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
                          <div className="rounded-3xl bg-[#33454E]/95 backdrop-blur-2xl border border-[#C9BCA6]/20 shadow-[0_25px_60px_rgba(15,25,32,0.6)] p-2.5 max-h-[380px] overflow-y-auto overscroll-contain">
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
                                          ? 'bg-[#C4921B]/15 text-[#E9B215] font-bold border border-[#C4921B]/30'
                                          : 'text-[#C9BCA6] hover:text-[#F5EFE4] hover:bg-white/[0.06] hover:translate-x-1'
                                      }`}
                                    >
                                      <div className="text-xs font-semibold leading-snug">{sub.title}</div>
                                      {sub.description && (
                                        <div className="text-[11px] text-[#A89476] line-clamp-1 mt-0.5 font-normal">
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
                className="p-2 xl:p-2.5 rounded-full bg-[#2B3B44]/70 hover:bg-[#3A4C56] text-[#C9BCA6] transition-all flex items-center space-x-1.5 text-xs border border-[#C9BCA6]/25 active:scale-95 shrink-0"
                title={`Search website (${isMac ? '⌘K' : 'Ctrl+K'})`}
              >
                <Search className="w-3.5 h-3.5 text-[#A89476]" />
                <span className={`text-[#A89476] hidden text-[11px] ${scrolled ? '' : '2xl:inline'}`}>Search</span>
                <kbd className={`hidden ${scrolled ? '' : '2xl:inline'} text-[9px] px-1.5 py-0.5 rounded-md bg-[#243239] text-[#C9BCA6] border border-[#C9BCA6]/20`}>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
              </button>

              <Link
                href="/contact"
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#2B3B44] bg-[#C4921B] hover:bg-[#E9B215] transition-all duration-300 shadow-[0_4px_16px_rgba(196,146,27,0.3)] flex items-center space-x-1.5 active:scale-95 shrink-0 gold-shimmer"
              >
                <span>Contact</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center space-x-2 lg:hidden">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-3 rounded-full bg-[#33454E]/85 text-[#F5EFE4] border border-[#C9BCA6]/25"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-3 rounded-full bg-[#33454E]/85 text-[#F5EFE4] border border-[#C9BCA6]/25"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer: collapsible accordion sections */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={drawerRef}
              id="mobile-navigation"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[94%] max-w-md mx-auto mt-2 rounded-3xl bg-[#33454E]/95 backdrop-blur-2xl border border-[#C9BCA6]/25 shadow-[0_20px_50px_rgba(15,25,32,0.6)] p-4 sm:p-5 lg:hidden max-h-[calc(100dvh-100px)] overflow-y-auto overscroll-contain outline-none z-50"
            >
              <nav className="space-y-1" aria-label="Mobile">
                {navigationItems.map((item, mIdx) => {
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isExpanded = mobileExpanded === item.title;
                  const isActive =
                    pathname === item.href ||
                    Boolean(item.children?.some((c) => c.href.split('#')[0] === pathname));
                  const panelId = `mobile-nav-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                  const rowClass = `flex w-full items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                    isExpanded || isActive
                      ? 'text-[#E9B215] bg-[#C4921B]/15'
                      : 'text-[#C9BCA6] active:bg-[#C4921B]/10'
                  }`;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: mIdx * 0.04 }}
                    >
                      {hasChildren ? (
                        // The whole row (label + arrow) opens/closes the section.
                        <button
                          type="button"
                          onClick={() => toggleMobileSection(item.title)}
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          className={rowClass}
                        >
                          <span className="flex items-center">
                            {item.title === 'Home' && <House aria-hidden className="w-4 h-4 mr-2" />}
                            {item.title}
                          </span>
                          <ChevronDown
                            aria-hidden
                            className={`w-5 h-5 text-[#A89476] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#E9B215]' : ''}`}
                          />
                        </button>
                      ) : (
                        <Link href={item.href} onClick={closeMobileMenu} className={rowClass}>
                          <span className="flex items-center">
                            {item.title === 'Home' && <House aria-hidden className="w-4 h-4 mr-2" />}
                            {item.title}
                          </span>
                        </Link>
                      )}

                      <AnimatePresence initial={false}>
                        {hasChildren && isExpanded && (
                          <motion.div
                            id={panelId}
                            key="panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pr-1 pt-1 pb-2 space-y-0.5">
                              {item.children!.map((sub) => (
                                <Link
                                  key={sub.title}
                                  href={sub.href}
                                  onClick={closeMobileMenu}
                                  className="block px-3 py-2.5 rounded-xl text-[13px] text-[#A89476] active:text-[#E9B215] active:bg-[#C4921B]/10 hover:text-[#F5EFE4] hover:bg-white/[0.06] transition-colors"
                                >
                                  {sub.title}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}

                <div className="pt-4 mt-2 border-t border-[#C9BCA6]/15">
                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className="w-full py-3 rounded-full text-xs font-semibold text-center text-[#2B3B44] bg-[#C4921B] hover:bg-[#E9B215] transition-colors block shadow-sm gold-shimmer"
                  >
                    Contact CUBE
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
