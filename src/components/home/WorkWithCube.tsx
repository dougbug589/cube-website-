'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Building2, FileText, Users, MapPin, Mail, Phone } from 'lucide-react';
import { contactInfo } from '@/data/contact';

/**
 * Work with CUBE — "three doors".
 * Visitors choose by intent (project, tender, career) instead of reading a
 * contact block. A slim glass strip below carries the office details.
 */

const DOORS = [
  {
    href: '/contact',
    Icon: Building2,
    title: 'Start a project',
    text: 'Consultancy, quality assurance or a planning study for your project.',
    cta: 'Contact the Centre',
  },
  {
    href: '/tenders',
    Icon: FileText,
    title: 'Bid on a tender',
    text: 'Open tenders, expressions of interest and empanelment notices.',
    cta: 'View tenders',
  },
  {
    href: '/careers',
    Icon: Users,
    title: 'Join the team',
    text: 'See current openings at CUBE and apply online.',
    cta: 'View careers',
  },
];

export default function WorkWithCube() {
  return (
    <section id="work-with-cube" className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl reveal">
          <p className="label-mono">Work with CUBE</p>
          <h2 className="headline-light text-3xl sm:text-4xl lg:text-[2.75rem] text-[#243239] mt-3">
            Bring a project, a tender, or a question.
          </h2>
        </div>

        <div className="mt-12 grid gap-4 lg:gap-5 md:grid-cols-3 reveal-stagger">
          {DOORS.map(({ href, Icon, title, text, cta }) => (
            <Link
              key={href}
              href={href}
              className="press group glass glass-interactive glass-edge rounded-[28px] p-7 lg:p-8 min-h-[280px] flex flex-col"
            >
              <span className="grid place-items-center w-14 h-14 rounded-[18px] bg-gradient-to-b from-[#F8E3A3] to-[#F0C468] text-[#243239] depth-1">
                <Icon size={24} strokeWidth={2} />
              </span>
              <span className="mt-6 font-display text-[24px] font-extrabold text-[#243239] leading-tight">{title}</span>
              <span className="mt-2 text-[16.5px] text-[#46565E] leading-relaxed">{text}</span>
              <span className="mt-auto pt-8 flex items-center justify-between">
                <span className="text-[16px] font-bold text-[#243239] group-hover:text-[#9A7015] transition-colors duration-500">{cta}</span>
                <span className="grid place-items-center w-11 h-11 rounded-full bg-white border border-[#33454E]/10 text-[#243239] depth-1 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[#F0C468] group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ArrowUpRight size={18} strokeWidth={2.25} />
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* office details: one slim glass strip */}
        <div className="mt-5 liquid-glass rounded-[24px] px-6 py-5 lg:px-8 flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 reveal">
          <div className="flex items-start gap-3 min-w-0 lg:flex-1">
            <MapPin size={19} strokeWidth={2} className="text-[#C4921B] mt-0.5 shrink-0" />
            <span className="text-[16px] text-[#46565E] leading-relaxed">{contactInfo.address}</span>
          </div>
          <span aria-hidden className="hidden lg:block w-px h-8 bg-[#33454E]/10" />
          <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-[16.5px] font-bold text-[#243239] hover:text-[#9A7015] transition-colors">
            <Mail size={19} strokeWidth={2} className="text-[#C4921B] shrink-0" />
            {contactInfo.email}
          </a>
          <span aria-hidden className="hidden lg:block w-px h-8 bg-[#33454E]/10" />
          <a
            href={`tel:${String(contactInfo.phone).replace(/\s+/g, '')}`}
            className="flex items-center gap-3 text-[16.5px] font-bold text-[#243239] hover:text-[#9A7015] transition-colors whitespace-nowrap"
          >
            <Phone size={19} strokeWidth={2} className="text-[#C4921B] shrink-0" />
            {contactInfo.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
