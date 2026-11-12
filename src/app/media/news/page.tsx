import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { getPublishedNews } from '@/lib/db/queries';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Media & News | CUBE IIT Madras',
  description: 'Latest institutional updates, press releases, research milestones, and project completions from CUBE.',
};

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const newsList = await getPublishedNews();

  return (
    <div className="bg-transparent min-h-screen">
      <PageHeader
        badge="Institutional Media"
        title="News, Articles &amp; Press Releases"
        description="Official press communications, announcements, and coverage of CUBE's applied research and field engineering across Tamil Nadu."
        breadcrumbs={[{ label: 'Media' }, { label: 'News' }]}
      />

      <section className="py-12 sm:py-16 md:py-20 bg-transparent">
        <div className="shell">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((item) => (
              <article
                key={item.id}
                className="group rounded-2xl bg-white border border-[#DCE4E7] overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-[#EEF2F4] overflow-hidden">
                    <Image
                      src={item.image || '/images/hero/slides_building-training-team.jpg'}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[13.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-[#2B3B44] border border-[#B9C5CA] shadow-2xs backdrop-blur-md">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-xs text-[#5B6A71] space-x-3 mb-2.5">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-[#2B3B44]" />
                        {item.date}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1 text-[#5B6A71]" />
                        {item.author || 'CUBE Editorial'}
                      </span>
                    </div>

                    <h2 className="text-base font-display font-bold text-[#243239] group-hover:text-[#2B3B44] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-xs text-[#6B7280] mt-2 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-[#DCE4E7] flex items-center justify-between">
                    <Link
                      href={`/media/news/${item.slug || item.id}`}
                      className="text-xs font-semibold text-[#2B3B44] group-hover:text-[#C4921B] group-hover:translate-x-0.5 transition flex items-center"
                    >
                      <span>Read Full Press Release</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
