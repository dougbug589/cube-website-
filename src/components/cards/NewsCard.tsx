import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/**
 * News card used on Media, News and under each article: photo with the date
 * on a tinted chip, category, title and summary in legible sizes. The whole
 * card is the link.
 */
export type NewsLike = {
  id?: string;
  slug?: string;
  title: string;
  date?: string;
  category?: string;
  summary?: string;
  excerpt?: string;
  image?: string;
};

export const newsHref = (n: NewsLike) => `/media/news/${n.slug || n.id}`;

export default function NewsCard({ item, priority = false }: { item: NewsLike; priority?: boolean }) {
  const text = item.summary || item.excerpt;
  return (
    <Link href={newsHref(item)} className="press group glass glass-interactive glass-edge rounded-[26px] overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1F22]">
        <Image
          src={item.image || '/images/about/about_about.jpg'}
          alt={item.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {item.date && (
          <span className="chip-photo absolute top-3 left-3 rounded-full px-3 py-1 text-[13.5px] font-bold text-white">{item.date}</span>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        {item.category && <p className="text-[14.5px] font-bold text-[#D89F03]">{item.category}</p>}
        <h3 className="mt-1.5 font-display text-[19px] lg:text-[20px] font-bold text-[#F3F5F6] leading-snug line-clamp-3">{item.title}</h3>
        {text && <p className="mt-2.5 text-[18px] text-[#C2CCD1] leading-relaxed line-clamp-3">{text}</p>}
        <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-[15.5px] font-bold text-[#F3F5F6] group-hover:text-[#D89F03] transition-colors">
          Read more <ArrowUpRight size={16} strokeWidth={2.25} />
        </span>
      </div>
    </Link>
  );
}
