'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Search, House, ArrowUpRight, User } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import GlobalSearchModal from '@/components/common/GlobalSearchModal';

/**
 * Mobile / tablet chrome (below lg): a compact fixed slate-glass top bar plus a
 * liquid-glass accordion drawer. Desktop navigation is the left rail (Sidebar.tsx).
 *
 * Publishes `--nav-offset` (height of the fixed bar on small screens, 0 on
 * desktop where the rail takes no vertical space) so sticky in-page tab bars
 * (About, Media, Verticals) sit just below the chrome.
 */
const MOBILE_BAR_HEIGHT = 56;

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Header offset for sticky in-page bars.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => {
      document.documentElement.style.setProperty('--nav-offset', `${mq.matches ? 0 : MOBILE_BAR_HEIGHT}px`);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
  }, [pathname]);

  // Drawer: scroll lock, focus, Escape
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      setMobileExpanded(null);
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

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleMobileSection = (title: string) =>
    setMobileExpanded((current) => (current === title ? null : title));

  const drawerItems = [...navigationItems, { title: 'Tenders', href: '/tenders' }, { title: 'Contact', href: '/contact' }];

  return (
    <>
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

      <header className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div
          className={`h-14 px-4 flex items-center justify-between transition-all duration-500 ${
            scrolled || mobileMenuOpen
              ? 'bg-[#33454E]/85 backdrop-blur-2xl backdrop-saturate-150 border-b border-[#C9BCA6]/15 shadow-[0_10px_30px_rgba(15,25,32,0.35)]'
              : 'bg-gradient-to-b from-[#1F2B32]/70 to-transparent'
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-8 w-28 rounded-md bg-[#F5EFE4]/95 px-1.5 py-0.5 overflow-hidden shadow-[0_2px_8px_rgba(15,25,32,0.3)]">
              <Image src="/images/branding/cube-live-logo.png" alt="CUBE" fill priority className="object-contain object-left p-0.5" />
            </div>
            <span className="font-display tracking-[0.14em] text-white text-base leading-none">CUBE</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-10 h-10 rounded-full grid place-items-center text-[#F5EFE4] bg-white/[0.08] border border-white/10 active:scale-95 transition"
              aria-label="Search"
            >
              <Search size={17} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full grid place-items-center text-[#F5EFE4] bg-white/[0.08] border border-white/10 active:scale-95 transition"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X size={19} strokeWidth={1.5} /> : <Menu size={19} strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              ref={drawerRef}
              id="mobile-navigation"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-3 mt-2 rounded-3xl bg-[#2B3B44]/90 backdrop-blur-2xl backdrop-saturate-150 border border-[#C9BCA6]/20 shadow-[0_20px_50px_rgba(15,25,32,0.6),inset_0_1px_1px_rgba(245,239,228,0.1)] p-3 max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain outline-none"
            >
              <div aria-hidden className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#C4921B]/60 to-transparent" />
              <nav className="space-y-0.5" aria-label="Mobile">
                {drawerItems.map((item, mIdx) => {
                  const children = 'children' in item ? item.children : undefined;
                  const hasChildren = Boolean(children && children.length > 0);
                  const isExpanded = mobileExpanded === item.title;
                  const isActive =
                    pathname === item.href ||
                    Boolean(children?.some((c) => c.href.split('#')[0] === pathname));
                  const panelId = `mobile-nav-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                  const rowClass = `flex w-full items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-light transition-colors ${
                    isExpanded || isActive ? 'text-[#E9B215] bg-[#C4921B]/12' : 'text-[#E8E2D5] active:bg-white/[0.06]'
                  }`;

                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: mIdx * 0.035 }}
                    >
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleMobileSection(item.title)}
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          className={rowClass}
                        >
                          <span className="flex items-center">{item.title}</span>
                          <ChevronDown
                            aria-hidden
                            className={`w-[18px] h-[18px] text-[#A89476] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#E9B215]' : ''}`}
                          />
                        </button>
                      ) : (
                        <Link href={item.href} onClick={closeMobileMenu} className={rowClass}>
                          <span className="flex items-center">
                            {item.title === 'Home' && <House aria-hidden className="w-4 h-4 mr-2" />}
                            {item.title}
                          </span>
                          {'badge' in item && item.badge && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-[#C4921B] text-[#2B3B44] rounded-full">{item.badge}</span>
                          )}
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
                              {children!.map((sub) => (
                                <Link
                                  key={sub.title}
                                  href={sub.href}
                                  onClick={closeMobileMenu}
                                  className="block px-3 py-2.5 rounded-xl text-[13px] font-light text-[#C9BCA6] active:text-[#E9B215] hover:text-white hover:bg-white/[0.06] transition-colors"
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

                <div className="pt-3 mt-2 border-t border-[#C9BCA6]/15 grid grid-cols-[1fr_auto] gap-2">
                  <Link
                    href="/contact"
                    onClick={closeMobileMenu}
                    className="gold-shimmer py-3 rounded-full text-xs font-medium text-center text-[#2B3B44] bg-[#C4921B] hover:bg-[#E9B215] transition-colors flex items-center justify-center gap-1.5"
                  >
                    Get in touch <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={closeMobileMenu}
                    aria-label="Admin"
                    className="w-11 h-11 rounded-full grid place-items-center text-[#C9BCA6] bg-white/[0.06] border border-white/10"
                  >
                    <User size={16} strokeWidth={1.5} />
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
