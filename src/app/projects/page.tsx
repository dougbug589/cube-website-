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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  // In-app navigation: mount the first 12 cards for a fast first frame, the
  // rest right after it paints. A full page load renders all of them (the
  // server HTML must match, and crawlers see every project).
  const [limit, setLimit] = useState<number>(() => (isHydrated() ? 12 : Infinity));
  useEffect(() => {
    if (limit === Infinity) return;
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

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.scopeOfWork && p.scopeOfWork.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (p.client && String(p.client).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.location && String(p.location).toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [projectList, selectedCategory, searchQuery]);

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

  // Picking a filter while scrolled down the grid: first bring the top of the
  // results up under the sticky toolbar (instant: the content is about to
  // change anyway), then switch. Otherwise the page shrinks under the reader,
  // the browser clamps the scroll position and the jump looks like a stall.
  const resultsRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const pickCategory = useCallback((cat: string) => {
    const el = resultsRef.current;
    if (el) {
      const nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-offset')) || 93;
      const bar = toolbarRef.current?.offsetHeight || 64;
      const top = el.getBoundingClientRect().top + window.scrollY - nav - bar - 12;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
    }
    // mount the first 12 cards in the switch frame, the rest right after
    setLimit(12);
    setSelectedCategory(cat);
  }, []);

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <Suspense fallback={null}>
        <SearchParamsSync
          onChange={(category, q) => {
            setSelectedCategory(category);
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
            {selectedCategory !== 'All' && <> in {selectedCategory}</>}
            {searchQuery.trim() && <> matching &ldquo;{searchQuery.trim()}&rdquo;</>}
          </p>

          {/* switching vertical cross-fades the whole grid in one go (one
              animated element, not dozens of per-card layout animations that
              stutter while the page height changes); search updates in place */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selectedCategory}
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
