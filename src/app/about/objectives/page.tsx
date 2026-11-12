import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { CheckCircle2, Target } from 'lucide-react';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Objectives | CUBE IIT Madras',
  description: '10 Core institutional objectives of CUBE – Centre for Urbanization, Buildings & Environment.',
};

export default function ObjectivesPage() {
  return (
    <div>
      <PageHeader
        badge="Institutional Mandate"
        title="Core Objectives"
        description="The foundational mandates established to guide CUBE's applied engineering consultancy, capacity building, and applied research."
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'Objectives' },
        ]}
      />

      <section className="py-20 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {aboutContent.objectives.map((obj, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-cube hover:border-[#E9D6A8] transition flex items-start space-x-4"
              >
                <div className="h-8 w-8 rounded-full bg-[#F0C468] text-[#243239] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
                <div>
                  <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                    {obj}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

