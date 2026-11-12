'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House, Compass, LayoutGrid, BookOpen, FlaskConical, Newspaper,
  Award, HelpCircle, Search, User, ChevronRight, ArrowUpRight, FileText,
} from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import GlobalSearchModal from '@/components/common/GlobalSearchModal';

/**
 * Etihad-style fixed left rail (desktop, lg+).
 * - 176px slate rail, light-weight labels, line icons
 * - gold morphing active indicator (framer layoutId)
 * - liquid-glass flyout for sections with children (About, Verticals, Media)
 * - Search (Ctrl/⌘K), Contact and Admin pinned to the bottom
 * The mobile chrome lives in Navbar.tsx (top bar + drawer).
 */

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Home: House,
  About: Compass,
  Verticals: LayoutGrid,
  Projects: BookOpen,
  'CEL Lab': FlaskConical,
  Media: Newspaper,
  Careers: Award,
  Tenders: FileText,
  Contact: HelpCircle,
};

// Rail order: Projects first (Etihad leads with "Book"), Home reachable from the logo.
const RAIL_ITEMS = [
  ...navigationItems.filter((i) => i.title !== 'Home'),
  { title: 'Tenders', href: '/tenders' },
  { title: 'Contact', href: '/contact' },
];

export const RAIL_WIDTH_CLASS = 'lg:pl-44';

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setOpen(null), [pathname]);

  return (
    <>
      <aside
        aria-label="Primary"
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-44 z-50 flex-col bg-[#33454E] border-r border-white/[0.06] shadow-[8px_0_40px_rgba(15,25,32,0.35)]"
      >
        {/* subtle vertical sheen */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/[0.12]" />

        {/* Brand block */}
        <Link href="/" className="relative block px-5 pt-6 pb-5 border-b border-white/10 group">
          <div className="relative h-9 w-full rounded-lg bg-[#F5EFE4]/95 px-2 py-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_2px_10px_rgba(15,25,32,0.3)] overflow-hidden">
            <Image
              src="/images/branding/cube-live-logo.png"
              alt="CUBE"
              fill
              priority
              className="object-contain object-left p-1 transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="mt-2.5 font-display text-[19px] tracking-[0.14em] text-white leading-none">CUBE</div>
          <div className="text-[7.5px] uppercase tracking-[0.22em] text-[#C9BCA6] mt-1.5 whitespace-nowrap">Beyond Foundations</div>
        </Link>

        {/* Nav */}
        {/* no overflow here: it would clip the flyouts that open to the right of the rail */}
        <nav className="relative flex-1 py-3" onMouseLeave={() => setOpen(null)}>
          {RAIL_ITEMS.map((item) => {
            const Icon = ICONS[item.title] || Compass;
            const children = 'children' in item ? item.children : undefined;
            const hasChildren = Boolean(children && children.length > 0);
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href + '/')) ||
              Boolean(children?.some((c) => c.href.split('#')[0] === pathname));
            const isOpen = open === item.title;

            return (
              <div key={item.title} className="relative" onMouseEnter={() => setOpen(hasChildren ? item.title : null)}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-3 px-5 py-[11px] text-[13px] font-light transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="rail-active"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      className="absolute inset-y-0 left-0 right-0 bg-white/[0.08] border-l-2 border-[#E9B215]"
                    />
                  )}
                  {!isActive && isOpen && <span className="absolute inset-0 bg-white/[0.05]" />}
                  <Icon size={16} strokeWidth={1.5} className={`relative shrink-0 transition-colors ${isActive ? 'text-[#E9B215]' : 'text-[#C9BCA6]'}`} />
                  <span className="relative whitespace-nowrap">{item.title}</span>
                  {'badge' in item && item.badge && (
                    // Etihad rail keeps labels quiet: badge becomes a pulsing gold dot with a tooltip
                    <span
                      title={item.badge}
                      aria-label={item.badge}
                      className="relative ml-auto w-1.5 h-1.5 rounded-full bg-[#E9B215] shadow-[0_0_8px_#E9B215] animate-pulse"
                    />
                  )}
                  {hasChildren && !('badge' in item && item.badge) && (
                    <ChevronRight size={12} strokeWidth={1.5} className={`relative ml-auto transition-all ${isOpen ? 'text-[#E9B215] translate-x-0.5' : 'text-white/30'}`} />
                  )}
                </Link>

                {/* Liquid-glass flyout */}
                <AnimatePresence>
                  {hasChildren && isOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -6, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-full top-0 pl-2 w-72 z-50"
                    >
                      <div className="rounded-2xl bg-[#2B3B44]/85 backdrop-blur-2xl backdrop-saturate-150 border border-[#C9BCA6]/20 shadow-[0_25px_60px_rgba(15,25,32,0.6),inset_0_1px_1px_rgba(245,239,228,0.1)] p-2 overflow-hidden">
                        <div aria-hidden className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[#C4921B]/60 to-transparent" />
                        <div className="px-3 pt-2 pb-1.5 text-[9px] uppercase tracking-[0.25em] text-[#A89476]">{item.title}</div>
                        {children!.map((sub, i) => {
                          // Children are mostly in-page anchors; only a distinct route can be "active".
                          const subActive = !sub.href.includes('#') && pathname === sub.href;
                          return (
                            <motion.div
                              key={sub.title}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.18, delay: i * 0.025 }}
                            >
                              <Link
                                href={sub.href}
                                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-[12.5px] font-light transition-all ${
                                  subActive ? 'text-[#E9B215] bg-[#C4921B]/10' : 'text-[#E8E2D5] hover:text-white hover:bg-white/[0.06] hover:translate-x-0.5'
                                }`}
                              >
                                <span>{sub.title}</span>
                                <ArrowUpRight size={12} strokeWidth={1.5} className="opacity-0 group-hover:opacity-100 text-[#E9B215] transition-opacity" />
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Bottom utilities */}
        <div className="relative px-4 py-4 border-t border-white/10 space-y-1.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-[13px] font-light text-white/80 hover:text-white hover:bg-white/[0.06] transition"
            title={`Search website (${isMac ? '⌘K' : 'Ctrl+K'})`}
          >
            <Search size={16} strokeWidth={1.5} className="text-[#C9BCA6]" />
            <span>Search</span>
            <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded-md bg-[#243239] text-[#C9BCA6] border border-[#C9BCA6]/20">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <Link
            href="/contact"
            className="gold-shimmer flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-medium text-[#2B3B44] bg-[#C4921B] hover:bg-[#E9B215] transition-colors shadow-[0_6px_18px_rgba(196,146,27,0.3)]"
          >
            Get in touch <ArrowUpRight size={13} />
          </Link>
          <Link
            href="/admin/login"
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-[13px] font-light text-white/70 hover:text-white hover:bg-white/[0.06] transition"
          >
            <User size={16} strokeWidth={1.5} className="text-[#C9BCA6]" />
            <span>Admin</span>
          </Link>
        </div>
      </aside>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
