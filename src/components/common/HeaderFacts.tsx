'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import FACTS from '@/data/header-facts.json';

/**
 * The right side of inner-page headers: a quiet, static frosted-glass card
 * with facts about THIS page (e.g. project counts by vertical on /projects,
 * phone and email on /contact, the project's client and status on a project
 * page). Per-page facts are generated at build time by
 * scripts/header-facts.mjs from the hosted content, so the figures match the
 * pages. Pages can pass their own `facts`; anything else falls back to CUBE's
 * identity. Wide screens only, where the space exists.
 */

export type HeaderFactsData = { label: string; rows: [string, string][] };
const TABLE = FACTS as unknown as Record<string, HeaderFactsData>;

const IDENTITY: HeaderFactsData = {
  label: 'Centre of Excellence',
  rows: [
    ['Partners', 'IIT Madras · Government of Tamil Nadu'],
    ['Established', 'May 2017'],
    ['Based at', 'IIT Madras Research Park, Chennai'],
  ],
};

function lookup(path: string): HeaderFactsData | undefined {
  if (TABLE[path]) return TABLE[path];
  // dynamic routes: /media/news/<slug> -> /media/news/[slug]
  const parent = path.replace(/\/[^/]+$/, '');
  return TABLE[`${parent}/[slug]`];
}

export default function HeaderFacts({ facts }: { facts?: HeaderFactsData }) {
  const path = (usePathname() || '').replace(/\/$/, '') || '/';
  const data = facts ?? lookup(path) ?? IDENTITY;
  const rows = data.rows.filter(([, v]) => v && String(v).trim());

  return (
    <aside
      aria-label={data.label}
      className="hidden min-[1400px]:block liquid-glass rounded-[24px] px-6 py-5"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="label-mono">{data.label}</p>
        <span className="relative w-10 h-10 shrink-0 opacity-90">
          <Image src="/images/branding/cube-primary-logo.png" alt="" fill sizes="40px" className="object-contain" />
        </span>
      </div>
      <dl className="mt-3 divide-y divide-white/[0.08]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-6 py-2.5">
            <dt className="text-[15px] font-semibold text-[#A7B2B8] shrink-0">{k}</dt>
            <dd className="text-[15.5px] font-bold text-[#F3F5F6] text-right leading-snug tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
