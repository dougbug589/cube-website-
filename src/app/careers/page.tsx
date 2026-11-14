import React from 'react';
import CareersHub from '@/components/careers/CareersHub';
import { getPublishedCareers, getCareersPageContent } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Careers | CUBE IIT Madras',
  description: 'Careers at CUBE – Centre for Urbanization, Buildings & Environment.',
};

export default async function CareersPage() {
  const [publishedCareers, content] = await Promise.all([
    getPublishedCareers(),
    getCareersPageContent(),
  ]);

  return <CareersHub initialCareers={publishedCareers} content={content} />;
}
