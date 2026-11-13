'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SectionHeading from '@/components/common/SectionHeading';
import SectionNav from '@/components/common/SectionNav';
import NewsCard from '@/components/cards/NewsCard';
import ReportList from '@/components/cards/ReportList';
import { newsItems as fallbackNewsItems } from '@/data/news';
import { useLiveList } from '@/lib/live';
import { cubeEvents, cubeReports } from '@/data/media';

const SECTIONS = [
  { id: 'news', label: 'News' },
  { id: 'events', label: 'Events' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'life-at-cube', label: 'Life at CUBE' },
  { id: 'publications', label: 'Reports' },
];

// Captions match the project names on cubeiitm.org.
const GALLERY = [
  { src: '/images/hero/slides_iit-tirupathi.jpg', title: 'IIT Tirupati Permanent Campus – Third Party Quality Assurance' },
  { src: '/images/hero/slides_cpcl-arc.jpg', title: 'PMC for Construction of ARHC, Manali' },
  { src: '/images/hero/slides_ashiana.jpg', title: 'Surface Water Management and Flood Inundation Study, Ashiana Shubham' },
  { src: '/images/hero/slides_design-engineering-consultancy.jpg', title: 'Design, Engineering & Consultancy for 40+ Housing for All schemes' },
  { src: '/images/hero/slides_building-training-team.jpg', title: 'CUBE Team' },
  { src: '/images/hero/slides_07-cat.jpg', title: 'Parayan Kuttai water body study, Caterpillar India' },
];
// Bento spans for the six gallery photos: one large, one tall, then two wide
// in the last row, so the 4-column grid has no holes.
const GALLERY_SPAN = [
  'sm:col-span-2 sm:row-span-2',
  '',
  'row-span-2',
  '',
  'sm:col-span-2',
  'sm:col-span-2',
];

const LIFE_PHOTOS = ['/images/life-at-cube/about_life.jpg', '/images/life-at-cube/about_life1.jpg', '/images/life-at-cube/about_life2.jpg'];
const VERTICALS = ['Building & Construction', 'Environment & Sustainability', 'Smart Cities', 'Urban Planning & Transportation'];

const newsHref = (item: any) => `/media/news/${item.slug || item.id}`;

function DateChip({ date }: { date?: string }) {
  if (!date) return null;
  return <span className="chip-photo rounded-full px-3 py-1 text-[12.5px] font-bold text-white">{date}</span>;
}

export default function MediaPage() {
  // Live CMS news: published items only, updates instantly on admin changes.
  const newsItems = useLiveList<any>('/api/public/news', fallbackNewsItems as any[]);
  const [lead, ...rest] = newsItems.slice(0, 7);

  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader
        badge="Media"
        title="Media"
        description="News, events, photo gallery, reports and life at CUBE."
        breadcrumbs={[{ label: 'Media' }]}
      />

      <SectionNav id="media" sections={SECTIONS} />

      {/* 1 · News: one lead story, then a grid */}
      <section id="news" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell">
          <SectionHeading eyebrow="News" title="Latest from CUBE" action={{ href: '/media/news', label: 'All news' }} />

          {lead && (
            <Link
              href={newsHref(lead)}
              className="reveal press group glass glass-interactive glass-edge rounded-[30px] overflow-hidden grid lg:grid-cols-12"
            >
              <div className="relative lg:col-span-7 aspect-[16/10] lg:aspect-auto lg:min-h-[380px] overflow-hidden bg-[#DCE4E8]">
                <Image
                  src={lead.image || '/images/about/about_about.jpg'}
                  alt={lead.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {lead.category && (
                    <span className="chip-photo rounded-full px-3 py-1 text-[12.5px] font-bold text-white">{lead.category}</span>
                  )}
                  <DateChip date={lead.date} />
                </div>
              </div>
              <div className="lg:col-span-5 p-7 sm:p-9 lg:p-10 flex flex-col">
                <p className="label-mono">Latest</p>
                <h3 className="mt-3 font-display text-[26px] sm:text-[30px] font-extrabold text-[#243239] leading-tight">{lead.title}</h3>
                <p className="mt-4 text-[17px] text-[#46565E] leading-relaxed line-clamp-5">
                  {lead.summary || (Array.isArray(lead.content) ? lead.content[0] : lead.content)}
                </p>
                <span className="mt-auto pt-8 inline-flex items-center gap-2 text-[16px] font-bold text-[#243239]">
                  Read the story
                  <span className="grid place-items-center w-10 h-10 rounded-full bg-white border border-[#33454E]/10 depth-1 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[#F0C468] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={17} strokeWidth={2.25} />
                  </span>
                </span>
              </div>
            </Link>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
            {rest.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* 2 · Events: dated milestones, photo first */}
      <section id="events" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell">
          <SectionHeading eyebrow="Events" title="Events & milestones" action={{ href: '/media/events', label: 'All events' }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 reveal-stagger">
            {cubeEvents.map((evt) => (
              <article key={evt.title} className="glass glass-interactive glass-edge rounded-[26px] overflow-hidden flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#DCE4E8]">
                  <Image src={evt.image} alt={evt.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  <div className="absolute top-3 left-3">
                    <DateChip date={evt.date} />
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-[13.5px] font-bold text-[#9A7015]">{evt.category}</p>
                  <h3 className="mt-1.5 font-display text-[17px] font-bold text-[#243239] leading-snug">{evt.title}</h3>
                  <p className="mt-2 text-[15px] text-[#5B6A71] leading-relaxed line-clamp-4">{evt.description}</p>
                  {evt.location && (
                    <p className="mt-auto pt-4 flex items-center gap-1.5 text-[14px] font-semibold text-[#46565E]">
                      <MapPin size={15} className="text-[#C4921B] shrink-0" />
                      {evt.location}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · Gallery: bento grid, caption rises on hover */}
      <section id="gallery" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell">
          <SectionHeading eyebrow="Gallery" title="Project photographs" action={{ href: '/media/gallery', label: 'Full gallery' }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[220px] lg:auto-rows-[240px] grid-flow-dense gap-4 reveal-stagger">
            {GALLERY.map((img, i) => (
              <figure
                key={img.src}
                className={`group relative rounded-[24px] overflow-hidden bg-[#DCE4E8] depth-1 ${GALLERY_SPAN[i]}`}
              >
                <Image
                  src={img.src}
                  alt={img.title}
                  fill
                  sizes={i === 0 ? '(max-width: 640px) 100vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'}
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                <figcaption className="absolute left-3 right-3 bottom-3 chip-photo rounded-2xl px-4 py-3 text-[14.5px] font-semibold text-white leading-snug transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                  {img.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Life at CUBE */}
      <section id="life-at-cube" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 reveal">
            <p className="label-mono">Workplace</p>
            <h2 className="headline-light text-3xl sm:text-4xl lg:text-[2.6rem] text-[#243239] mt-3">Life at CUBE</h2>
            <p className="mt-5 text-[17px] text-[#46565E] leading-relaxed">
              CUBE&apos;s office and its Environment Laboratory are at the IIT Madras Research Park, Taramani, Chennai.
            </p>
            <div className="mt-7 space-y-3">
              <div className="glass glass-edge rounded-[20px] p-5 flex items-start gap-4">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[#F7EDD3] text-[#9A7015] depth-1 shrink-0">
                  <MapPin size={19} strokeWidth={2} />
                </span>
                <span>
                  <span className="block font-display text-[17px] font-bold text-[#243239]">Location</span>
                  <span className="mt-0.5 block text-[15.5px] text-[#5B6A71]">IIT Madras Research Park, Taramani, Chennai</span>
                </span>
              </div>
              <div className="glass glass-edge rounded-[20px] p-5">
                <span className="block font-display text-[17px] font-bold text-[#243239]">Verticals</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {VERTICALS.map((v) => (
                    <span key={v} className="rounded-full bg-white/80 border border-[#33454E]/10 px-3 py-1.5 text-[14px] font-semibold text-[#46565E]">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 grid-rows-2 gap-4 h-[420px] sm:h-[480px] reveal-stagger">
            {LIFE_PHOTOS.map((src, i) => (
              <div key={src} className={`relative rounded-[24px] overflow-hidden bg-[#DCE4E8] depth-1 ${i === 0 ? 'row-span-2' : ''}`}>
                <Image src={src} alt="Life at CUBE" fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Reports */}
      <section id="publications" className="scroll-mt-40 py-16 lg:py-20 pb-24">
        <div className="shell">
          <SectionHeading eyebrow="Reports" title="Reports & publications" action={{ href: '/media/publications', label: 'All reports' }} />
          <ReportList reports={cubeReports} />
        </div>
      </section>

    </div>
  );
}
