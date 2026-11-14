import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import EventsTimeline from '@/components/media/EventsTimeline';
import { cubeEvents } from '@/data/media';

export const metadata = {
  title: 'Events | CUBE IIT Madras',
  description: 'Meetings, project milestones and events at CUBE.',
};

export default function EventsPage() {
  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="Media"
        title="Events & Milestones"
        description="Meetings, project milestones and events at CUBE."
        breadcrumbs={[{ label: 'Media', href: '/media' }, { label: 'Events' }]}
      />

      {/* horizontal timeline: rail with dated markers, cards scroll sideways */}
      <section className="shell pb-24">
        <EventsTimeline events={cubeEvents} />
      </section>
    </div>
  );
}
