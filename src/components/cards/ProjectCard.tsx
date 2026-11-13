'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

const SHORT: Record<string, string> = {
  'Building & Construction': 'Buildings',
  'Environment & Sustainability': 'Environment',
  'Urban Planning & Transportation': 'Urban Planning',
  'Smart Cities': 'Smart Cities',
};

/**
 * Image-led project card: photo with glass chips (vertical, status), then
 * title, client and location. Details live on the project page.
 */
export default function ProjectCard({ project }: ProjectCardProps) {
  const p = project as any;
  const href = `/projects/${p.slug || p.id || ''}`;
  const meta = [p.client, p.location].filter(Boolean).join(' · ');

  return (
    <Link href={href} className="press group glass glass-interactive glass-edge rounded-[26px] overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1F22]">
        <Image
          src={p.heroImage || '/images/about/about_about.jpg'}
          alt={p.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="chip-photo rounded-full px-3 py-1 text-[13.5px] font-bold text-white">{SHORT[p.category] || p.category}</span>
          {p.projectStatus && (
            <span className="chip-photo rounded-full px-3 py-1 text-[13.5px] font-bold text-white">{p.projectStatus}</span>
          )}
        </div>
      </div>
      <div className="p-5 lg:p-6 flex-1 flex flex-col">
        <h3 className="font-display text-[19px] lg:text-[20px] font-bold text-[#F3F5F6] leading-snug line-clamp-3">{p.title}</h3>
        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <span className="text-[15.5px] font-medium text-[#A7B2B8] leading-snug line-clamp-2">{meta}</span>
          <span className="grid place-items-center w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 text-[#F3F5F6] depth-1 shrink-0 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[#D89F03]/35 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight size={17} strokeWidth={2.25} />
          </span>
        </div>
      </div>
    </Link>
  );
}
