'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/**
 * News strip under the hero (the original site leads with News).
 * Liquid-glass bar, gold label, headlines scrolling continuously.
 * The track holds the list twice and moves -50% (transform only), so it
 * loops seamlessly; hovering pauses it; reduced motion stops it.
 */

type NewsLike = { id?: string; slug?: string; title: string; date?: string; category?: string };

export default function NewsTicker({ items }: { items: NewsLike[] }) {
  const list = items.filter((n) => n.title).slice(0, 8);
  if (list.length === 0) return null;
  const loop = [...list, ...list];

  return (
    <div className="relative shell mt-5">
      <div className="liquid-glass is-solid depth-1 rounded-[22px] h-14 flex items-center overflow-hidden">
        <Link
          href="/media/news"
          className="press shrink-0 h-full flex items-center gap-2 pl-5 pr-4 font-display text-[16.5px] font-extrabold text-[#F3F5F6] border-r border-white/10"
        >
          <span className="w-2 h-2 rounded-full bg-[#F6C22E] shadow-[0_0_10px_#F6C22E] animate-pulse" />
          News
        </Link>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]">
          <ul
            className="flex w-max items-center animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
            style={{ animationDuration: `${Math.max(40, list.length * 9)}s` }}
          >
            {loop.map((n, i) => (
              <li key={`${n.id || n.title}-${i}`} aria-hidden={i >= list.length || undefined} className="shrink-0">
                <Link
                  href={n.slug || n.id ? `/media/news/${n.slug || n.id}` : '/media/news'}
                  tabIndex={i >= list.length ? -1 : undefined}
                  className="group inline-flex items-center gap-3 px-6 text-[16.5px] whitespace-nowrap"
                >
                  {n.date && <span className="text-[15px] font-bold text-[#F6C22E] tabular-nums">{n.date}</span>}
                  <span className="font-semibold text-[#F3F5F6] group-hover:text-[#F6C22E] transition-colors">{n.title}</span>
                  <ArrowUpRight size={14} className="text-[#F6C22E] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span aria-hidden className="ml-3 w-1 h-1 rounded-full bg-white/20" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/media/news"
          className="press hidden sm:inline-flex shrink-0 items-center gap-1.5 h-9 mr-2.5 px-4 rounded-full btn-soft text-[16px] font-bold"
        >
          All news
        </Link>
      </div>
    </div>
  );
}
