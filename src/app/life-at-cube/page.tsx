import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Quote } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { teamMembers } from '@/data/team';

export const metadata = {
  title: 'Life at CUBE | CUBE IIT Madras',
  description: "CUBE's office and laboratory at the IIT Madras Research Park, Chennai.",
};

// CUBE's own photos of its office and team.
const PHOTOS = [
  { src: '/images/hero/slides_building-training-team.jpg', alt: 'The CUBE team' },
  { src: '/images/life-at-cube/about_life.jpg', alt: 'The CUBE office' },
  { src: '/images/life-at-cube/about_life1.jpg', alt: 'A meeting at CUBE' },
  { src: '/images/life-at-cube/about_life2.jpg', alt: 'The CUBE office' },
  { src: '/images/about/about_about.jpg', alt: 'The CUBE office at the IIT Madras Research Park' },
];
const SPAN = ['md:col-span-2 md:row-span-2', '', '', '', ''];

// From the Career page of cubeiitm.org.
const ABOUT_TEAM =
  'What sets us apart is what brings us together – a shared passion for solving business challenges through strategy, design, and engineering. We are the sum total of our team, their unique perspectives, capabilities, and our ability to collaborate from ideation to deployment.';

export default function LifeAtCubePage() {
  const staff = teamMembers.filter((m: any) => !['leadership', 'board', 'advisory'].includes((m as any).category)).length;

  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader
        badge="Life at CUBE"
        title="Life at CUBE"
        description="CUBE's office and laboratory at the IIT Madras Research Park, Chennai."
        breadcrumbs={[{ label: 'Media', href: '/media' }, { label: 'Life at CUBE' }]}
      />

      {/* photo mosaic */}
      <section className="shell">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-[220px] lg:auto-rows-[260px] grid-flow-dense gap-4 reveal-stagger">
          {PHOTOS.map((p, i) => (
            <figure key={p.src} className={`group relative rounded-[26px] overflow-hidden bg-[#DCE4E8] depth-1 ${SPAN[i]}`}>
              <Image
                src={p.src}
                alt={p.alt}
                fill
                priority={i === 0}
                sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
              />
            </figure>
          ))}
        </div>
      </section>

      {/* the team, in CUBE's words */}
      <section className="shell py-16 lg:py-20 grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        <blockquote className="lg:col-span-8 liquid-glass rounded-[30px] depth-2 p-8 sm:p-12 reveal">
          <Quote size={28} className="text-[#C4921B]" />
          <p className="mt-5 font-display text-[22px] sm:text-[27px] font-bold leading-[1.45] text-[#243239]">{ABOUT_TEAM}</p>
        </blockquote>
        <div className="lg:col-span-4 grid gap-4 reveal-stagger">
          <div className="glass glass-edge rounded-[26px] p-7">
            <p className="font-display text-[56px] font-extrabold leading-none text-[#243239] tabular-nums">{staff}</p>
            <p className="mt-2 text-[19.5px] font-semibold text-[#2B3A41]">people in the CUBE team</p>
          </div>
          <div className="glass glass-edge rounded-[26px] p-7 flex items-start gap-4">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#F7EDD3] text-[#9A7015] depth-1 shrink-0">
              <MapPin size={21} strokeWidth={2} />
            </span>
            <span>
              <span className="block font-display text-[19px] font-bold text-[#243239]">IIT Madras Research Park</span>
              <span className="mt-1 block text-[18px] text-[#3B4B53]">Office and CUBE Environmental Laboratory, Taramani, Chennai</span>
            </span>
          </div>
        </div>
      </section>

      {/* next steps */}
      <section className="shell pb-24">
        <div className="grid md:grid-cols-2 gap-4 lg:gap-5 reveal-stagger">
          <Link href="/careers" className="press group glass glass-interactive glass-edge rounded-[28px] p-8 flex items-center justify-between gap-6">
            <span>
              <span className="label-mono">Careers</span>
              <span className="mt-2 block font-display text-[26px] font-extrabold text-[#243239]">Join the team</span>
              <span className="mt-1 block text-[18px] text-[#4B5A61]">See current openings and apply online.</span>
            </span>
            <span className="grid place-items-center w-12 h-12 rounded-full bg-gradient-to-b from-[#F8E3A3] to-[#F0C468] text-[#243239] depth-1 shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowUpRight size={20} strokeWidth={2.25} />
            </span>
          </Link>
          <Link href="/about/team" className="press group glass glass-interactive glass-edge rounded-[28px] p-8 flex items-center justify-between gap-6">
            <span>
              <span className="label-mono">Our Team</span>
              <span className="mt-2 block font-display text-[26px] font-extrabold text-[#243239]">Meet the team</span>
              <span className="mt-1 block text-[18px] text-[#4B5A61]">Staff across every vertical and administration.</span>
            </span>
            <span className="grid place-items-center w-12 h-12 rounded-full bg-white border border-[#33454E]/10 text-[#243239] depth-1 shrink-0 transition-[transform,background-color] duration-500 group-hover:bg-[#F0C468] group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowUpRight size={20} strokeWidth={2.25} />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
