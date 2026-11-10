import React from 'react';
import CareersHub from '@/components/careers/CareersHub';
import { getPublishedCareers, getCareersPageContent } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Careers & Talent Network | CUBE IIT Madras',
  description: 'Explore active civil, structural, environmental, and urban planning career opportunities or submit your resume to the CUBE Talent Network.',
};

export default async function CareersPage() {
  const [publishedCareers, content] = await Promise.all([
    getPublishedCareers(),
    getCareersPageContent(),
  ]);

  return <CareersHub initialCareers={publishedCareers} content={content} />;
}
