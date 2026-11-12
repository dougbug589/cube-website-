'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Search, ArrowUpRight, User } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import GlobalSearchModal from '@/components/common/GlobalSearchModal';

/**
 * Site header: one floating glass bar for every width.
 *
 * - xl (1280px+): full menu with a gold morphing active pill and glass
 *   dropdowns. Upstream measured the full menu at ~1180px, so it never
 *   appears below xl (it overflowed and pushed the CTA out when zoomed).
 * - below xl: logo, search, menu button and an accordion drawer.
 * - Turns more opaque once the page scrolls. Never hides, so sticky in-page
 *   tab bars can rely on a constant offset.
 * - Publishes --nav-offset (bar bottom + gap) for those sticky bars.
 */

const BAR_TOP = 12; // px, matches top-3
const BAR_H_DESKTOP = 76; // xl:h-[76px]
const BAR_H_MOBILE = 64; // h-16

const MENU = navigationItems.filter((i) => i.title !== 'Home');
const DRAWER = [...navigationItems, { title: 'Contact Us', href: '/contact' }];

type Item = (typeof DRAWER)[number] & { children?: { title: string; href: string; description?: string }[]; badge?: string };

function isItemActive(pathname: string, item: Item) {
  if (item.href === '/') return pathname === '/';
  return (
    pathname === item.href ||
    pathname.startsWith(item.href + '/') ||
    Boolean(item.children?.some((c) => c.href.split('#')[0] === pathname))
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [dropdownX, setDropdownX] = useState(0);

  // Scroll state (rAF-throttled, passive)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Offset for sticky in-page bars (About, Media, Verticals)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const apply = () => {
      const h = mq.matches ? BAR_H_DESKTOP : BAR_H_MOBILE;
      document.documentElement.style.setProperty('--nav-offset', `${BAR_TOP + h + 8}px`);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Ctrl/⌘K search
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

  // Reset menus on navigation
  useEffect(() => {
    setDrawerOpen(false);
    setExpanded(null);
    setDropdown(null);
  }, [pathname]);

  // Drawer: scroll lock, focus, Escape
  useEffect(() => {
    if (!drawerOpen) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    drawerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  // Dropdown hover intent: small close delay so moving into the panel doesn't flicker
  const openDropdown = useCallback((title: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (title) {
      const el = itemRefs.current[title];
      const header = headerRef.current;
      if (el && header) {
        const r = el.getBoundingClientRect();
        const h = header.getBoundingClientRect();
        setDropdownX(r.left + r.width / 2 - h.left);
      }
    }
    setDropdown(title);
  }, []);
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setDropdown(null), 240);
  }, []);

  const openItem = (MENU as Item[]).find((i) => i.title === dropdown);

  // Liquid glass; a touch more opaque once content scrolls underneath.
  const surface = scrolled || drawerOpen ? 'liquid-glass is-solid' : 'liquid-glass';

  return (
    <>
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="drawer-backdrop"
            aria-hidden
            onClick={() => setDrawerOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#E6ECEF] backdrop-blur-[2px] xl:hidden"
          />
        )}
      </AnimatePresence>

      <header ref={headerRef} className="fixed top-3 inset-x-3 sm:inset-x-4 lg:inset-x-6 z-50">
        <div
          className={`relative mx-auto max-w-[1600px] h-16 xl:h-[76px] rounded-[24px] ${surface}`}
        >
          {/* gold specular hairline */}
          <div aria-hidden className="pointer-events-none absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#E9B215]/50 to-transparent" />

          <div className="h-full flex items-center justify-between gap-4 pl-2.5 pr-2 xl:pl-3 xl:pr-2.5">
            {/* Brand */}
            <Link href="/" className="press group flex items-center gap-3.5 shrink-0" aria-label="CUBE home">
              <span className="relative h-12 xl:h-[60px] w-[118px] xl:w-[148px] shrink-0">
                <Image
                  src="/images/branding/cube-live-logo.png"
                  alt=""
                  fill
                  priority
                  sizes="148px"
                  className="object-contain object-left drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <span aria-hidden className="hidden sm:block h-9 w-px bg-[#33454E]/15" />
              <span className="hidden sm:flex flex-col leading-none">
                <span className="font-display text-[19px] font-extrabold tracking-[0.08em] text-[#243239]">CUBE</span>
                <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#5B6A71] mt-1">Beyond foundations</span>
              </span>
            </Link>

            {/* Desktop menu */}
            <nav aria-label="Primary" className="hidden xl:flex items-center gap-0.5 2xl:gap-1" onMouseLeave={scheduleClose}>
              {MENU.map((raw) => {
                const item = raw as Item;
                const hasChildren = Boolean(item.children?.length);
                const active = isItemActive(pathname, item);
                const open = dropdown === item.title;
                return (
                  <div
                    key={item.title}
                    ref={(el) => {
                      itemRefs.current[item.title] = el;
                    }}
                    className="relative"
                    onMouseEnter={() => openDropdown(hasChildren ? item.title : null)}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      aria-haspopup={hasChildren || undefined}
                      aria-expanded={hasChildren ? open : undefined}
                      onFocus={() => openDropdown(hasChildren ? item.title : null)}
                      className={`press relative flex items-center gap-1.5 h-11 px-3.5 2xl:px-4 rounded-2xl text-[16px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                        active ? 'text-[#243239] font-bold' : 'text-[#46565E] hover:text-[#243239]'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                          className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#F8E3A3] to-[#F0C468]/70 border border-[#C4921B]/30 shadow-[0_8px_24px_-12px_rgba(196,146,27,0.7)]"
                        />
                      )}
                      {!active && open && <span className="absolute inset-0 rounded-2xl bg-[#33454E]/[0.08]" />}
                      <span className="relative">{item.title}</span>
                      {item.badge && (
                        <span
                          title={item.badge}
                          aria-label={item.badge}
                          className="relative w-1.5 h-1.5 rounded-full bg-[#E9B215] shadow-[0_0_8px_#E9B215]"
                        />
                      )}
                      {hasChildren && (
                        <ChevronDown
                          size={13}
                          strokeWidth={1.75}
                          className={`relative transition-transform duration-300 ${open ? 'rotate-180 text-[#9A7015]' : 'text-[#7A888E]'}`}
                        />
                      )}
                    </Link>

                  </div>
                );
              })}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                title={`Search (${isMac ? '⌘K' : 'Ctrl+K'})`}
                className="press jiggle h-11 w-11 2xl:w-auto 2xl:px-3.5 rounded-2xl grid 2xl:flex place-items-center items-center gap-2 text-[#46565E] hover:text-[#243239] bg-[#33454E]/[0.05] border border-[#33454E]/15 hover:border-[#33454E]/15 transition-colors"
              >
                <Search size={18} strokeWidth={2} />
                <kbd className="hidden 2xl:inline font-sans text-[10px] px-1.5 py-0.5 rounded-md bg-[#E6ECEF] text-[#5B6A71] border border-[#33454E]/15">
                  {isMac ? '⌘K' : 'Ctrl K'}
                </kbd>
              </button>

              <Link
                href="/admin/login"
                aria-label="Admin sign in"
                title="Admin"
                className="press jiggle hidden xl:grid h-11 w-11 rounded-2xl place-items-center text-[#5B6A71] hover:text-[#243239] bg-[#33454E]/[0.05] border border-[#33454E]/15 hover:border-[#33454E]/15 transition-colors"
              >
                <User size={18} strokeWidth={2} />
              </Link>

              <Link
                href="/contact"
                className="hidden sm:inline-flex btn-gold gold-shimmer items-center gap-1.5 h-11 px-5 rounded-2xl text-[15.5px] font-extrabold"
              >
                Get in touch <ArrowUpRight size={14} strokeWidth={2} />
              </Link>

              <button
                type="button"
                onClick={() => setDrawerOpen((o) => !o)}
                className="press xl:hidden h-11 w-11 rounded-2xl grid place-items-center text-[#243239] bg-[#33454E]/[0.05] border border-[#33454E]/15"
                aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={drawerOpen}
                aria-controls="site-drawer"
              >
                {drawerOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
              </button>
            </div>
          </div>
        </div>

        {/*
          Dropdown lives OUTSIDE the glass bar: a backdrop-filter nested in
          another backdrop-filter (or under any CSS filter) can only blur its
          parent, not the page, so it looked flat. As a sibling it blurs the page.
        */}
        <AnimatePresence>
          {openItem?.children?.length ? (
            <motion.div
              key={openItem.title}
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.14 } }}
              transition={{ type: 'spring', stiffness: 520, damping: 30, mass: 0.7 }}
              style={{ left: dropdownX - 152, transformOrigin: '50% 0%' }}
              className="hidden xl:block absolute top-full pt-3 w-[304px]"
              onMouseEnter={() => openDropdown(openItem.title)}
              onMouseLeave={scheduleClose}
            >
              <div className="liquid-glass is-menu rounded-[24px] p-2">
                <div aria-hidden className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#E9B215]/60 to-transparent" />
                <p className="label-mono px-3 pt-2 pb-1.5">{openItem.title}</p>
                {openItem.children.map((sub) => (
                  <Link
                    key={sub.title}
                    href={sub.href}
                    className="press group flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-[15px] font-semibold text-[#33454E] hover:text-[#243239] hover:bg-white/55 transition-colors"
                  >
                    <span>{sub.title}</span>
                    <ArrowUpRight size={14} strokeWidth={2} className="text-[#9A7015] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Drawer (below xl) */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              ref={drawerRef}
              id="site-drawer"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: -12, scale: 0.94, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
              exit={{ opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18 } }}
              transition={{ type: 'spring', stiffness: 460, damping: 32, mass: 0.8 }}
              className="xl:hidden liquid-glass is-solid origin-top mt-2 mx-auto max-w-md rounded-[26px] p-2.5 max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain outline-none"
            >
              <nav aria-label="Mobile" className="space-y-0.5">
                {DRAWER.map((raw, i) => {
                  const item = raw as Item;
                  const hasChildren = Boolean(item.children?.length);
                  const isExpanded = expanded === item.title;
                  const active = isItemActive(pathname, item);
                  const panelId = `drawer-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                  const row = `press flex w-full items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-[17px] font-bold transition-colors ${
                    active || isExpanded ? 'text-[#243239] bg-[#C4921B]/12' : 'text-[#33454E] active:bg-[#33454E]/[0.08]'
                  }`;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: i * 0.025 }}
                    >
                      {hasChildren ? (
                        <button
                          type="button"
                          className={row}
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          onClick={() => setExpanded((c) => (c === item.title ? null : item.title))}
                        >
                          {item.title}
                          <ChevronDown size={16} strokeWidth={1.75} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#9A7015]' : 'text-[#7A888E]'}`} />
                        </button>
                      ) : (
                        <Link href={item.href} className={row} onClick={() => setDrawerOpen(false)}>
                          {item.title}
                          {item.badge && <span className="font-sans text-[10px] uppercase tracking-wider text-[#9A7015]">{item.badge}</span>}
                        </Link>
                      )}
                      <AnimatePresence initial={false}>
                        {hasChildren && isExpanded && (
                          <motion.div
                            id={panelId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="ml-3.5 pl-3 my-1 border-l border-[#33454E]/15 space-y-0.5">
                              {item.children!.map((sub) => (
                                <Link
                                  key={sub.title}
                                  href={sub.href}
                                  onClick={() => setDrawerOpen(false)}
                                  className="block px-3 py-2.5 rounded-xl text-[15.5px] font-semibold text-[#46565E] hover:text-[#243239] hover:bg-[#33454E]/[0.05] transition-colors"
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
              </nav>
              <div className="hairline my-2.5" />
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Link
                  href="/contact"
                  onClick={() => setDrawerOpen(false)}
                  className="btn-gold gold-shimmer h-12 rounded-2xl inline-flex items-center justify-center gap-1.5 text-[16px] font-extrabold"
                >
                  Get in touch <ArrowUpRight size={15} />
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Admin sign in"
                  className="h-11 w-11 rounded-xl grid place-items-center text-[#5B6A71] bg-[#33454E]/[0.05] border border-[#33454E]/15"
                >
                  <User size={18} strokeWidth={2} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
