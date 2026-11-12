import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import MessageSection from '@/components/about/MessageSection';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'CEO Message | CUBE IIT Madras',
  description: 'Message from L. Padmanaban, Major General (Retired), CEO of CUBE.',
};

export default function CEOMessagePage() {
  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader
        badge="About"
        title="CEO Message"
        description="L. Padmanaban, Major General (Retired), CEO."
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'CEO Message' }]}
      />
      <MessageSection
        id="ceo-message"
        label="CEO Message"
        image="/images/leadership/ceo_padmanaban.jpg"
        name="L. PADMANABAN"
        lines={['(Major General [Retired])', 'CEO']}
        paragraphs={aboutContent.ceoMessage}
      />
    </div>
  );
}
