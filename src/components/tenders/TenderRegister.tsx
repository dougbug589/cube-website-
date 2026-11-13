'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Download, Mail, Search, X, Copy, Check, CornerDownRight } from 'lucide-react';

type Tender = {
  id: string;
  referenceNumber?: string;
  title: string;
  description?: string;
  documentUrl?: string;
  publishedDate?: string;
  createdAt?: string;
  closingDate?: string;
  status?: string;
};

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.8 };
const EASE = [0.22, 1, 0.36, 1] as const;

// References are written with and without punctuation on the original site
// ("CUBE/ADM/RFP/B&C/023/2024-25" vs "CUBEADMRFPB&C0232024-25").
const refKey = (r?: string) => (r || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const isCorrigendum = (t: Tender) => /^corrigendum/i.test(t.title.trim());
const isOpen = (t: Tender) => !/closed|archiv|cancel/i.test(t.status || '');

function CopyRef({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      aria-label={`Copy reference ${value}`}
      title="Copy reference"
      className="press inline-flex items-center gap-2 h-8 pl-3 pr-2.5 rounded-full bg-white/[0.06] border border-white/10 text-[13.5px] font-bold text-[#C2CCD1] hover:text-[#F3F5F6] tabular-nums transition-colors"
    >
      <span className="truncate max-w-[16rem] sm:max-w-none">{value}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? 'y' : 'n'}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 520, damping: 26 }}
        >
          {done ? <Check size={14} strokeWidth={2.5} className="text-[#2F9A5B]" /> : <Copy size={13} strokeWidth={2.25} className="text-[#8A979D]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function DocButton({ tender, compact = false }: { tender: Tender; compact?: boolean }) {
  const hasDoc = tender.documentUrl && tender.documentUrl !== '#';
  const cls = `press inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap ${
    compact ? 'h-10 px-4 text-[14.5px] btn-soft' : 'h-11 px-5 text-[15px] btn-gold'
  }`;
  return hasDoc ? (
    <a href={tender.documentUrl} target="_blank" rel="noreferrer" className={cls}>
      <Download size={16} strokeWidth={2.25} />
      {compact ? 'PDF' : 'Download document'}
    </a>
  ) : (
    <a href={`mailto:office@cubeiitm.org?subject=${encodeURIComponent(`Tender document: ${tender.referenceNumber || tender.title}`)}`} className={cls}>
      <Mail size={16} strokeWidth={2.25} />
      Request by email
    </a>
  );
}

export default function TenderRegister({ tenders }: { tenders: Tender[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  // Main notices, each with the corrigenda that share its reference number.
  const groups = useMemo(() => {
    const mains = tenders.filter((t) => !isCorrigendum(t));
    const corr = tenders.filter(isCorrigendum);
    const used = new Set<string>();
    const out = mains.map((m) => {
      const kids = corr.filter((c) => refKey(c.referenceNumber) && refKey(c.referenceNumber) === refKey(m.referenceNumber));
      kids.forEach((k) => used.add(k.id));
      return { main: m, corrigenda: kids };
    });
    // a corrigendum whose tender is not listed stays visible on its own
    corr.filter((c) => !used.has(c.id)).forEach((c) => out.push({ main: c, corrigenda: [] }));
    return out;
  }, [tenders]);

  const counts = useMemo(
    () => ({
      all: groups.length,
      open: groups.filter((g) => isOpen(g.main)).length,
      closed: groups.filter((g) => !isOpen(g.main)).length,
    }),
    [groups]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups.filter((g) => {
      if (filter === 'open' && !isOpen(g.main)) return false;
      if (filter === 'closed' && isOpen(g.main)) return false;
      if (!q) return true;
      return [g.main, ...g.corrigenda].some((t) =>
        [t.title, t.description, t.referenceNumber].some((v) => (v || '').toLowerCase().includes(q))
      );
    });
  }, [groups, query, filter]);

  const FILTERS = [
    { id: 'all' as const, label: 'All' },
    { id: 'open' as const, label: 'Open' },
    { id: 'closed' as const, label: 'Closed' },
  ];

  return (
    <div>
      {/* toolbar: springing filter pill + search */}
      <div className="sticky top-[var(--nav-offset,93px)] z-30 py-3">
        <div className="liquid-glass is-solid rounded-[26px] sm:rounded-full p-1.5 flex flex-col sm:flex-row gap-1.5 sm:items-center">
          <div className="flex items-center gap-0.5">
            {FILTERS.map((f) => {
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`press relative h-10 px-4 rounded-full text-[15px] whitespace-nowrap flex items-center gap-2 transition-colors duration-300 ${
                    on ? 'text-[#0B0D0E] font-bold' : 'text-[#C2CCD1] font-semibold hover:text-[#F3F5F6]'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="tender-filter-pill"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full pill-yellow"
                    />
                  )}
                  <span className="relative">{f.label}</span>
                  <span className={`relative grid place-items-center min-w-6 h-6 px-1.5 rounded-full text-[13.5px] font-extrabold tabular-nums ${on ? 'bg-black/10' : 'bg-white/[0.08]'}`}>
                    {counts[f.id]}
                  </span>
                </button>
              );
            })}
          </div>
          <label className="relative flex-1 flex items-center">
            <Search size={17} className="absolute left-4 text-[#8E9AA0] pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by work, place or reference number"
              aria-label="Search tenders"
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

      {/* register */}
      <ol className="mt-4 space-y-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((g, i) => {
            const t = g.main;
            const open = isOpen(t);
            return (
              <motion.li
                key={t.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: EASE, layout: SPRING }}
                className="glass glass-edge rounded-[28px] overflow-hidden"
              >
                <div className="p-6 sm:p-8 grid md:grid-cols-[auto_1fr_auto] gap-5 md:gap-7 items-start">
                  <span className="hidden md:grid place-items-center w-14 h-14 rounded-[18px] bg-[#F6C22E]/15 text-[#F6C22E] depth-1 font-display text-[18px] font-extrabold tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13.5px] font-bold border ${
                          open ? 'bg-[#2F9A5B]/15 border-[#2F9A5B]/35 text-[#8FE0AE]' : 'bg-white/[0.06] border-white/10 text-[#A7B2B8]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-[#2F9A5B]' : 'bg-[#8A979D]'}`} />
                        {t.status || 'Open'}
                      </span>
                      {t.referenceNumber && <CopyRef value={t.referenceNumber} />}
                    </div>
                    <h3 className="mt-3 font-display text-[20px] sm:text-[23px] font-extrabold text-[#F3F5F6] leading-snug">{t.title}</h3>
                    {t.description && t.description.trim() !== t.title.trim() && (
                      <p className="mt-2 text-[18px] text-[#C2CCD1] leading-relaxed">{t.description}</p>
                    )}
                    <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-[14.5px]">
                      {(t.publishedDate || t.createdAt) && (
                        <div className="flex gap-1.5">
                          <dt className="text-[#8E9AA0] font-semibold">Published</dt>
                          <dd className="text-[#F3F5F6] font-bold">{t.publishedDate || t.createdAt?.split('T')[0]}</dd>
                        </div>
                      )}
                      {t.closingDate && (
                        <div className="flex gap-1.5">
                          <dt className="text-[#8E9AA0] font-semibold">Closing</dt>
                          <dd className="text-[#F3F5F6] font-bold">{t.closingDate}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <div className="md:self-center">
                    <DocButton tender={t} />
                  </div>
                </div>

                {g.corrigenda.length > 0 && (
                  <div className="border-t border-white/10 bg-white/[0.05] px-6 sm:px-8 py-4">
                    <p className="text-[13.5px] font-extrabold tracking-[0.08em] uppercase text-[#F6C22E]">
                      Corrigenda · {g.corrigenda.length}
                    </p>
                    <ul className="mt-2 divide-y divide-white/[0.08]">
                      {g.corrigenda.map((c) => (
                        <li key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                          <CornerDownRight size={17} className="hidden sm:block text-[#F6C22E] shrink-0" />
                          <span className="flex-1 min-w-0">
                            <span className="block text-[16px] font-bold text-[#F3F5F6] leading-snug">{c.title}</span>
                            {c.description && <span className="block mt-0.5 text-[16.5px] text-[#C2CCD1] leading-snug">{c.description}</span>}
                          </span>
                          <DocButton tender={c} compact />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      {visible.length === 0 && (
        <div className="mt-6 liquid-glass rounded-[28px] p-10 text-center">
          <FileText size={28} className="mx-auto text-[#F6C22E]" />
          <p className="mt-3 font-display text-[20px] font-bold text-[#F3F5F6]">No tenders match</p>
          <button type="button" onClick={() => { setQuery(''); setFilter('all'); }} className="press btn-soft mt-5 h-11 px-5 rounded-full text-[15px] font-bold">
            Show all tenders
          </button>
        </div>
      )}
    </div>
  );
}
