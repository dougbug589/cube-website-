'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight, Building, Leaf, Cpu, Compass, FileText, FlaskConical } from 'lucide-react';
import { projects as fallbackProjects } from '@/data/projects';
import { verticals } from '@/data/verticals';
import { celOverview } from '@/data/cel';
import { newsItems as fallbackNews } from '@/data/news';

const txt = (v: unknown) => (typeof v === 'string' ? v : '').toLowerCase();

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

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const results: {
      title: string;
      category: string;
      description: string;
      href: string;
      icon: any;
    }[] = [];

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
      if (txt(p.title).includes(q) || txt(p.description).includes(q) || txt(p.category).includes(q)) {
        results.push({
          title: p.title,
          category: `Project (${p.category})`,
          description: p.description,
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
  }, [query, projects, newsItems, celServices]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-[#9A7015] mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, verticals, CEL services, news..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base"
          />
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

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {!query.trim() && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">
                Type keywords like <span className="font-semibold text-[#9A7015]">&quot;precast&quot;</span>, <span className="font-semibold text-[#9A7015]">&quot;water&quot;</span>, <span className="font-semibold text-[#9A7015]">&quot;TIDEL&quot;</span>, or <span className="font-semibold text-[#9A7015]">&quot;testing&quot;</span>.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Building & Construction', 'Environment', 'Smart Cities', 'Bus Terminals', 'CEL Lab'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 text-xs bg-slate-100 hover:bg-[#F7EDD3] hover:text-[#9A7015] text-slate-600 rounded-full transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

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
      </div>
    </div>
  );
}

