'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Search, ArrowUpRight, User } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import { verticals } from '@/data/verticals';
import { projects } from '@/data/projects';
import { celOverview } from '@/data/cel';
import GlobalSearchModal from '@/components/common/GlobalSearchModal';

/**
 * Site header — wide, flush to the top edge (not floating).
 *
 * 1. Constant height (80 px desktop, 64 px mobile). Once content scrolls
 *    underneath, only the glass tint deepens (opacity on ::after).
 * 2. Sliding hover pill: a glass highlight springs between menu items under
 *    the pointer; the current page keeps a light-gold pill.
 * 3. Three capsules: brand · menu capsule · actions capsule.
 * 4. Morphing mega-menu: one glass panel springs its width, height and x
 *    to the hovered menu while the content cross-slides; About and Media
 *    list their pages beside a photo that swaps to the hovered page;
 *    Verticals and Projects show photo cards.
 *
 * Glass correctness: a backdrop-filter only blurs the page if no ancestor is
 * fading (opacity < 1), filtered, or itself a backdrop-filter. So the band,
 * the mega-menu and the drawer are siblings, and each animates its OWN
 * opacity/transform. (A fading wrapper made the menus look transparent until
 * the fade finished, then snap to blur.)
 *
 * Full menu from 1280 px (upstream measured it at ~1180 px); below that a
 * menu button opens a drawer. Publishes --nav-offset for sticky in-page bars.
 */

// The admin only exists on the local CUBE computer; the public (read-only)
// build hides its link (see next.config.mjs).
const SHOW_ADMIN = process.env.NEXT_PUBLIC_READ_ONLY_SITE !== '1';

const BAR_H = { desktop: 85, mobile: 68 }; // fallbacks only; real height is measured

const MENU = navigationItems.filter((i) => i.title !== 'Home');
const DRAWER = [...navigationItems, { title: 'Contact Us', href: '/contact' }];

type Item = (typeof DRAWER)[number] & { children?: { title: string; href: string; description?: string }[]; badge?: string };

// Preview photo for each page in the About and Media menus (CUBE's own photos;
// no captions beyond the page name). Hovering a page swaps the photo.
const MEGA_PREVIEW: Record<string, string> = {
  '/about': '/images/about/about_about.jpg',
  '/about/vision-mission': '/images/life-at-cube/about_life.jpg',
  '/about/objectives': '/images/life-at-cube/about_life2.jpg',
  '/about/core-values': '/images/hero/slides_building-training-team.jpg',
  '/about/chairman-message': '/images/leadership/kamakoti_iitm.jpg',
  '/about/ceo-message': '/images/leadership/ceo_padmanaban.jpg',
  '/about/board-members': '/images/media/news/original/newsnew4.jpg',
  '/about/advisory-panel': '/images/life-at-cube/about_life1.jpg',
  '/about/team': '/images/hero/slides_building-training-team.jpg',
  '/about/clients': '/images/media/news/original/newsnew2.jpg',
  '/media/news': '/images/media/news/original/newsnew.jpg',
  '/media/gallery': '/images/hero/slides_iit-tirupathi.jpg',
  '/media/events': '/images/media/news/original/newsnew3.jpg',
  '/media/publications': '/images/media/news/images_newsnew2.jpg',
  '/life-at-cube': '/images/life-at-cube/about_life2.jpg',
};

// Width of the morphing panel for each menu (content is laid out at this width).
const MEGA_W: Record<string, number> = { About: 860, Projects: 1060, Verticals: 1060, CEL: 880, Media: 700 };
const MORPH_SPRING = { type: 'spring' as const, stiffness: 520, damping: 44, mass: 0.9 };

function isItemActive(pathname: string, item: Item) {
  if (item.href === '/') return pathname === '/';
  return (
    pathname === item.href ||
    pathname.startsWith(item.href + '/') ||
    Boolean(item.children?.some((c) => c.href.split('#')[0] === pathname))
  );
}

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.8 };
const PANEL_SPRING = { type: 'spring' as const, stiffness: 380, damping: 30, mass: 0.8 };

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mega, setMega] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  // Optimistic highlight: the gold pill moves to a clicked item at once,
  // before the new page has rendered.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Menu photos are fetched ahead of time so a panel never opens with blank
  // cards. Desktop with a mouse only (phones have no mega-menu) and never with
  // data saver. Level 1 (page idle): the 7 Projects/Verticals cards.
  // Level 2 (pointer reaches the menu): also the About/Media previews.
  const [warm, setWarm] = useState(0);
  const canWarm = useRef(false);
  useEffect(() => {
    const conn = (navigator as any).connection;
    canWarm.current =
      window.matchMedia('(min-width: 1280px) and (hover: hover) and (pointer: fine)').matches &&
      !conn?.saveData &&
      !/(^|-)2g$/.test(conn?.effectiveType || '');
    if (!canWarm.current) return;
    const w = window as any;
    const go = () => setWarm((v) => Math.max(v, 1));
    const id = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 4000 }) : window.setTimeout(go, 2500);
    return () => (w.cancelIdleCallback ? w.cancelIdleCallback(id) : clearTimeout(id));
  }, []);
  const warmAll = useCallback(() => {
    if (canWarm.current) setWarm(2);
  }, []);

  const featuredProjects = useMemo(
    () => (projects as any[]).filter((p) => p.featured && p.heroImage).slice(0, 3),
    []
  );

  // Scrolled state: only deepens the glass tint (rAF-throttled, passive)
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

  // Offset for sticky in-page bars (constant: the bar never changes height)
  useEffect(() => {
    // Measure the real band height (rem-based, so it follows the root font size).
    const mq = window.matchMedia('(min-width: 1280px)');
    const apply = () => {
      const band = document.querySelector('.topbar-glass');
      const h = band ? band.getBoundingClientRect().height : mq.matches ? BAR_H.desktop : BAR_H.mobile;
      document.documentElement.style.setProperty('--nav-offset', `${Math.round(h) + 8}px`);
    };
    apply();
    mq.addEventListener('change', apply);
    window.addEventListener('resize', apply, { passive: true });
    return () => {
      mq.removeEventListener('change', apply);
      window.removeEventListener('resize', apply);
    };
  }, []);

  // Ctrl/⌘K search
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === 'Escape') {
        megaRef.current = null;
        setMega(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Reset menus on navigation
  useEffect(() => {
    setDrawerOpen(false);
    setExpanded(null);
    megaRef.current = null;
    setMega(null);
    setHovered(null);
    setPendingHref(null);
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

  // Mega-menu hover intent: grace period so moving into the panel doesn't close it
  // The panel morphs: it springs to the width of the new menu and slides under
  // the hovered item; content slides in from the side the pointer came from.
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pos, setPos] = useState<{ left: number; w: number; dir: number } | null>(null);
  const megaRef = useRef<string | null>(null);
  const openMega = useCallback((title: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const prev = megaRef.current;
    megaRef.current = title;
    setMega(title);
    if (!title || title === prev) return;
    const el = itemRefs.current[title];
    const w = MEGA_W[title] ?? 900;
    if (el) {
      const r = el.getBoundingClientRect();
      const left = Math.min(Math.max(r.left + r.width / 2 - w / 2, 24), window.innerWidth - w - 24);
      const order = MENU.map((i) => i.title);
      const dir = prev ? Math.sign(order.indexOf(title) - order.indexOf(prev)) || 1 : 0;
      setPos({ left, w, dir });
    }
  }, []);
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      megaRef.current = null;
      setMega(null);
    }, 220);
  }, []);

  const hasMega = (title: string) => title === 'Verticals' || title === 'Projects' || title === 'CEL' || Boolean((MENU as Item[]).find((i) => i.title === title)?.children?.length);
  const megaItem = (MENU as Item[]).find((i) => i.title === mega);

  return (
    <>
      {/* drawer backdrop */}
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
            className="fixed inset-0 z-40 bg-[#243239]/20 xl:hidden"
          />
        )}
      </AnimatePresence>

      <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
        {/* glass band (its own layer; tint deepens once scrolled) */}
        <div
          aria-hidden
          className={`topbar-glass absolute inset-x-0 top-0 h-16 xl:h-20 ${scrolled ? 'is-scrolled' : ''}`}
        />

        {/* content row */}
        <div
          className="relative h-16 xl:h-20 mx-auto max-w-[1600px] px-4 sm:px-6 xl:px-8 flex items-center justify-between gap-4"
        >
          {/* Brand */}
          <Link href="/" className="press group pointer-events-auto flex items-center gap-3.5 shrink-0" aria-label="CUBE home">
            <span
              className="relative h-12 xl:h-[58px] w-[116px] xl:w-[142px] shrink-0"
            >
              <Image
                src="/images/branding/cube-live-logo.png"
                alt=""
                fill
                priority
                sizes="142px"
                className="object-contain object-left drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]"
              />
            </span>
            <span
              aria-hidden
              className="hidden sm:block xl:hidden min-[1440px]:block h-9 w-px bg-white/15"
            />
            <span
              className="hidden sm:flex xl:hidden min-[1440px]:flex flex-col leading-none"
            >
              <span className="font-display text-[19px] font-extrabold tracking-[0.08em] text-[#F3F5F6]">CUBE</span>
              <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-[#A7B2B8] mt-1">
                Centre of Excellence
              </span>
            </span>
          </Link>

          {/* 2 + 3 · menu capsule with sliding hover pill */}
          <nav
            aria-label="Primary"
            className="capsule hidden xl:flex pointer-events-auto items-center p-1 rounded-full"
            onMouseEnter={warmAll}
            onMouseLeave={() => {
              setHovered(null);
              scheduleClose();
            }}
          >
            {MENU.map((raw) => {
              const item = raw as Item;
              const mm = hasMega(item.title);
              const active = isItemActive(pendingHref ?? pathname, item);
              const open = mega === item.title;
              const showHover = hovered === item.title && !active;
              return (
                <Link
                  key={item.title}
                  ref={(el) => {
                    itemRefs.current[item.title] = el;
                  }}
                  href={item.href}
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) setPendingHref(item.href);
                  }}
                  aria-current={active ? 'page' : undefined}
                  aria-haspopup={mm || undefined}
                  aria-expanded={mm ? open : undefined}
                  onMouseEnter={() => {
                    setHovered(item.title);
                    // passing over an item without a menu keeps the panel for a
                    // moment, so gliding across it morphs instead of closing
                    if (mm) openMega(item.title);
                    else scheduleClose();
                  }}
                  onFocus={() => {
                    setHovered(item.title);
                    openMega(mm ? item.title : null);
                  }}
                  className={`press relative flex items-center gap-1.5 h-11 px-4 2xl:px-5 rounded-full text-[15.5px] whitespace-nowrap transition-colors duration-300 ${
                    active ? 'text-[#0B0D0E] font-bold' : 'text-[#C2CCD1] font-semibold hover:text-[#F3F5F6]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full pill-yellow"
                    />
                  )}
                  {showHover && (
                    <motion.span
                      layoutId="nav-hover"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                    />
                  )}
                  <span className="relative">{item.title}</span>
                  {item.badge && (
                    <span title={item.badge} aria-label={item.badge} className={`relative w-1.5 h-1.5 rounded-full ${active ? 'bg-[#0B0D0E]' : 'bg-[#F6C22E] shadow-[0_0_8px_#F6C22E]'}`} />
                  )}
                  {mm && (
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className={`relative transition-transform duration-300 ${active ? 'text-[#0B0D0E]/70' : open ? 'text-[#F6C22E]' : 'text-[#8E9AA0]'} ${open ? 'rotate-180' : ''}`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3 · actions capsule */}
          <div className="capsule pointer-events-auto flex items-center gap-1 p-1 rounded-full shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              title={`Search (${isMac ? '⌘K' : 'Ctrl+K'})`}
              className="press jiggle h-10 w-10 2xl:w-auto 2xl:px-3.5 rounded-full grid 2xl:flex place-items-center items-center gap-2 text-[#C2CCD1] hover:text-[#F3F5F6] hover:bg-white/[0.08] transition-colors"
            >
              <Search size={18} strokeWidth={2} />
              <kbd className="hidden 2xl:inline font-sans text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 text-[#A7B2B8] border border-white/10">
                {isMac ? '⌘K' : 'Ctrl K'}
              </kbd>
            </button>
            {SHOW_ADMIN && (
              <Link
                href="/admin/login"
                prefetch={false}
                aria-label="Admin sign in"
                title="Admin"
                className="press jiggle hidden xl:grid h-10 w-10 rounded-full place-items-center text-[#A7B2B8] hover:text-[#F3F5F6] hover:bg-white/[0.08] transition-colors"
              >
                <User size={18} strokeWidth={2} />
              </Link>
            )}
            <Link
              href="/contact"
              className="hidden sm:inline-flex btn-gold gold-shimmer items-center gap-1.5 h-10 px-5 rounded-full text-[15px] font-extrabold"
            >
              Get in touch <ArrowUpRight size={14} strokeWidth={2.25} />
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen((o) => !o)}
              className="press xl:hidden h-10 w-10 rounded-full grid place-items-center text-[#F3F5F6] hover:bg-white/[0.08]"
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              aria-controls="site-drawer"
            >
              {drawerOpen ? <X size={19} strokeWidth={2} /> : <Menu size={19} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* 4 · morphing mega-menu: one glass panel (sibling of the band, so its
               blur is live from frame 1) that springs its width, height and x
               between menus; the content cross-slides inside it. */}
        <div className="hidden xl:block absolute inset-x-0 top-full h-0">
          <AnimatePresence>
            {megaItem && pos && (
              <MorphPanel
                key="mega"
                title={megaItem.title}
                left={pos.left}
                width={pos.w}
                dir={pos.dir}
                onEnter={() => openMega(megaItem.title)}
                onLeave={() => {
                  setHovered(null);
                  scheduleClose();
                }}
              >
                <MegaContent item={megaItem} featured={featuredProjects} />
              </MorphPanel>
            )}
          </AnimatePresence>
        </div>

        {/* off-screen warm-up: same src/sizes/quality as the menus, so the
            browser caches exactly the files the panels will ask for */}
        {warm > 0 && (
          <div aria-hidden className="hidden xl:block fixed left-[-9999px] top-0 w-px h-px overflow-hidden pointer-events-none">
            {[...verticals.map((v) => v.heroImage), ...featuredProjects.map((p) => p.heroImage)].map((src) => (
              <span key={`w-${src}`} className="relative block w-px h-px">
                <Image src={src} alt="" fill quality={85} sizes="440px" loading="eager" />
              </span>
            ))}
            {warm > 1 && (
              <span className="relative block w-px h-px">
                <Image src="/images/cel/about_cel.jpg" alt="" fill quality={90} sizes="1200px" loading="eager" />
              </span>
            )}
            {warm > 1 && Array.from(new Set(Object.values(MEGA_PREVIEW))).map((src) => (
              <span key={`p-${src}`} className="relative block w-px h-px">
                <Image src={src} alt="" fill quality={85} sizes="400px" loading="eager" />
              </span>
            ))}
          </div>
        )}

        {/* Drawer (below xl): the motion element IS the glass */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              ref={drawerRef}
              id="site-drawer"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.16 } }}
              transition={PANEL_SPRING}
              className="xl:hidden liquid-glass is-menu pointer-events-auto origin-top absolute inset-x-3 top-[calc(100%+8px)] mx-auto max-w-md rounded-[26px] p-2.5 max-h-[calc(100dvh-88px)] overflow-y-auto overscroll-contain outline-none"
            >
              <nav aria-label="Mobile" className="space-y-0.5">
                {DRAWER.map((raw, i) => {
                  const item = raw as Item;
                  const hasChildren = Boolean(item.children?.length);
                  const isExpanded = expanded === item.title;
                  const active = isItemActive(pathname, item);
                  const panelId = `drawer-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                  const row = `press flex w-full items-center justify-between gap-3 px-4 py-3.5 rounded-2xl text-[17px] font-bold transition-colors ${
                    active ? 'pill-yellow text-[#0B0D0E]' : isExpanded ? 'text-[#F3F5F6] bg-white/[0.08]' : 'text-[#D6DDE0] active:bg-white/[0.08]'
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
                          <ChevronDown size={16} strokeWidth={1.75} className={`transition-transform duration-300 ${active ? 'text-[#0B0D0E]/70' : isExpanded ? 'text-[#F6C22E]' : 'text-[#8E9AA0]'} ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      ) : (
                        <Link href={item.href} className={row} onClick={() => setDrawerOpen(false)}>
                          {item.title}
                          {item.badge && <span className="font-sans text-[10px] uppercase tracking-wider text-[#F6C22E]">{item.badge}</span>}
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
                            <div className="ml-3.5 pl-3 my-1 border-l border-white/15 space-y-0.5">
                              {item.children!.map((sub) => (
                                <Link
                                  key={sub.title}
                                  href={sub.href}
                                  onClick={() => setDrawerOpen(false)}
                                  className="press block px-3 py-2.5 rounded-xl text-[15.5px] font-semibold text-[#C2CCD1] hover:text-[#F3F5F6] hover:bg-[#33454E]/[0.05] transition-colors"
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
              <div className={`grid gap-2 ${SHOW_ADMIN ? 'grid-cols-[1fr_auto]' : 'grid-cols-1'}`}>
                <Link
                  href="/contact"
                  onClick={() => setDrawerOpen(false)}
                  className="btn-gold gold-shimmer h-12 rounded-2xl inline-flex items-center justify-center gap-1.5 text-[16px] font-extrabold"
                >
                  Get in touch <ArrowUpRight size={15} />
                </Link>
                {SHOW_ADMIN && (
                  <Link
                    href="/admin/login"
                    prefetch={false}
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Admin sign in"
                    className="h-12 w-12 rounded-2xl grid place-items-center text-[#A7B2B8] bg-white/[0.06] border border-white/10"
                  >
                    <User size={18} strokeWidth={2} />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

/* ───────────────────────── mega-menu content ───────────────────────── */

function MorphPanel({
  title,
  left,
  width,
  dir,
  onEnter,
  onLeave,
  children,
}: {
  title: string;
  left: number;
  width: number;
  dir: number;
  onEnter: () => void;
  onLeave: () => void;
  children: React.ReactNode;
}) {
  // Height follows the content currently in flow (the outgoing content is
  // popped out of layout), measured before paint by ResizeObserver.
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98, x: left, width, height }}
      animate={{ opacity: 1, y: 0, scale: 1, x: left, width, height }}
      exit={{ opacity: 0, y: -6, scale: 0.99, transition: { duration: 0.16 } }}
      transition={{ default: MORPH_SPRING, opacity: { duration: 0.18 } }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="liquid-glass is-menu pointer-events-auto absolute left-0 top-0 mt-2 rounded-[28px] overflow-hidden origin-top"
    >
      <div ref={innerRef} className="relative p-3" style={{ width }}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={title}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 36, filter: 'blur(4px)' }),
              center: { opacity: 1, x: 0, filter: 'blur(0px)' },
              exit: (d: number) => ({ opacity: 0, x: d * -36, filter: 'blur(4px)' }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/** Page list beside a photo that swaps to the hovered page (About, Media). */
function ListPreview({ item }: { item: Item }) {
  const pages = item.children ?? [];
  const [i, setI] = useState(0);
  const current = pages[i] ?? pages[0];
  const twoCol = pages.length > 6;
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: twoCol ? '1fr 340px' : '1fr 380px' }}>
      <ul className={`grid gap-0.5 content-start p-1.5 ${twoCol ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {pages.map((sub, k) => {
          const on = k === i;
          return (
            <li key={sub.href}>
              <Link
                href={sub.href}
                onMouseEnter={() => setI(k)}
                onFocus={() => setI(k)}
                className={`press relative flex items-center justify-between gap-3 px-4 h-12 rounded-2xl text-[15.5px] transition-colors duration-200 ${
                  on ? 'text-[#F3F5F6] font-bold' : 'text-[#C2CCD1] font-semibold'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId={`mega-pill-${item.title}`}
                    transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.7 }}
                    className="absolute inset-0 rounded-2xl bg-white/[0.08] border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  />
                )}
                <span className="relative">{sub.title}</span>
                <ArrowUpRight
                  size={15}
                  strokeWidth={2.25}
                  className={`relative text-[#F6C22E] transition-[opacity,transform] duration-300 ${on ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}`}
                />
              </Link>
            </li>
          );
        })}
      </ul>

      <Link href={current?.href ?? item.href} className="press group relative overflow-hidden rounded-[20px] min-h-[250px] bg-[#1A1F22]" tabIndex={-1} aria-hidden>
        <AnimatePresence initial={false}>
          <motion.span
            key={current?.href}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={MEGA_PREVIEW[current?.href ?? ''] ?? '/images/about/about_about.jpg'}
              alt=""
              fill
              quality={85}
              sizes="400px"
              loading="eager"
              className="object-cover object-[50%_22%]"
            />
          </motion.span>
        </AnimatePresence>
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/75 via-[#1B262C]/10 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3 text-white">
          {/* keyed fade-in only: an exit-then-enter sequence can lag on fast hovers */}
          <motion.span
            key={current?.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[19px] font-bold leading-snug"
          >
            {current?.title}
          </motion.span>
          <span className="grid place-items-center w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm shrink-0 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight size={16} strokeWidth={2.25} />
          </span>
        </span>
      </Link>
    </div>
  );
}

/** CEL: lab photo beside the description from cubeiitm.org and its links. */
function CelPanel() {
  const links = [
    { href: '/cel', label: 'About the laboratory' },
    { href: '/cel#domains', label: 'Testing domains' },
    { href: '/cel#enquiry', label: 'Testing enquiry' },
  ];
  return (
    <div className="grid grid-cols-[340px_1fr] gap-3">
      <Link href="/cel" className="press group relative overflow-hidden rounded-[20px] min-h-[280px] bg-[#1A1F22]">
        <Image
          src="/images/cel/about_cel.jpg"
          alt=""
          fill
          quality={90}
          // a 1920x450 strip cropped into a tall card: request the width the
          // crop needs (card height x photo aspect), not the card width
          sizes="1200px"
          loading="eager"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/75 via-[#1B262C]/10 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 p-4 text-white">
          <span className="block font-display text-[19px] font-bold leading-snug">CUBE Environmental Laboratory</span>
          <span className="mt-0.5 block text-[14.5px] text-white/85">IIT Madras Research Park, Chennai</span>
        </span>
      </Link>
      <div className="p-3 pl-4 flex flex-col">
        <p className="text-[16.5px] leading-relaxed text-[#DDE3E6]">{celOverview.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {celOverview.testingServices.map((t) => (
            <Link
              key={t.id}
              href="/cel#domains"
              className="press rounded-full bg-white/[0.08] border border-white/10 px-3.5 py-1.5 text-[14.5px] font-bold text-[#F3F5F6] hover:bg-[#F6C22E]/15 transition-colors"
            >
              {t.title}
            </Link>
          ))}
        </div>
        <div className="mt-auto pt-4 grid grid-cols-2 gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="press group flex items-center justify-between gap-3 px-4 h-11 rounded-2xl text-[15.5px] font-semibold text-[#C2CCD1] hover:text-[#F3F5F6] hover:bg-white/[0.07] transition-colors"
            >
              {l.label}
              <ArrowUpRight size={15} strokeWidth={2.25} className="text-[#F6C22E] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-300" />
            </Link>
          ))}
          <a
            href={celOverview.website}
            target="_blank"
            rel="noopener noreferrer"
            className="press group flex items-center justify-between gap-3 px-4 h-11 rounded-2xl text-[15.5px] font-semibold text-[#C2CCD1] hover:text-[#F3F5F6] hover:bg-white/[0.07] transition-colors"
          >
            CEL website
            <ArrowUpRight size={15} strokeWidth={2.25} className="text-[#F6C22E]" />
          </a>
        </div>
      </div>
    </div>
  );
}

function MegaContent({ item, featured }: { item: Item; featured: any[] }) {
  if (item.title === 'CEL') return <CelPanel />;

  if (item.title === 'Verticals') {
    return (
      <div className="grid grid-cols-4 gap-3">
        {verticals.map((v) => (
          <PhotoCard key={v.slug} href={`/verticals/${v.slug}`} image={v.heroImage} title={v.title} text={v.tagline} />
        ))}
      </div>
    );
  }

  if (item.title === 'Projects') {
    return (
      <div className="grid grid-cols-4 gap-3">
        {featured.map((p) => (
          <PhotoCard key={p.slug} href={`/projects/${p.slug}`} image={p.heroImage} title={p.title} text={p.category} />
        ))}
        <Link
          href="/projects"
          className="press group rounded-[20px] bg-white/[0.05] border border-white/10 p-5 flex flex-col justify-between hover:bg-white/[0.09] transition-colors"
        >
          <span className="label-mono">Portfolio</span>
          <span>
            <span className="block font-display text-[22px] font-extrabold text-[#F3F5F6] leading-tight">All projects</span>
            <span className="mt-1 block text-[15.5px] text-[#A7B2B8]">Search and filter the full record.</span>
          </span>
          <ArrowUpRight size={20} className="text-[#F6C22E] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    );
  }

  return <ListPreview item={item} />;
}

function PhotoCard({ href, image, title, text, tall = false }: { href: string; image: string; title: string; text?: string; tall?: boolean }) {
  return (
    <Link href={href} className={`press group relative overflow-hidden rounded-[20px] ${tall ? 'min-h-[260px]' : 'h-[230px]'} bg-[#1A1F22]`}>
      {/* object-cover crops to the card: request enough pixels for the cropped
          width (card height x photo aspect) on sharp screens, not the card width */}
      <Image
        src={image}
        alt=""
        fill
        quality={85}
        sizes={tall ? '600px' : '440px'}
        loading="eager"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/80 via-[#1B262C]/20 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-white">
        <span className="font-display text-[18px] font-bold leading-snug line-clamp-2">{title}</span>
        {text && <span className="mt-1 text-[14.5px] text-white/85 leading-snug line-clamp-2">{text}</span>}
      </span>
      <ArrowUpRight size={18} className="absolute top-3 right-3 text-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300" />
    </Link>
  );
}
