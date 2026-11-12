import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import MessageSection from '@/components/about/MessageSection';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Chairman Message | CUBE IIT Madras',
  description: 'Message from Prof. V Kamakoti, Director, IIT Madras and Chairman of CUBE.',
};

export default function ChairmanMessagePage() {
  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader
        badge="About"
        title="Chairman Message"
        description="Prof. V Kamakoti, Director, IIT Madras."
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'Chairman Message' }]}
      />
      <MessageSection
        id="chairman-message"
        label="Chairman Message"
        image="/images/leadership/kamakoti_iitm.jpg"
        name="Prof. V Kamakoti"
        lines={['Director, IIT Madras']}
        paragraphs={aboutContent.chairmanMessage}
      />
    </div>
  );
}
