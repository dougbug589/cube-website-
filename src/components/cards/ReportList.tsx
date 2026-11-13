'use client';

import React, { useState } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import DocumentRequestModal from '@/components/common/DocumentRequestModal';
import type { CubeReport } from '@/data/media';

/** Reports with a request button (Media page and Publications). */
export default function ReportList({ reports }: { reports: CubeReport[] }) {
  const [selected, setSelected] = useState<{ title: string; authors?: string } | null>(null);
  return (
    <>
      <div className="space-y-4 reveal-stagger">
        {reports.map((r) => (
          <article key={r.title} className="glass glass-interactive glass-edge rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="flex md:flex-col items-center gap-3 md:w-24 shrink-0">
              <span className="grid place-items-center w-14 h-14 rounded-[18px] bg-gradient-to-b from-[#F8E3A3] to-[#F0C468] text-[#243239] depth-1">
                <FileText size={24} strokeWidth={2} />
              </span>
              <span className="font-display text-[20px] font-extrabold text-[#243239] tabular-nums">{r.year}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-[#9A7015]">{r.category}</p>
              <h3 className="mt-1.5 font-display text-[21px] sm:text-[23px] font-bold text-[#243239] leading-snug">{r.title}</h3>
              <p className="mt-2.5 text-[17px] text-[#46565E] leading-relaxed">{r.description}</p>
              <p className="mt-3 text-[15.5px] font-semibold text-[#5B6A71]">{r.authors}</p>
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
      <DocumentRequestModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        documentTitle={selected?.title || ''}
        documentAuthor={selected?.authors}
      />
    </>
  );
}
