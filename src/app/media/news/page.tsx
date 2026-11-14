import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import NewsSlideshow from '@/components/media/NewsSlideshow';
import { getPublishedNews } from '@/lib/db/queries';

export const metadata = {
  title: 'News | CUBE IIT Madras',
  description: 'News from CUBE – Centre for Urbanization, Buildings & Environment.',
};

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const newsList = await getPublishedNews();

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader badge="Media" title="News" description="News from CUBE." breadcrumbs={[{ label: 'Media', href: '/media' }, { label: 'News' }]} />

      <section className="shell pb-24">
        <NewsSlideshow
          stories={newsList.map((n: any) => ({
            id: n.id,
            slug: n.slug,
            title: n.title,
            date: n.date,
            category: n.category,
            summary: n.excerpt || n.summary,
            image: n.image,
          }))}
        />
      </section>
    </div>
  );
}
