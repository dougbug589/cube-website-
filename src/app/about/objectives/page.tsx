import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Objectives | CUBE IIT Madras',
  description: 'The objectives of CUBE – Centre for Urbanization, Buildings & Environment.',
};

export default function ObjectivesPage() {
  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="About"
        title="Objectives"
        description={`The ${aboutContent.objectives.length} objectives CUBE works towards.`}
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'Objectives' }]}
      />

      <section className="shell pb-24">
        <ol className="grid md:grid-cols-2 gap-4 lg:gap-5 reveal-stagger">
          {aboutContent.objectives.map((obj, i) => (
            <li key={i} className="glass glass-interactive glass-edge rounded-[26px] p-6 lg:p-8 flex items-start gap-5 lg:gap-6">
              <span className="grid place-items-center w-14 h-14 rounded-[18px] bg-gradient-to-b from-[#D89F03]/35 to-[#D89F03]/20 text-[#F3F5F6] depth-1 font-display text-[20px] font-extrabold tabular-nums shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="pt-1.5 text-[18px] lg:text-[19px] leading-relaxed text-[#F3F5F6] font-medium">{obj}</span>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3 reveal">
          <Link href="/about/vision-mission" className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold">
            Vision &amp; Mission <ArrowUpRight size={16} strokeWidth={2.25} />
          </Link>
          <Link href="/about/core-values" className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold">
            Core values <ArrowUpRight size={16} strokeWidth={2.25} />
          </Link>
        </div>
      </section>
    </div>
  );
}
