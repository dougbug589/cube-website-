'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLiveList } from '@/lib/live';
import { isHydrated } from '@/lib/hydration';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects as fallbackProjects } from '@/data/projects';

const SHORT_LABEL: Record<string, string> = {
  'Building & Construction': 'Buildings',
  'Environment & Sustainability': 'Environment',
  'Urban Planning & Transportation': 'Urban Planning',
};

/**
 * Reads ?category= and ?q= deep links. Only this tiny component waits for the
 * URL (useSearchParams), so the server still renders the full project grid;
 * wrapping the whole page in that Suspense boundary made it render in the
 * browser only (empty first paint, footer jumping down).
 */
function SearchParamsSync({ onChange }: { onChange: (category: string, q: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    if (category || q) onChange(category || 'All', q || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  return null;
}

function ProjectsPageInner() {
  // Live CMS data: updates instantly when an admin edits/archives a project.
  const projectList = useLiveList<any>('/api/public/projects', fallbackProjects);
  // `selectedCategory` drives the filter pill (moves at once on click);
  // `shownCategory` drives the grid (switches once the page is back at the top)
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [shownCategory, setShownCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // In-app navigation: mount the first 12 cards for a fast first frame, the
  // rest right after it paints. A full page load renders all of them (the
  // server HTML must match, and crawlers see every project).
  const [limit, setLimit] = useState<number>(() => (isHydrated() ? 12 : Infinity));
  // after a filter switch the rest waits until the grid's fade-in is done
  // (so the fade only animates the first 12 cards); on navigation it follows
  // the first paint
  const restDelay = useRef(0);
  useEffect(() => {
    if (limit === Infinity) return;
    if (restDelay.current > 0) {
      const t = setTimeout(() => setLimit(Infinity), restDelay.current);
      restDelay.current = 0;
      return () => clearTimeout(t);
    }
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setLimit(Infinity));
    });
    return () => cancelAnimationFrame(id);
  }, [limit]);

  const categories = [
    'All',
    'Building & Construction',
    'Environment & Sustainability',
    'Smart Cities',
    'Urban Planning & Transportation',
  ];

  const filteredProjects = useMemo(() => {
    return projectList.filter((p) => {
      // Exclude archived projects strictly
      if (p.status === 'archived') return false;

      const matchesCategory = shownCategory === 'All' || p.category === shownCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.scopeOfWork && p.scopeOfWork.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (p.client && String(p.client).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.location && String(p.location).toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [projectList, shownCategory, searchQuery]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: 0 };
    projectList.forEach((p: any) => {
      if (p.status === 'archived') return;
      c.All += 1;
      c[p.category] = (c[p.category] || 0) + 1;
    });
    return c;
  }, [projectList]);
  // Only verticals that actually have projects get a filter.
  const filters = categories.filter((c) => c === 'All' || counts[c]);

  // Picking a filter while scrolled down the grid: the pill moves at once,
  // the page glides back to the top of the results (rAF, ease-in-out; from
  // far down it first skips to ~1.2 screens above the target so the glide
  // stays short), and only then the grid cross-fades to the new vertical.
  // Scrolling by hand during the glide cancels it and switches at once.
  // Reduced motion: instant jump.
  const resultsRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const glide = useRef<{ raf: number; token: number }>({ raf: 0, token: 0 });
  const show = useCallback((cat: string) => {
    // first 12 cards fade in; the rest mount once the fade is done
    restDelay.current = 600; // old grid fade-out 0.14 s + new fade-in 0.32 s + margin
    setLimit(12);
    setShownCategory(cat);
  }, []);
  const pickCategory = useCallback(
    (cat: string) => {
      setSelectedCategory(cat);
      cancelAnimationFrame(glide.current.raf);
      const token = ++glide.current.token;
      const el = resultsRef.current;
      if (!el) return show(cat);
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-offset')) || 93;
      const bar = toolbarRef.current?.offsetHeight || 64;
      const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - nav - bar - 12);
      if (window.scrollY <= target + 2) return show(cat);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior });
        return show(cat);
      }
      // skip most of a very long way, then glide the last stretch
      const skipTo = target + window.innerHeight * 1.2;
      if (window.scrollY > skipTo) window.scrollTo({ top: skipTo, behavior: 'instant' as ScrollBehavior });
      const from = window.scrollY;
      const dist = from - target;
      const duration = Math.min(650, Math.max(320, dist * 0.45));
      const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      let t0 = 0;
      let cancelled = false;
      const stop = () => {
        cancelled = true;
        cancelAnimationFrame(glide.current.raf);
        cleanup();
        if (glide.current.token === token) show(cat);
      };
      const cleanup = () => {
        window.removeEventListener('wheel', stop);
        window.removeEventListener('touchstart', stop);
        window.removeEventListener('keydown', stop);
      };
      window.addEventListener('wheel', stop, { passive: true, once: true });
      window.addEventListener('touchstart', stop, { passive: true, once: true });
      window.addEventListener('keydown', stop, { once: true });
      const step = (t: number) => {
        if (cancelled || glide.current.token !== token) return cleanup();
        if (!t0) t0 = t;
        const k = Math.min(1, (t - t0) / duration);
        window.scrollTo({ top: from - dist * ease(k), behavior: 'instant' as ScrollBehavior });
        if (k < 1) glide.current.raf = requestAnimationFrame(step);
        else {
          cleanup();
          show(cat);
        }
      };
      glide.current.raf = requestAnimationFrame(step);
    },
    [show]
  );
  useEffect(() => () => cancelAnimationFrame(glide.current.raf), []);

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <Suspense fallback={null}>
        <SearchParamsSync
          onChange={(category, q) => {
            setSelectedCategory(category);
            setShownCategory(category);
            setSearchQuery(q);
          }}
        />
      </Suspense>
      <PageHeader
        badge="Projects"
        title="Projects"
        description="Selected projects across Building & Construction, Environment & Sustainability and Urban Planning & Transportation."
        breadcrumbs={[{ label: 'Projects' }]}
      />

      {/* Toolbar: glass capsule with a springing filter pill and search */}
      <div ref={toolbarRef} className="sticky top-[var(--nav-offset,93px)] z-40 px-4 sm:px-6 py-3">
        <div className="liquid-glass is-solid mx-auto max-w-5xl rounded-[26px] sm:rounded-full p-1.5 flex flex-col sm:flex-row gap-1.5 sm:items-center">
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {filters.map((cat) => {
              const on = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => pickCategory(cat)}
                  aria-pressed={on}
                  className={`press relative h-10 px-4 rounded-full text-[14.5px] whitespace-nowrap transition-colors duration-300 ${
                    on ? 'text-[#0B0D0E] font-bold' : 'text-[#C2CCD1] font-semibold hover:text-[#F3F5F6]'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="projects-filter-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
                      className="absolute inset-0 rounded-full pill-yellow"
                    />
                  )}
                  <span className="relative">
                    {SHORT_LABEL[cat] || cat} <span className={`font-semibold ${on ? 'text-[#0B0D0E]/60' : 'text-[#8E9AA0]'}`}>{counts[cat] || 0}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <label className="relative flex-1 min-w-0 sm:ml-auto">
            <Search className="w-4 h-4 text-[#8E9AA0] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, client or place"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-white/[0.08] border border-white/10 text-[15.5px] text-[#F3F5F6] placeholder-[#7A888E] focus:outline-none focus:border-[#F6C22E]/60 transition-colors"
            />
          </label>
        </div>
      </div>

      <section className="py-10 lg:py-14">
        <div ref={resultsRef} className="shell">
          <p className="mb-6 text-[17.5px] text-[#C2CCD1]">
            <span className="font-bold text-[#F3F5F6]">{filteredProjects.length}</span> {filteredProjects.length === 1 ? 'project' : 'projects'}
            {shownCategory !== 'All' && <> in {shownCategory}</>}
            {searchQuery.trim() && <> matching &ldquo;{searchQuery.trim()}&rdquo;</>}
          </p>

          {/* switching vertical cross-fades the whole grid in one go (one
              animated element, not dozens of per-card layout animations that
              stutter while the page height changes); search updates in place */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={shownCategory}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
            >
              {filteredProjects.slice(0, limit).map((project) => (
                <div key={project.slug || project.id}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <div className="glass rounded-[26px] p-10 text-center">
              <p className="font-display text-xl font-bold text-[#F3F5F6]">No projects match.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setShownCategory('All');
                  setSearchQuery('');
                }}
                className="press btn-soft mt-5 inline-flex items-center h-11 px-5 rounded-full text-[15.5px] font-bold"
              >
                Show all projects
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProjectsPage() {
  return <ProjectsPageInner />;
}
