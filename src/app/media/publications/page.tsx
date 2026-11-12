'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import DocumentRequestModal from '@/components/common/DocumentRequestModal';
import { BookOpen, FileText, Download, ShieldCheck } from 'lucide-react';
import { cubeReports } from '@/data/media';

export default function PublicationsPage() {
  const [selectedDoc, setSelectedDoc] = useState<{ title: string; authors?: string } | null>(null);

  const publications = cubeReports;

  return (
    <div>
      <PageHeader
        badge="Applied Research"
        title="Reports & Publications"
        description="Reports prepared by CUBE for government departments. Request a copy of any report below."
        breadcrumbs={[
          { label: 'Media', href: '/media' },
          { label: 'Publications' },
        ]}
      />

      <section className="py-20 bg-transparent">
        <div className="shell">
          <div className="space-y-6">
            {publications.map((pub, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm hover:shadow-cube transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-bold text-[#9A7015] bg-[#F7EDD3] px-2.5 py-0.5 rounded-full border border-[#E9D6A8]">
                      {pub.category}
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-slate-500 font-medium">Published: {pub.year}</span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-navy-950 leading-snug">
                    {pub.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium">
                    {pub.authors}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    {pub.description}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <button
                    onClick={() => setSelectedDoc({ title: pub.title, authors: pub.authors })}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#9A7015] bg-white hover:bg-[#F7EDD3] border border-slate-300 hover:border-[#E9D6A8] transition flex items-center shadow-sm cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-1.5 text-[#9A7015]" />
                    <span>Request Document</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DocumentRequestModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        documentTitle={selectedDoc?.title || ''}
        documentAuthor={selectedDoc?.authors}
      />
    </div>
  );
}
