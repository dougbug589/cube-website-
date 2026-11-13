import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import ReportList from '@/components/cards/ReportList';
import { cubeReports } from '@/data/media';

export const metadata = {
  title: 'Reports & Publications | CUBE IIT Madras',
  description: 'Reports prepared by CUBE for government departments.',
};

export default function PublicationsPage() {
  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader
        badge="Media"
        title="Reports & Publications"
        description="Reports prepared by CUBE for government departments. Request a copy of any report below."
        breadcrumbs={[{ label: 'Media', href: '/media' }, { label: 'Publications' }]}
      />
      <section className="shell pb-24">
        <ReportList reports={cubeReports} />
      </section>
    </div>
  );
}
