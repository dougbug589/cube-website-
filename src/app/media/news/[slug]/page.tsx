import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import { getNewsBySlug, getPublishedNews } from '@/lib/db/queries';
import NewsCard from '@/components/cards/NewsCard';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  return {
    title: item ? `${item.title} | CUBE News` : 'News | CUBE',
    description: item?.excerpt || 'News from CUBE.',
  };
}

function toParagraphs(content: unknown): string[] {
  if (Array.isArray(content)) {
    return content.map((part) => String(part).trim()).filter(Boolean);
  }
  if (typeof content === 'string') {
    return content
      .split(/\n{2,}|\r?\n/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();
  const paragraphs = toParagraphs(item.content);
  const more = ((await getPublishedNews()) as any[]).filter((n) => (n.slug || n.id) !== (item.slug || item.id)).slice(0, 3);

  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader
        badge={item.category || 'News'}
        title={item.title}
        description={item.date || ''}
        breadcrumbs={[{ label: 'Media', href: '/media' }, { label: 'News', href: '/media/news' }]}
        backHref="/media/news"
      />

      <article className="shell pb-16">
        <div className="relative aspect-[16/9] lg:aspect-[21/9] rounded-[32px] overflow-hidden bg-[#DCE4E8] depth-3 reveal">
          <Image
            src={item.image || '/images/about/about_about.jpg'}
            alt={item.title}
            fill
            priority
            sizes="(max-width: 1600px) 100vw, 1536px"
            className="object-cover"
          />
        </div>

        <div className="mt-10 lg:mt-14 grid lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-8 xl:col-span-7 space-y-6 text-[18px] sm:text-[19px] leading-[1.8] text-[#243239] reveal">
            {(paragraphs.length > 0 ? paragraphs : [item.excerpt]).map((p, i) => (
              <p key={i} className={i === 0 ? 'text-[20px] sm:text-[22px] leading-[1.7] font-semibold' : 'text-[#3B4B53]'}>
                {p}
              </p>
            ))}
          </div>
          <aside className="lg:col-span-4 xl:col-span-4 xl:col-start-9 lg:sticky lg:top-[calc(var(--nav-offset,93px)+1.5rem)] self-start reveal">
            <div className="glass glass-edge rounded-[26px] p-6 space-y-4">
              {item.date && (
                <div>
                  <p className="text-[14px] font-bold text-[#66767D]">Date</p>
                  <p className="mt-0.5 text-[17px] font-bold text-[#243239] tabular-nums">{item.date}</p>
                </div>
              )}
              {item.category && (
                <div>
                  <p className="text-[14px] font-bold text-[#66767D]">Category</p>
                  <p className="mt-0.5 text-[17px] font-bold text-[#243239]">{item.category}</p>
                </div>
              )}
              {item.author && (
                <div>
                  <p className="text-[14px] font-bold text-[#66767D]">Author</p>
                  <p className="mt-0.5 text-[17px] font-bold text-[#243239]">{item.author}</p>
                </div>
              )}
              <Link href="/media/news" className="press btn-soft w-full h-11 rounded-full inline-flex items-center justify-center gap-2 text-[15px] font-bold">
                <ArrowLeft size={16} strokeWidth={2.25} /> All news
              </Link>
            </div>
          </aside>
        </div>
      </article>

      {more.length > 0 && (
        <section className="band-mist py-16 lg:py-20">
          <div className="shell">
            <h2 className="headline-light text-3xl sm:text-[2.4rem] text-[#243239] mb-8">More news</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
              {more.map((n) => (
                <NewsCard key={n.id} item={n} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
