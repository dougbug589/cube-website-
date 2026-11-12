'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight, Building, Leaf, Cpu, Compass, FileText, FlaskConical, LayoutGrid } from 'lucide-react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className={`flex items-center px-5 py-4 ${query.trim() ? 'border-b border-slate-200' : ''}`}>
          <Search className="w-5 h-5 text-[#9A7015] mr-3 flex-shrink-0" />
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              autoFocus
              value={query}
              aria-label="Search the site"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // Tab fills in the suggestion being typed
                if (e.key === 'Tab' && !query && currentSuggestion) {
                  e.preventDefault();
                  setQuery(currentSuggestion);
                }
              }}
              className="w-full bg-transparent text-[#243239] focus:outline-none text-[17px] font-medium"
            />
            {!query && (
              <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center text-[17px] text-[#7A888E] whitespace-nowrap overflow-hidden">
                Search for&nbsp;<span className="text-[#46565E] font-semibold">{reducedMotion ? 'pages, projects, news…' : typed}</span>
                {!reducedMotion && <span className="ml-0.5 inline-block w-[2px] h-[1.1em] rounded-full bg-[#C4921B] animate-caret" />}
              </span>
            )}
          </div>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-medium text-slate-500 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results (only once something is typed) */}
        {query.trim() && (
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {query.trim() && searchResults.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <p className="text-base font-medium">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">Try refining your search terms or browsing through the navigation menu.</p>
            </div>
          )}

          {searchResults.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={onClose}
                className="group flex items-start p-3 rounded-xl hover:bg-slate-100/90 transition border border-transparent hover:border-slate-200"
              >
                <div className="p-2 rounded-lg bg-[#F7EDD3] group-hover:bg-[#F6DA86] text-[#9A7015] group-hover:text-[#243239] transition mr-3.5 flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-[#9A7015] transition truncate">
                      {item.title}
                    </h4>
                    <span className="text-[13.5px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ml-2 flex-shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#9A7015] transition ml-2 self-center flex-shrink-0 opacity-0 group-hover:opacity-100" />
              </Link>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

