import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import SectionPhoto from '@/components/common/SectionPhoto';
import CoreValuesPicker from '@/components/about/CoreValuesPicker';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Core Values | CUBE IIT Madras',
  description: 'Core values of CUBE – Leadership, Excellence, Harmony, Intrepid, Innovation and Decisive.',
};

export default function CoreValuesPage() {
  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="About"
        title="Core Values"
        description={aboutContent.coreValues.map((v) => v.title).join(' · ')}
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'Core Values' }]}
      />

      {/* over the CUBE team; glass cards turn frosted over the photo */}
      <section className="relative py-16 lg:py-24 pb-28">
        <SectionPhoto src="/images/hero/slides_building-training-team.jpg" wash="bg-[#0B0D0E]/55" position="object-[50%_35%]" />
        <div className="relative shell">
        <CoreValuesPicker values={aboutContent.coreValues} interval={1800} />
        </div>
      </section>
    </div>
  );
}
