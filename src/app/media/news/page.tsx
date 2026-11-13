import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import NewsCard, { newsHref } from '@/components/cards/NewsCard';
import { getPublishedNews } from '@/lib/db/queries';

export const metadata = {
  title: 'News | CUBE IIT Madras',
  description: 'News from CUBE – Centre for Urbanization, Buildings & Environment.',
};

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const newsList = await getPublishedNews();
  const [lead, ...rest] = newsList as any[];

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader badge="Media" title="News" description="News from CUBE." breadcrumbs={[{ label: 'Media', href: '/media' }, { label: 'News' }]} />

      <section className="shell pb-24">
        {lead && (
          <Link href={newsHref(lead)} className="reveal press group glass glass-interactive glass-edge rounded-[30px] overflow-hidden grid lg:grid-cols-12">
            <div className="relative lg:col-span-7 aspect-[16/10] lg:aspect-auto lg:min-h-[420px] overflow-hidden bg-[#1A1F22]">
              <Image
                src={lead.image || '/images/about/about_about.jpg'}
                alt={lead.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
              {lead.date && <span className="chip-photo absolute top-4 left-4 rounded-full px-3 py-1 text-[13.5px] font-bold text-white">{lead.date}</span>}
            </div>
            <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col">
              <p className="label-mono">Latest{lead.category ? ` · ${lead.category}` : ''}</p>
              <h2 className="mt-3 font-display text-[28px] sm:text-[32px] font-extrabold text-[#F3F5F6] leading-tight">{lead.title}</h2>
              <p className="mt-4 text-[19px] text-[#DDE3E6] leading-relaxed line-clamp-6">{lead.excerpt || lead.summary}</p>
              <span className="mt-auto pt-8 inline-flex items-center gap-2 text-[16px] font-bold text-[#F3F5F6]">
                Read the story
                <span className="grid place-items-center w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 depth-1 transition-[transform,background-color] duration-500 group-hover:bg-[#F6C22E]/35 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <ArrowUpRight size={17} strokeWidth={2.25} />
                </span>
              </span>
            </div>
          </Link>
        )}

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
          {rest.map((item: any) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
