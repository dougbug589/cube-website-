'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { partners } from '@/data/partners';

/**
 * Partners — featured logo tiles with a gentle, staggered float, plus a
 * client-count card that links to the full clients page. (Client logos
 * already cycle in the "Inside CUBE" grid, so they are not repeated here.)
 * Float is transform-only and stops for reduced motion.
 */

// Placeholder names in the data ("Partner Organization 1") are not real
// organisation names, so they are not announced as such.
const altFor = (name: string) => (/^partner organi[sz]ation\s*\d+$/i.test(name.trim()) ? 'Partner logo' : name);

export default function PartnersSection({ clientCount }: { clientCount: number }) {
  const list = partners.filter((p) => p.logo);

  return (
    <section id="partners" className="relative py-20 lg:py-24 band-mist">
      <div className="shell">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 reveal">
          <div className="max-w-2xl">
            <p className="label-mono">Partners</p>
            <h2 className="headline-light text-3xl sm:text-4xl lg:text-[2.75rem] text-[#F3F5F6] mt-3">Partners and collaborators.</h2>
          </div>
          <Link
            href="/about/clients"
            className="group inline-flex items-center gap-2 text-[16px] font-bold text-[#F3F5F6] shrink-0 border-b-2 border-[#D89F03] pb-1 hover:text-[#D89F03] transition-colors"
          >
            Clients &amp; partners
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5 reveal-stagger">
          {/* client count card */}
          <li>
            <Link
              href="/about/clients"
              className="press group glass-interactive h-full min-h-[180px] rounded-[24px] p-6 flex flex-col justify-between bg-gradient-to-b from-[#D89F03]/35 to-[#D89F03]/20 border border-[#D89F03]/25 depth-1"
            >
              <span className="text-[15px] font-bold text-[#F3F5F6]/80">Clients served</span>
              <span className="flex items-end justify-between">
                <span className="font-display text-[44px] font-extrabold leading-none text-[#F3F5F6]">{clientCount}</span>
                <ArrowUpRight size={22} strokeWidth={2.25} className="text-[#F3F5F6] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
            </Link>
          </li>

          {list.map((p, i) => (
            <li key={p.logo} className="partner-float" style={{ animationDelay: `${(i % 4) * -1.6}s` }}>
              <div className="glass-interactive h-full min-h-[180px] rounded-[24px] bg-white border border-white/[0.09] depth-1 grid place-items-center p-3">
                <div className="relative w-full h-[156px]">
                  <Image src={p.logo} alt={altFor(p.name)} fill sizes="(max-width: 640px) 45vw, 300px" className="object-contain" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
