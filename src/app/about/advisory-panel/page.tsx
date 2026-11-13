import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import PersonCard from '@/components/common/PersonCard';
import { getPublishedTeamMembers } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'IIT Madras Advisory Panel | CUBE',
  description: 'The IIT Madras faculty advisory panel of CUBE.',
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
  // CMS is the source of truth: archived members must not reappear via a fallback.
  const advisoryPanel = advisory;

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="About"
        title="IIT Advisory Panel"
        description="Faculty from the Departments of Civil, Mechanical, Aerospace and Chemical Engineering, IIT Madras."
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'IIT Advisory Panel' }]}
      />
      <section className="shell pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 reveal-stagger">
          {advisoryPanel.map((m: any, i: number) => (
            <PersonCard key={`${m.name}-${i}`} name={m.name} role={m.role} organization={m.organization} image={m.image} />
          ))}
        </div>
      </section>
    </div>
  );
}
