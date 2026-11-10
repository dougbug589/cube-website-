import React from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { ShieldCheck, Award } from 'lucide-react';
import { getPublishedTeamMembers } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Governing Board Members | CUBE IIT Madras',
  description: 'Governing Board of CUBE comprising leadership from the Government of Tamil Nadu and IIT Madras.',
};

export default async function BoardMembersPage() {
  const team = await getPublishedTeamMembers();
  const board = team
    .filter((m: any) => m.category === 'board')
    .map((m: any) => ({
      ...m,
      role: m.designation || m.role || '',
      organization: m.organization || m.department || 'IIT Madras',
    }));
  // CMS is the source of truth: archived members must not reappear via a fallback.
  const boardMembers = board;

  return (
    <div>
      <PageHeader
        badge="Governance"
        title="Governing Board Members"
        description="The executive governing board overseeing CUBE's policy, strategic partnerships, and operational milestones."
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'Board Members' },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {boardMembers.map((member, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-cube hover:border-teal-300 transition-all flex flex-col items-center text-center group"
              >
                <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 border-2 border-slate-200 group-hover:border-teal-500 shadow-md transition-all">
                  <Image
                    src={member.image || '/images/leadership/about_leader.jpg'}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-base font-bold text-navy-950 font-display line-clamp-1">
                  {member.name}
                </h3>
                <p className="text-xs text-teal-700 font-semibold mt-1 line-clamp-2">
                  {member.role}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {member.organization}
                </p>
                <div className="mt-auto pt-4">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    Governing Board
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

