'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SectionNav from '@/components/common/SectionNav';
import ProjectCard from '@/components/cards/ProjectCard';
import { verticals } from '@/data/verticals';
import { projects as fallbackProjects } from '@/data/projects';
import { useLiveList } from '@/lib/live';

const SECTIONS = verticals.map((v) => ({ id: v.id, label: v.title }));

export default function VerticalsPage() {
  // Live CMS data: archived projects disappear instantly.
  const projects = useLiveList<any>('/api/public/projects', fallbackProjects as any[]);

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="Verticals"
        title="Our verticals"
        description="Building & Construction, Environment & Sustainability, Smart Cities, and Urban Planning & Transportation."
        breadcrumbs={[{ label: 'Verticals' }]}
      />

      <SectionNav id="verticals" sections={SECTIONS} />

      {verticals.map((v, i) => {
        const list = projects.filter((p) => p.status !== 'archived' && p.category === v.title);
        const flip = i % 2 === 1;
        return (
          <section key={v.id} id={v.id} className={`scroll-mt-40 py-16 lg:py-24 ${i % 2 === 0 ? '' : 'band-mist'}`}>
            <div className="shell">
              <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                <div className={`lg:col-span-6 relative aspect-[4/3] rounded-[32px] overflow-hidden depth-3 bg-[#1A1F22] reveal ${flip ? 'lg:order-2' : ''}`}>
                  <Image src={v.heroImage} alt={v.title} fill sizes="(max-width: 1024px) 100vw, 48vw" className="object-cover" />
                  <span className="chip-photo absolute top-4 left-4 rounded-full px-3.5 py-1.5 text-[14px] font-extrabold text-white tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className={`lg:col-span-6 reveal ${flip ? 'lg:order-1' : ''}`}>
                  <h2 className="headline-light text-[2.2rem] sm:text-[2.8rem] text-[#F3F5F6] leading-tight">{v.title}</h2>
                  {v.tagline && <p className="mt-3 text-[19px] font-semibold text-[#EBCB3B] leading-snug">{v.tagline}</p>}
                  <p className="mt-5 text-[19.5px] text-[#DDE3E6] leading-relaxed">{v.longDescription || v.description}</p>
                  {v.capabilities.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2.5">
                      {v.capabilities.map((c) => (
                        <li key={c} className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-4 py-2 text-[15.5px] font-semibold text-[#F3F5F6] depth-1">
                          <CheckCircle2 size={16} className="text-[#D89F03]" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Link href={`/verticals/${v.slug}`} className="press btn-gold gold-shimmer inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold">
                      Explore {v.shortTitle || v.title} <ArrowUpRight size={16} strokeWidth={2.25} />
                    </Link>
                    {list.length > 0 && (
                      <span className="text-[16px] font-semibold text-[#A7B2B8]">
                        <span className="font-display text-[22px] font-extrabold text-[#F3F5F6] tabular-nums">{list.length}</span> projects
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {list.length > 0 && (
                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
                  {list.slice(0, 3).map((p) => (
                    <ProjectCard key={p.slug || p.id} project={p} />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
