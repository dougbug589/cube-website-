'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import SideScroller from '@/components/common/SideScroller';
import type { CubeEvent } from '@/data/media';

/**
 * Events as a horizontal timeline: a yellow rail runs left to right with a
 * dated marker over each event card; the row scrolls sideways (SideScroller:
 * wheel, drag, swipe, position bar). Newest first.
 */
export default function EventsTimeline({ events }: { events: CubeEvent[] }) {
  return (
    <SideScroller ariaLabel="Events timeline" label={`${events.length} events · newest first`}>
      {events.map((evt, i) => {
        const last = i === events.length - 1;
        return (
          <li key={evt.title} className="snap-start shrink-0 w-[78vw] sm:w-[420px] flex flex-col">
            {/* the rail: this card's stretch of it, its marker and date */}
            <div aria-hidden className="relative h-16">
              <span
                className={`absolute left-5 top-5 h-[3px] rounded-full ${
                  last ? 'right-0 bg-gradient-to-r from-[#F6C22E] to-transparent' : '-right-6 bg-[#F6C22E]'
                }`}
              />
              <span className="absolute left-0 top-0 grid place-items-center w-10 h-10 rounded-full bg-[#0B0D0E] border-[3px] border-[#F6C22E] shadow-[0_0_16px_-2px_rgba(246,194,46,0.55)]">
                <span className="w-3 h-3 rounded-full bg-[#F6C22E]" />
              </span>
            </div>
            <p className="-mt-3 mb-4 font-display text-[18px] font-extrabold tabular-nums text-[#F6C22E]">
              {evt.date ? evt.date : i === 0 ? 'Latest' : <span className="text-[#A7B2B8]">Date not stated</span>}
            </p>

            <article className="flex-1 glass glass-edge rounded-[28px] overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] bg-[#1A1F22]">
                <Image src={evt.image} alt={evt.title} fill sizes="(max-width: 640px) 78vw, 420px" quality={90} className="object-cover" draggable={false} />
                <span className="chip-photo absolute top-3 left-3 rounded-full px-3 py-1 text-[13.5px] font-bold text-white">{evt.category}</span>
              </div>
              <div className="p-6 sm:p-7 flex-1 flex flex-col">
                {evt.location && (
                  <p className="flex items-center gap-2 text-[15.5px] font-semibold text-[#C2CCD1]">
                    <MapPin size={17} className="text-[#F6C22E] shrink-0" /> {evt.location}
                  </p>
                )}
                <h2 className="mt-2 font-display text-[22px] sm:text-[24px] font-extrabold text-[#F3F5F6] leading-tight">{evt.title}</h2>
                <p className="mt-3 text-[17.5px] text-[#DDE3E6] leading-relaxed">{evt.description}</p>
                {evt.highlights && evt.highlights.length > 0 && (
                  <ul className="mt-auto pt-5 flex flex-wrap gap-2">
                    {evt.highlights.map((h) => (
                      <li key={h} className="rounded-full bg-white/[0.06] border border-white/10 px-3.5 py-1.5 text-[15.5px] font-semibold text-[#DDE3E6]">
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
    </SideScroller>
  );
}
