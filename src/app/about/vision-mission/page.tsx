import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Compass, Target } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Vision & Mission | CUBE IIT Madras',
  description: 'Vision and mission of CUBE – Centre for Urbanization, Buildings & Environment (IIT Madras & Govt of Tamil Nadu).',
};

// The original site lists the mission as separate points.
const MISSION = aboutContent.mission
  .split(';')
  .map((m) => m.trim().replace(/\.$/, ''))
  .filter(Boolean)
  .map((m) => m.charAt(0).toUpperCase() + m.slice(1));

export default function VisionMissionPage() {
  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="About"
        title="Vision & Mission"
        description="CUBE's vision and the mission that guides its work."
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'Vision & Mission' }]}
      />

      {/* Vision: one large statement in a raised glass panel */}
      <section className="shell">
        <div className="liquid-glass relative rounded-[34px] depth-3 p-8 sm:p-12 lg:p-16 overflow-hidden reveal">
          <div aria-hidden className="absolute -top-24 -right-16 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(246, 194, 46,0.28),transparent_70%)] blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-b from-[#F6C22E]/35 to-[#F6C22E]/20 text-[#F3F5F6] depth-1">
              <Compass size={22} strokeWidth={2} />
            </span>
            <p className="label-mono">Vision</p>
          </div>
          <p className="relative mt-7 font-display text-[26px] sm:text-[32px] lg:text-[38px] font-bold leading-[1.35] text-[#F3F5F6] max-w-5xl">
            {aboutContent.vision}
          </p>
        </div>
      </section>

      {/* Mission: numbered points */}
      <section className="shell py-14 lg:py-20 pb-24">
        <div className="flex items-center gap-3 mb-8 reveal">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#F6C22E]/15 text-[#F6C22E] depth-1">
            <Target size={22} strokeWidth={2} />
          </span>
          <h2 className="headline-light text-3xl sm:text-[2.4rem] text-[#F3F5F6]">Mission</h2>
        </div>
        <ol className="grid md:grid-cols-2 gap-4 lg:gap-5 reveal-stagger">
          {MISSION.map((m, i) => (
            <li key={m} className="glass glass-interactive glass-edge rounded-[26px] p-6 lg:p-7 flex items-start gap-5">
              <span className="font-display text-[30px] font-extrabold leading-none text-[#F6C22E] tabular-nums shrink-0 w-11">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-[18px] leading-relaxed text-[#F3F5F6] font-medium">{m}</span>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3 reveal">
          <Link href="/about/objectives" className="press btn-gold gold-shimmer inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold">
            Objectives <ArrowUpRight size={16} strokeWidth={2.25} />
          </Link>
          <Link href="/about/core-values" className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold">
            Core values <ArrowUpRight size={16} strokeWidth={2.25} />
          </Link>
        </div>
      </section>
    </div>
  );
}
