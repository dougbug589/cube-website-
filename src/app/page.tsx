'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Landmark, ShieldCheck, FlaskConical } from 'lucide-react';

import EtihadHero from '@/components/hero/EtihadHero';
import StackedProjectCarousel from '@/components/home/StackedProjectCarousel';
import VerticalShowcase from '@/components/home/VerticalShowcase';
import WorkWithCube from '@/components/home/WorkWithCube';
import PartnersSection from '@/components/home/PartnersSection';
import NewsTicker from '@/components/home/NewsTicker';
import HomeBento from '@/components/home/HomeBento';
import { cubeEvents } from '@/data/media';

import { CMS_UPDATED_EVENT } from '@/lib/live';
import { verticals as fallbackVerticals } from '@/data/verticals';
import { projects as fallbackProjects } from '@/data/projects';
import { celOverview } from '@/data/cel';
import { boardMembers as fallbackBoardMembers, executiveLeadership } from '@/data/leadership';
import { newsItems as fallbackNewsItems } from '@/data/news';
import { clients as fallbackClients } from '@/data/clients';

const LIFE_SHOTS = [
  { image: '/images/life-at-cube/about_life.jpg' },
  { image: '/images/life-at-cube/about_life1.jpg' },
  { image: '/images/life-at-cube/about_life2.jpg' },
  { image: '/images/hero/slides_building-training-team.jpg' },
];

const MEDIA_SHOTS = cubeEvents
  .filter((e) => e.image)
  .slice(0, 6)
  .map((e) => ({ image: e.image, title: e.title, date: e.date }));

const ABOUT_POINTS = [
  { Icon: Landmark, k: 'Est. 2017', v: 'Centre of Excellence of the Government of Tamil Nadu, with IIT Madras.' },
  { Icon: ShieldCheck, k: 'Independent', v: 'Governing body chaired by the IIT Madras Director, with state and industry members.' },
  { Icon: FlaskConical, k: 'Applied', v: 'Applied research, technology and consultancy, with its own environment laboratory (CEL).' },
];

const fallbackCeo = executiveLeadership.find((l) => (l.role || '').toUpperCase().includes('CEO'));
const fallbackLeadershipList: any[] = fallbackCeo
  ? [{ ...fallbackCeo, category: 'CEO' }, ...fallbackBoardMembers]
  : fallbackBoardMembers;

/* ───────────────────────── shared section primitive ───────────────────────── */

function Section({
  id,
  eyebrow,
  title,
  lead,
  action,
  children,
  band = false,
}: {
  band?: boolean;
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`relative py-20 lg:py-28 ${band ? 'band-mist' : ''}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16 reveal">
          <div className="max-w-2xl">
            <p className="label-mono">{eyebrow}</p>
            <h2 className="headline-light text-3xl sm:text-4xl lg:text-[2.75rem] text-[#243239] mt-3">{title}</h2>
            {lead && <p className="mt-4 text-[16px] text-[#46565E] leading-relaxed">{lead}</p>}
          </div>
          {action && (
            <Link
              href={action.href}
              className="group inline-flex items-center gap-2 text-sm text-[#243239] shrink-0 border-b border-[#C4921B] pb-1 hover:text-[#9A7015] transition-colors"
            >
              {action.label}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ───────────────────────────────── page ───────────────────────────────── */

export default function HomePage() {
  const [projectList, setProjectList] = useState<any[]>(fallbackProjects);
  const [verticalList, setVerticalList] = useState<any[]>(fallbackVerticals);
  const [celServiceList, setCelServiceList] = useState<any[]>(celOverview.testingServices);
  const [boardList, setBoardList] = useState<any[]>(fallbackLeadershipList);
  const [clientList, setClientList] = useState<any[]>(fallbackClients);
  const [newsList, setNewsList] = useState<any[]>(fallbackNewsItems);

  // Live CMS data with bundled fallbacks (same contract with the admin as before).
  useEffect(() => {
    let active = true;
    const getJson = async (url: string) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    };
    const load = async () => {
      const [projectsData, verticalsData, celData, teamData, clientsData, newsData] = await Promise.all([
        getJson('/api/public/projects'),
        getJson('/api/public/verticals'),
        getJson('/api/public/cel'),
        getJson('/api/public/team'),
        getJson('/api/public/clients'),
        getJson('/api/public/news'),
      ]);
      if (!active) return;
      if (Array.isArray(projectsData)) setProjectList(projectsData);
      if (Array.isArray(verticalsData)) setVerticalList(verticalsData);
      if (Array.isArray(celData)) setCelServiceList(celData);
      if (Array.isArray(teamData)) {
        const norm = (m: any) => ({
          ...m,
          role: m.designation || m.role || '',
          organization: m.organization || m.department || 'IIT Madras',
        });
        const board = teamData.filter((m: any) => m.category === 'board').map(norm);
        const leadership = teamData.filter((m: any) => m.category === 'leadership').map(norm);
        const ceo = leadership.find((l: any) => (l.role || '').toUpperCase().includes('CEO'));
        setBoardList(ceo ? [{ ...ceo, category: 'CEO' }, ...board] : board.length ? board : leadership);
      }
      if (Array.isArray(clientsData)) {
        setClientList(
          clientsData.map((c: any) => ({ ...c, logo: c.logo || c.logoUrl || '' }))
        );
      }
      if (Array.isArray(newsData)) {
        setNewsList(newsData.map((n: any) => ({ ...n, summary: n.summary || n.excerpt || '' })));
      }
    };
    load();
    window.addEventListener(CMS_UPDATED_EVENT, load);
    window.addEventListener('focus', load);
    return () => {
      active = false;
      window.removeEventListener(CMS_UPDATED_EVENT, load);
      window.removeEventListener('focus', load);
    };
  }, []);

  const logos = useMemo(() => clientList.filter((c) => c.logo), [clientList]);

  return (
    <div className="flex flex-col min-h-screen text-[#243239]">
      {/* 01 · Hero */}
      <EtihadHero />

      {/* 02 · News — the original site leads with News right under the hero */}
      <NewsTicker items={newsList} />

      {/* 03 · About — essentials only; the full story lives on /about */}
      <Section
        id="about"
        eyebrow="About CUBE"
        title="Academic depth, delivered as public infrastructure."
        action={{ href: '/about', label: 'About the Centre' }}
      >
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-7 liquid-glass rounded-[28px] p-8 lg:p-10 flex flex-col reveal">
            <p className="label-mono">Our vision</p>
            <p className="mt-4 font-display text-xl lg:text-[22px] font-bold leading-snug text-[#243239]">
              To be the most acclaimed and trustworthy provider of Applied Research, Technology, Engineering &amp; Consultancy Services with National footprint, in association with IIT Madras, delivering effective and measurable value in built environment aiming at future equipped and sustainable human habitats.
            </p>
            <div className="mt-auto pt-8 flex flex-wrap gap-3">
              <Link href="/about#governing-board" className="press btn-gold gold-shimmer inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold">
                Governing board <ArrowUpRight size={16} strokeWidth={2.25} />
              </Link>
              <Link href="/about#our-team" className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold">
                Our team
              </Link>
            </div>
          </div>

          {/* compact rows stacked beside the vision card: no empty card bottoms */}
          <ul className="lg:col-span-5 grid gap-4 lg:gap-5 content-between reveal-stagger">
            {ABOUT_POINTS.map((pt) => (
              <li key={pt.k} className="glass glass-interactive glass-edge rounded-[24px] p-5 lg:p-6 flex items-start gap-4">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#F7EDD3] text-[#9A7015] depth-1 shrink-0">
                  <pt.Icon size={21} strokeWidth={2} />
                </span>
                <span>
                  <span className="block font-display text-[19px] font-bold text-[#243239] leading-snug">{pt.k}</span>
                  <span className="mt-1 block text-[16.5px] text-[#5B6A71] leading-relaxed">{pt.v}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 04 · Featured projects (stacked carousel on constellation) */}
      <section className="relative pb-16 lg:pb-24 overflow-hidden">
        <svg aria-hidden className="absolute inset-x-0 top-0 w-full h-72 opacity-40 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1400 300">
          <g stroke="#C4921B" strokeWidth="0.6" fill="none" opacity="0.55">
            <path d="M 100 40 L 320 120 L 560 60 L 780 150" />
            <path d="M 320 120 L 460 200 L 700 160 L 980 80" />
            <path d="M 780 150 L 980 80 L 1200 140 L 1380 90" />
          </g>
          <g fill="#C4921B" opacity="0.7">
            {[[100, 40], [320, 120], [560, 60], [780, 150], [460, 200], [700, 160], [980, 80], [1200, 140], [1380, 90]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="1.8" />
            ))}
          </g>
        </svg>
        <div className="relative px-5 sm:px-8 lg:px-16 pt-4 lg:pt-8 reveal">
          <p className="label-mono">Applied execution</p>
          <h2 className="headline-light text-3xl lg:text-4xl mt-3">
            Projects across <span className="gold-keyword">Tamil Nadu</span> &amp; beyond
          </h2>
          <p className="text-sm text-[#46565E] mt-3">Third-party quality assurance, PMC and proof checking for public infrastructure.</p>
        </div>
        <div className="mt-6 reveal">
          <StackedProjectCarousel projects={projectList} />
        </div>
      </section>

      {/* 05 · Verticals — auto-advancing showcase */}
      <Section
        id="verticals"
        band
        eyebrow="Verticals"
        title="Four verticals."
        action={{ href: '/verticals', label: 'All verticals' }}
      >
        <div className="reveal">
          <VerticalShowcase verticals={verticalList} />
        </div>
      </Section>

      {/* 06 · CEL laboratory — the home page text from cubeiitm.org */}
      <Section
        id="cel"
        eyebrow="CEL"
        title="CUBE Environmental Laboratory."
        action={{ href: '/cel', label: 'About the laboratory' }}
      >
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 reveal">
            <p className="text-[19px] leading-relaxed text-[#243239]">{celOverview.subtitle}</p>
            <div className="mt-7 grid grid-cols-3 gap-3 reveal-stagger">
              {celServiceList.slice(0, 3).map((s) => (
                <div key={s.id || s.title} className="glass rounded-[20px] px-4 py-4 text-center">
                  <span className="text-[16.5px] font-bold text-[#243239]">{s.title}</span>
                </div>
              ))}
            </div>
            <a
              href={celOverview.website}
              target="_blank"
              rel="noopener noreferrer"
              className="press btn-soft mt-7 inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold"
            >
              Visit the CEL website <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 reveal">
            {['/images/cel/about_cel.jpg', '/images/cel/about_cel1.jpg', '/images/cel/about_cel2.jpg'].map((src, i) => (
              <div key={src} className={`relative rounded-[24px] overflow-hidden depth-2 bg-[#DCE4E8] ${i === 0 ? 'col-span-2 h-60' : 'h-40'}`}>
                <Image src={src} alt="CUBE Environmental Laboratory" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 07 · Life at CUBE · Leadership · Media · Clients (original's tile block) */}
      <Section
        id="life-at-cube"
        eyebrow="Inside CUBE"
        title="People, leadership and the work in the field."
        action={{ href: '/media', label: 'Media centre' }}
      >
        <div className="reveal">
          <HomeBento
            life={LIFE_SHOTS}
            leaders={boardList.filter((m) => m.image)}
            media={MEDIA_SHOTS}
            clients={logos}
          />
        </div>
      </Section>

      {/* 08 · Partners */}
      <PartnersSection clientCount={logos.length} />

      {/* 09 · Work with CUBE — three doors */}
      <WorkWithCube />
    </div>
  );
}
