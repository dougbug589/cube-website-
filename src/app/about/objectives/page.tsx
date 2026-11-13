import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SectionPhoto from '@/components/common/SectionPhoto';
import ObjectivesCounter from '@/components/about/ObjectivesCounter';
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

      {/* over surface water management plan for the IIT Jammu campus (a CUBE project); glass cards turn frosted over the photo */}
      <section className="relative py-16 lg:py-24 pb-28">
        <SectionPhoto src="/images/hero/slides_slide2.jpg" wash="bg-[#0B0D0E]/55" />
        <div className="relative shell">
        <ObjectivesCounter items={aboutContent.objectives} interval={2200} />
        <div className="mt-10 flex flex-wrap gap-3 reveal">
          <Link href="/about/vision-mission" className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold">
            Vision &amp; Mission <ArrowUpRight size={16} strokeWidth={2.25} />
          </Link>
          <Link href="/about/core-values" className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold">
            Core values <ArrowUpRight size={16} strokeWidth={2.25} />
          </Link>
        </div>
        </div>
      </section>
    </div>
  );
}
