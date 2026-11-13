'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, X, ArrowUpRight, Building, Leaf, Cpu, Compass, FileText, FlaskConical, LayoutGrid, CornerDownLeft } from 'lucide-react';
import { navigationItems } from '@/data/navigation';
import { projects as fallbackProjects } from '@/data/projects';
import { verticals } from '@/data/verticals';
import { celOverview } from '@/data/cel';
import { newsItems as fallbackNews } from '@/data/news';

const txt = (v: unknown) => (typeof v === 'string' ? v : '').toLowerCase();

// Site pages (menu items and their sub-pages) are searchable too.
const PAGES = (() => {
  const seen = new Set<string>();
  const out: { title: string; href: string; parent?: string }[] = [];
  const add = (title: string, href: string, parent?: string) => {
    if (seen.has(href + title)) return;
    seen.add(href + title);
    out.push({ title, href, parent });
  };
  navigationItems.forEach((item) => {
    add(item.title === 'CEL' ? 'CEL Laboratory' : item.title, item.href);
    item.children?.forEach((c) => add(c.title, c.href, item.title));
  });
  add('Contact Us', '/contact');
  return out;
})();

type Result = { title: string; category: string; description: string; href: string; icon: any };

/** First few words, for short typewriter suggestions. */
const shortPhrase = (s: string, words = 4) => s.split(/\s+/).slice(0, words).join(' ').replace(/[,:;.\-–]+$/, '');

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<any[]>(fallbackProjects);
  const [newsItems, setNewsItems] = useState<any[]>(fallbackNews);
  const [celServices, setCelServices] = useState<any[]>(celOverview.testingServices);

  // Load live CMS data only when the search opens (no cost on normal page loads).
  useEffect(() => {
    if (!isOpen) return;
    const get = (url: string, set: (v: any[]) => void) =>
      fetch(url, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => Array.isArray(d) && set(d))
        .catch(() => {});
    get('/api/public/projects', setProjects);
    get('/api/public/news', setNewsItems);
    get('/api/public/cel', setCelServices);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/⌘ K (open and close) is handled by the Navbar.
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  // Restore the previous value on close instead of forcing 'auto', which
  // undid other scroll locks (mobile menu, gallery viewer).
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const runSearch = useCallback((raw: string): Result[] => {
    const q = raw.toLowerCase().trim();
    if (!q) return [];

    const results: Result[] = [];

    // Search Pages
    PAGES.forEach((pg) => {
      if (txt(pg.title).includes(q) || txt(pg.parent).includes(q)) {
        results.push({ title: pg.title, category: 'Page', description: pg.parent ? `${pg.parent} · ${pg.title}` : '', href: pg.href, icon: LayoutGrid });
      }
    });

    // Search Verticals
    verticals.forEach((v) => {
      if (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.capabilities.some(c => c.toLowerCase().includes(q))) {
        results.push({
          title: v.title,
          category: 'Vertical',
          description: v.description,
          href: `/verticals/${v.slug}`,
          icon: v.id === 'building-construction' ? Building : v.id === 'environment-sustainability' ? Leaf : v.id === 'smart-cities' ? Cpu : Compass
        });
      }
    });

    // Search Projects
    projects.forEach((p) => {
      if (txt(p.title).includes(q) || txt(p.description).includes(q) || txt(p.category).includes(q) || txt(p.client).includes(q) || txt(p.location).includes(q)) {
        results.push({
          title: p.title,
          category: 'Project',
          description: [p.client, p.location].filter(Boolean).join(' · ') || p.category,
          href: `/projects/${p.slug}`,
          icon: Building
        });
      }
    });

    // Search CEL
    celServices.forEach((s) => {
      if (txt(s.title).includes(q) || txt(s.description).includes(q) || (s.parameters || []).some((param: string) => txt(param).includes(q))) {
        results.push({
          title: s.title,
          category: 'CEL Laboratory Service',
          description: s.description,
          href: '/cel',
          icon: FlaskConical
        });
      }
    });

    // Search News
    newsItems.forEach((n) => {
      if (txt(n.title).includes(q) || txt(n.summary || n.excerpt).includes(q)) {
        results.push({
          title: n.title,
          category: 'Media & News',
          description: n.summary || n.excerpt || '',
          href: `/media/news/${n.slug || n.id}`,
          icon: FileText
        });
      }
    });

    return results.slice(0, 10);
  }, [projects, newsItems, celServices]);

  const searchResults = useMemo(() => runSearch(query), [runSearch, query]);

  // Typewriter suggestions: real things on the site, each verified to return results.
  const suggestions = useMemo(() => {
    const pages = ['About CUBE', 'Board Members', 'IIT Advisory Panel', 'Our Team', 'Tenders', 'Careers', 'CEL Laboratory', 'Vision & Mission'];
    const verts = verticals.map((v) => v.title);
    const clients = Array.from(new Set(projects.filter((p) => p.featured && p.client && p.client.length <= 24).map((p) => p.client)));
    const news = newsItems.map((n) => shortPhrase(String(n.title || ''))).filter((t) => t.length > 6);
    const cel = celServices.map((c) => shortPhrase(String(c.title || ''), 3)).filter(Boolean);
    const pools = [pages, verts, clients, news, cel];
    const mixed: string[] = [];
    for (let i = 0; mixed.length < 24 && i < 12; i++) pools.forEach((pool) => pool[i] && mixed.push(pool[i]));
    return Array.from(new Set(mixed)).filter((t) => runSearch(t).length > 0);
  }, [projects, newsItems, celServices, runSearch]);

  // Type → hold → backspace → next. Runs only while the box is open and empty.
  const [typed, setTyped] = useState('');
  const [sIdx, setSIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);
  useEffect(() => {
    if (!isOpen || query || reducedMotion || suggestions.length === 0) return;
    const target = suggestions[sIdx % suggestions.length];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && typed.length < target.length) t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 55 + Math.random() * 30);
    else if (!deleting) t = setTimeout(() => setDeleting(true), 1400);
    else if (typed.length > 0) t = setTimeout(() => setTyped(typed.slice(0, -1)), 24);
    else t = setTimeout(() => { setDeleting(false); setSIdx((i) => (i + 1) % suggestions.length); }, 220);
    return () => clearTimeout(t);
  }, [isOpen, query, reducedMotion, suggestions, sIdx, typed, deleting]);
  const currentSuggestion = suggestions.length ? suggestions[sIdx % suggestions.length] : '';

  // Keyboard selection (↑ ↓ Enter); the pointer moves it too.
  const router = useRouter();
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [query]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);
  // Close first and navigate on the next frame, so the close and the route
  // transition never land in the same render.
  const open = (href: string) => {
    onClose();
    requestAnimationFrame(() => router.push(href));
  };

  // Always mounted, hidden when closed: clicks pass through the moment it
  // closes, and it is fully hidden once the fade has finished. (Unmounting via
  // AnimatePresence left an invisible full-screen layer behind when a page
  // change landed during the exit animation.)
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      return;
    }
    const t = setTimeout(() => setVisible(false), 260);
    return () => clearTimeout(t);
  }, [isOpen]);
  const inputRef = useRef<HTMLInputElement>(null);
  // Focus once the panel is actually visible (a hidden input cannot take focus).
  useEffect(() => {
    if (isOpen && visible) inputRef.current?.focus();
  }, [isOpen, visible]);
  const layer = `${isOpen ? '' : 'pointer-events-none'} ${visible ? '' : 'invisible'}`;
  const hasQuery = query.trim().length > 0;
  const chips = suggestions.slice(0, 6);

  return (
    <>
      {/* Three independent layers (backdrop, glow, panel), each animating
          itself: no shared wrapper, so (1) every backdrop-filter stays live
          while fading and (2) nothing is left behind if a page change lands
          mid-animation (a wrapper could stay mounted, invisible, over the page). */}
        <motion.div
          key="search-backdrop"
          aria-hidden
          className={`fixed inset-0 z-[80] bg-[#1B262C]/30 backdrop-blur-xl backdrop-saturate-150 ${layer}`}
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: isOpen ? 0.22 : 0.18 }}
          onClick={onClose}
        />
        <motion.div
          key="search-glow"
          aria-hidden
          className={`fixed z-[80] left-1/2 top-[calc(16vh-70px)] sm:top-[calc(22vh-70px)] w-[min(1040px,calc(100vw-8px))] h-[420px] pointer-events-none ${visible ? '' : 'invisible'}`}
          initial={false}
          animate={{ x: '-50%', opacity: isOpen ? (hasQuery ? 1 : 0.8) : 0, scale: isOpen ? 1 : 0.9 }}
          transition={{ duration: isOpen ? 0.5 : 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {visible && <div className="search-glow w-full h-full rounded-[60px]" />}
        </motion.div>
            <motion.div
              key="search-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Search the site"
              aria-hidden={!isOpen}
              className={`liquid-glass is-solid fixed z-[81] left-1/2 top-[16vh] sm:top-[22vh] w-[min(880px,calc(100vw-32px))] rounded-[30px] overflow-hidden search-panel ${layer}`}
              initial={{ x: '-50%', opacity: 0, y: 24, scale: 0.96 }}
              animate={isOpen ? { x: '-50%', opacity: 1, y: 0, scale: 1 } : { x: '-50%', opacity: 0, y: 12, scale: 0.98 }}
              transition={isOpen ? { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 } : { duration: 0.16 }}
            >
              {/* input row */}
              <div className="relative flex items-center gap-4 px-6 sm:px-7 h-[76px]">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-b from-[#D89F03]/35 to-[#D89F03]/20 text-[#F3F5F6] depth-1 shrink-0">
                  <Search size={20} strokeWidth={2.25} />
                </span>
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    ref={inputRef}
                    tabIndex={isOpen ? 0 : -1}
                    value={query}
                    aria-label="Search the site"
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      // Tab fills in the suggestion being typed
                      if (e.key === 'Tab' && !query && currentSuggestion) {
                        e.preventDefault();
                        setQuery(currentSuggestion);
                      } else if (e.key === 'ArrowDown' && searchResults.length) {
                        e.preventDefault();
                        setActive((i) => (i + 1) % searchResults.length);
                      } else if (e.key === 'ArrowUp' && searchResults.length) {
                        e.preventDefault();
                        setActive((i) => (i - 1 + searchResults.length) % searchResults.length);
                      } else if (e.key === 'Enter' && searchResults[active]) {
                        e.preventDefault();
                        open(searchResults[active].href);
                      }
                    }}
                    className="w-full bg-transparent text-[#F3F5F6] focus:outline-none text-[20px] sm:text-[22px] font-semibold"
                  />
                  {!query && (
                    <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center text-[20px] sm:text-[22px] text-[#8E9AA0] whitespace-nowrap overflow-hidden">
                      Search for&nbsp;<span className="text-[#C2CCD1] font-semibold">{reducedMotion ? 'pages, projects, news…' : typed}</span>
                      {!reducedMotion && <span className="ml-0.5 inline-block w-[2px] h-[1.1em] rounded-full bg-[#D89F03] animate-caret" />}
                    </span>
                  )}
                </div>
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="press grid place-items-center w-9 h-9 rounded-full text-[#A7B2B8] hover:text-[#F3F5F6] hover:bg-white/[0.07] transition-colors"
                  >
                    <X size={17} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="press hidden sm:inline-flex h-9 px-3 items-center rounded-xl bg-white/[0.08] border border-white/10 text-[13.5px] font-bold text-[#A7B2B8] hover:text-[#F3F5F6] transition-colors"
                >
                  Esc
                </button>
              </div>

              {/* hairline that lights up gold while searching */}
              <div aria-hidden className="relative h-px mx-6 bg-white/10 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D89F03] to-transparent origin-center"
                  initial={false}
                  animate={{ scaleX: hasQuery ? 1 : 0, opacity: hasQuery ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {/* body: suggestions when empty, results when typing */}
              <div ref={listRef} className="max-h-[52vh] overflow-y-auto overscroll-contain p-3 sm:p-4">
                {!hasQuery ? (
                  <div className="px-2 py-2">
                    <p className="label-mono">Try</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chips.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setQuery(c)}
                          className="press h-10 px-4 rounded-full bg-white/[0.08] border border-white/10 text-[15px] font-bold text-[#C2CCD1] hover:text-[#F3F5F6] hover:bg-white/[0.06] hover:border-[#D89F03]/35 transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="font-display text-[19px] font-bold text-[#F3F5F6]">No results for &ldquo;{query}&rdquo;</p>
                    <p className="mt-1.5 text-[17px] text-[#C2CCD1]">Try another word, or browse from the menu.</p>
                  </div>
                ) : (
                  <ul className="space-y-1" role="listbox" aria-label="Results">
                    {searchResults.map((item, idx) => {
                      const Icon = item.icon;
                      const on = idx === active;
                      return (
                        <li key={item.href + idx} data-idx={idx} role="option" aria-selected={on}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            onMouseMove={() => active !== idx && setActive(idx)}
                            className="relative flex items-center gap-4 px-3.5 py-3 rounded-2xl"
                          >
                            {on && (
                              <motion.span
                                layoutId="search-highlight"
                                transition={{ type: 'spring', stiffness: 520, damping: 40, mass: 0.7 }}
                                className="absolute inset-0 rounded-2xl bg-white/[0.09] border border-white shadow-[0_8px_22px_-14px_rgba(36,50,57,0.5),inset_0_1px_0_#fff]"
                              />
                            )}
                            <span className={`relative grid place-items-center w-11 h-11 rounded-2xl shrink-0 transition-colors duration-300 ${on ? 'bg-gradient-to-b from-[#D89F03]/35 to-[#D89F03]/20 text-[#F3F5F6]' : 'bg-[#D89F03]/15 text-[#D89F03]'}`}>
                              <Icon size={19} strokeWidth={2} />
                            </span>
                            <span className="relative flex-1 min-w-0">
                              <span className="flex items-center gap-2">
                                <span className="font-display text-[16.5px] font-bold text-[#F3F5F6] truncate">{item.title}</span>
                                <span className="shrink-0 rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[13.5px] font-bold text-[#A7B2B8]">{item.category}</span>
                              </span>
                              {item.description && <span className="mt-0.5 block text-[16.5px] text-[#C2CCD1] truncate">{item.description}</span>}
                            </span>
                            <span className={`relative shrink-0 transition-[opacity,transform] duration-300 ${on ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'}`}>
                              {on ? <CornerDownLeft size={17} className="text-[#D89F03]" /> : <ArrowUpRight size={17} />}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* key hints */}
              <div className="hidden sm:flex items-center gap-5 px-6 py-3 border-t border-white/10 bg-white/[0.05] text-[13.5px] font-semibold text-[#A7B2B8]">
                {[['↑ ↓', 'move'], ['↵', 'open'], ['Tab', 'fill suggestion'], ['Esc', 'close']].map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-2">
                    <kbd className="font-sans min-w-7 h-7 px-2 grid place-items-center rounded-lg bg-white/[0.06] border border-white/12 text-[13.5px] font-bold text-[#F3F5F6] shadow-[0_1px_0_rgba(36,50,57,0.12)]">{k}</kbd>
                    {v}
                  </span>
                ))}
              </div>
            </motion.div>
    </>
  );
}
