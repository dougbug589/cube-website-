'use client';

import React, { useState } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import DocumentRequestModal from '@/components/common/DocumentRequestModal';
import SideScroller from '@/components/common/SideScroller';
import type { CubeReport } from '@/data/media';

/**
 * Reports with a request button. layout="list": stacked rows (Publications
 * page); layout="slide": cards in a sideways-scrolling row (Media page).
 */
export default function ReportList({ reports, layout = 'list' }: { reports: CubeReport[]; layout?: 'list' | 'slide' }) {
  const [selected, setSelected] = useState<{ title: string; authors?: string } | null>(null);
  const modal = (
    <DocumentRequestModal
      isOpen={!!selected}
      onClose={() => setSelected(null)}
      documentTitle={selected?.title || ''}
      documentAuthor={selected?.authors}
    />
  );

  if (layout === 'slide') {
    return (
      <>
        <SideScroller ariaLabel="Reports" label={`${reports.length} reports`}>
          {reports.map((r) => (
            <li key={r.title} className="snap-start shrink-0 w-[78vw] sm:w-[480px] lg:w-[540px]">
              <article className="h-full glass glass-edge rounded-[28px] p-7 sm:p-8 flex flex-col">
                <div className="flex items-center gap-4">
                  <span className="grid place-items-center w-14 h-14 rounded-[18px] pill-yellow text-[#0B0D0E] depth-1 shrink-0">
                    <FileText size={24} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-display text-[26px] font-extrabold leading-none text-[#F3F5F6] tabular-nums">{r.year}</p>
                    <p className="mt-1.5 text-[15px] font-bold text-[#F6C22E]">{r.category}</p>
                  </div>
                </div>
                <h3 className="mt-6 font-display text-[21px] sm:text-[23px] font-bold text-[#F3F5F6] leading-snug">{r.title}</h3>
                <p className="mt-3 text-[18px] text-[#DDE3E6] leading-relaxed">{r.description}</p>
                <p className="mt-4 text-[16.5px] font-semibold text-[#C2CCD1]">{r.authors}</p>
                <div className="mt-auto pt-7">
                  <button
                    type="button"
                    onClick={() => setSelected({ title: r.title, authors: r.authors })}
                    className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[15.5px] font-bold whitespace-nowrap"
                  >
                    Request document
                    <ArrowUpRight size={16} strokeWidth={2.25} />
                  </button>
                </div>
              </article>
            </li>
          ))}
        </SideScroller>
        {modal}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4 reveal-stagger">
        {reports.map((r) => (
          <article key={r.title} className="glass glass-interactive glass-edge rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="flex md:flex-col items-center gap-3 md:w-24 shrink-0">
              <span className="grid place-items-center w-14 h-14 rounded-[18px] pill-yellow text-[#0B0D0E] depth-1">
                <FileText size={24} strokeWidth={2} />
              </span>
              <span className="font-display text-[20px] font-extrabold text-[#F3F5F6] tabular-nums">{r.year}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-[#F6C22E]">{r.category}</p>
              <h3 className="mt-1.5 font-display text-[21px] sm:text-[23px] font-bold text-[#F3F5F6] leading-snug">{r.title}</h3>
              <p className="mt-2.5 text-[19.5px] text-[#DDE3E6] leading-relaxed">{r.description}</p>
              <p className="mt-3 text-[17.5px] font-semibold text-[#C2CCD1]">{r.authors}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelected({ title: r.title, authors: r.authors })}
              className="press btn-soft self-start md:self-center inline-flex items-center gap-2 h-12 px-6 rounded-full text-[15.5px] font-bold whitespace-nowrap shrink-0"
            >
              Request document
              <ArrowUpRight size={16} strokeWidth={2.25} />
            </button>
          </article>
        ))}
      </div>
      {modal}
    </>
  );
}
