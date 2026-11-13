import React from 'react';
import Image from 'next/image';
import { CalendarDays, MapPin } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
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

      {/* timeline: a gold rail with one dated marker per event; cards alternate sides on wide screens */}
      <section className="shell pb-24">
        <ol className="relative">
          <span aria-hidden className="absolute left-[19px] lg:left-1/2 top-2 bottom-2 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#F6C22E] via-[#F6C22E]/50 to-transparent" />
          {cubeEvents.map((evt, i) => {
            const right = i % 2 === 1;
            return (
              <li key={evt.title} className="relative pl-14 lg:pl-0 pb-12 last:pb-0 lg:grid lg:grid-cols-2 lg:gap-16">
                {/* marker */}
                <span aria-hidden className="absolute left-[19px] lg:left-1/2 top-7 -translate-x-1/2 grid place-items-center w-10 h-10 rounded-full bg-white/[0.06] border-[3px] border-[#F6C22E] depth-1">
                  <span className="w-3 h-3 rounded-full bg-[#F6C22E]" />
                </span>
                <article className={`reveal glass glass-interactive glass-edge rounded-[28px] overflow-hidden ${right ? 'lg:col-start-2' : 'lg:col-start-1'}`}>
                  <div className="relative aspect-[16/9] bg-[#1A1F22]">
                    <Image src={evt.image} alt={evt.title} fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" />
                    <span className="chip-photo absolute top-3 left-3 rounded-full px-3 py-1 text-[13.5px] font-bold text-white">{evt.category}</span>
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-[15.5px] font-semibold text-[#C2CCD1]">
                      {evt.date && (
                        <span className="flex items-center gap-2 text-[#F6C22E] font-bold tabular-nums">
                          <CalendarDays size={17} /> {evt.date}
                        </span>
                      )}
                      {evt.location && (
                        <span className="flex items-center gap-2">
                          <MapPin size={17} className="text-[#F6C22E]" /> {evt.location}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 font-display text-[24px] sm:text-[27px] font-extrabold text-[#F3F5F6] leading-tight">{evt.title}</h2>
                    <p className="mt-3 text-[19px] text-[#DDE3E6] leading-relaxed">{evt.description}</p>
                    {evt.highlights && evt.highlights.length > 0 && (
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {evt.highlights.map((h) => (
                          <li key={h} className="rounded-full bg-white/[0.06] border border-white/10 px-3.5 py-1.5 text-[17.5px] font-semibold text-[#DDE3E6]">
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
