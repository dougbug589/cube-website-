'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Building2, Trees, Navigation as NavigationIcon, Briefcase, Users } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Monogram } from '@/components/common/PersonCard';
import { teamMembers as fallbackTeamMembers } from '@/data/team';
import { useLiveList } from '@/lib/live';

const DEPARTMENTS = [
  { id: 'Building & Construction', title: 'Building & Construction', Icon: Building2 },
  { id: 'Environment & Sustainability', title: 'Environment & Sustainability', Icon: Trees },
  { id: 'Urban Planning & Transportation', title: 'Urban Planning & Transportation', Icon: NavigationIcon },
  { id: 'Admin', title: 'Admin & Operations', Icon: Briefcase },
] as const;

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.8 };
const hasPhoto = (src?: string) => !!src && !/team_unknown/.test(src);

export default function TeamPage() {
  // Live CMS data (published members only); updates instantly on admin changes.
  const teamList = useLiveList<any>('/api/public/team', fallbackTeamMembers);
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState<string>('all');

  // Staff only (board, advisory panel and leadership have their own pages),
  // grouped by department; archived records never show.
  const grouped = useMemo(() => {
    const q = query.toLowerCase().trim();
    const out: Record<string, any[]> = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, []]));
    teamList
      .filter((m) => m.status !== 'archived')
      .filter((m) => !['leadership', 'board', 'advisory'].includes(m.category))
      .filter((m) => !q || (m.name || '').toLowerCase().includes(q) || (m.designation || '').toLowerCase().includes(q))
      .forEach((m) => {
        const d = m.department || m.category || 'Building & Construction';
        (out[d] || out['Building & Construction']).push(m);
      });
    return out;
  }, [teamList, query]);

  const total = DEPARTMENTS.reduce((n, d) => n + grouped[d.id].length, 0);
  const shown = DEPARTMENTS.filter((d) => (dept === 'all' || dept === d.id) && grouped[d.id].length > 0);
  const FILTERS = [{ id: 'all', label: 'All', count: total }, ...DEPARTMENTS.map((d) => ({ id: d.id, label: d.title, count: grouped[d.id].length }))];

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="About"
        title="Our Team"
        description="The CUBE team across Building & Construction, Environment & Sustainability, Urban Planning & Transportation and Administration."
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'Our Team' }]}
      />

      {/* toolbar: department filter with a springing pill, and search */}
      <div className="sticky top-[var(--nav-offset,93px)] z-30 py-3">
        <div className="shell">
          <div className="liquid-glass is-solid rounded-[26px] p-1.5 flex flex-col xl:flex-row gap-1.5 xl:items-center">
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
              {FILTERS.map((f) => {
                const on = dept === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setDept(f.id)}
                    className={`press relative h-10 px-4 rounded-full text-[15px] whitespace-nowrap flex items-center gap-2 transition-colors duration-300 ${
                      on ? 'text-[#0B0D0E] font-bold' : 'text-[#C2CCD1] font-semibold hover:text-[#F3F5F6]'
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="team-filter-pill"
                        transition={SPRING}
                        className="absolute inset-0 rounded-full pill-yellow"
                      />
                    )}
                    <span className="relative">{f.label}</span>
                    <span className={`relative grid place-items-center min-w-6 h-6 px-1.5 rounded-full text-[13.5px] font-extrabold tabular-nums ${on ? 'bg-black/10' : 'bg-white/[0.08]'}`}>
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="relative flex-1 flex items-center xl:min-w-[280px]">
              <Search size={17} className="absolute left-4 text-[#8E9AA0] pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or role"
                aria-label="Search the team"
                className="w-full h-10 pl-11 pr-10 rounded-full bg-white/[0.08] border border-white/10 text-[15.5px] text-[#F3F5F6] placeholder:text-[#6F7B81] focus:outline-none focus:border-[#F6C22E]/50 focus:ring-4 focus:ring-[#F6C22E]/25 transition-[border-color,box-shadow]"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="press absolute right-2 grid place-items-center w-7 h-7 rounded-full text-[#A7B2B8] hover:bg-white/[0.08]">
                  <X size={15} />
                </button>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="shell pt-6 pb-24 space-y-14">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map(({ id, title, Icon }) => (
            <motion.section
              key={id}
              layout="position"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              aria-labelledby={`dept-${id}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="grid place-items-center w-12 h-12 rounded-2xl pill-yellow text-[#0B0D0E] depth-1">
                  <Icon size={21} strokeWidth={2} />
                </span>
                <h2 id={`dept-${id}`} className="font-display text-[24px] sm:text-[28px] font-extrabold text-[#F3F5F6]">
                  {title}
                </h2>
                <span className="rounded-full bg-white/[0.08] px-3 py-1 text-[14.5px] font-extrabold text-[#C2CCD1] tabular-nums">{grouped[id].length}</span>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
                {grouped[id].map((m, i) => (
                  <li key={`${m.name}-${i}`} className="glass glass-interactive rounded-[22px] p-4 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/[0.06] shrink-0 depth-1">
                      {hasPhoto(m.image) ? (
                        <Image src={m.image} alt={m.name} fill sizes="64px" className="object-cover object-top" />
                      ) : (
                        <Monogram name={m.name} className="absolute inset-0 [&>span]:text-[20px]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-[17.5px] font-bold text-[#F3F5F6] leading-snug">{m.name}</p>
                      {m.designation && <p className="mt-0.5 text-[15.5px] font-semibold text-[#F6C22E] leading-snug">{m.designation}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </AnimatePresence>

        {total === 0 && (
          <div className="liquid-glass rounded-[28px] p-10 text-center">
            <Users size={28} className="mx-auto text-[#F6C22E]" />
            <p className="mt-3 font-display text-[20px] font-bold text-[#F3F5F6]">No one matches &ldquo;{query}&rdquo;</p>
            <button type="button" onClick={() => setQuery('')} className="press btn-soft mt-5 h-11 px-5 rounded-full text-[15px] font-bold">
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
