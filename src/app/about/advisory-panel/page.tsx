import React from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { Award, BookOpen } from 'lucide-react';
import { advisoryPanel as fallbackAdvisoryPanel } from '@/data/leadership';
import { getPublishedTeamMembers } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'IIT Madras Advisory Panel | CUBE',
  description: 'Distinguished faculty panel from IIT Madras providing technical advisory across CUBE engineering verticals.',
};

export default async function AdvisoryPanelPage() {
  const team = await getPublishedTeamMembers();
  const advisory = team
    .filter((m: any) => m.category === 'advisory')
    .map((m: any) => ({
      ...m,
      role: m.designation || m.role || '',
      organization: m.organization || m.department || 'IIT Madras',
    }));
  const advisoryPanel = advisory.length ? advisory : fallbackAdvisoryPanel;

  return (
    <div>
      <PageHeader
        badge="Academic Rigor"
        title="IIT Madras Faculty Advisory Panel"
        description="Over 25 distinguished professors and subject-matter experts from the Indian Institute of Technology Madras guiding CUBE's applied engineering consultancy."
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'IIT Advisory Panel' },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {advisoryPanel.map((member, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-cube hover:border-teal-300 transition-all flex flex-col items-center text-center group"
              >
                <div className="relative h-28 w-28 rounded-full overflow-hidden mb-4 border-2 border-slate-200 group-hover:border-teal-500 shadow-sm transition-all">
                  <Image
                    src={member.image || '/images/leadership/about_leader.jpg'}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-sm font-bold text-navy-950 font-display line-clamp-1">
                  {member.name}
                </h3>
                <p className="text-xs text-teal-700 font-medium mt-1 line-clamp-2">
                  {member.role}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  IIT Madras
                </p>
                <div className="mt-auto pt-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Faculty Advisor
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

