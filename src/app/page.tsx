'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MapPin, Mail, Phone, Landmark, ShieldCheck, FlaskConical } from 'lucide-react';

import EtihadHero from '@/components/hero/EtihadHero';
import StackedProjectCarousel from '@/components/home/StackedProjectCarousel';
import VerticalShowcase from '@/components/home/VerticalShowcase';
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
import { contactInfo } from '@/data/contact';

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
  { Icon: FlaskConical, k: 'Applied', v: 'Consultancy, quality assurance and environmental testing for public projects.' },
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
          clientsData.map((c: any) => ({ ...c, category: c.category || 'Public Sector', logo: c.logo || c.logoUrl || '' }))
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
          <div className="lg:col-span-5 liquid-glass rounded-[28px] p-8 lg:p-10 flex flex-col reveal">
            <p className="label-mono">Our vision</p>
            <p className="mt-4 font-display text-2xl lg:text-[28px] font-bold leading-snug text-[#243239]">
              The most trusted provider of applied research, engineering and consultancy for India&apos;s built environment.
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

          <ul className="lg:col-span-7 grid sm:grid-cols-3 gap-4 lg:gap-5 reveal-stagger">
            {ABOUT_POINTS.map((pt) => (
              <li key={pt.k} className="glass glass-interactive glass-edge rounded-[24px] p-6 lg:p-7 flex flex-col">
                <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[#F7EDD3] text-[#9A7015] depth-1">
                  <pt.Icon size={20} strokeWidth={2} />
                </span>
                <p className="mt-5 font-display text-[19px] font-bold text-[#243239] leading-snug">{pt.k}</p>
                <p className="mt-2 text-[15px] text-[#5B6A71] leading-relaxed">{pt.v}</p>
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
        eyebrow="Four verticals"
        title="One faculty bench, four engineering disciplines."
        lead="Each vertical pairs IIT Madras faculty with field engineers for consultancy, assurance and applied research."
        action={{ href: '/verticals', label: 'All verticals' }}
      >
        <div className="reveal">
          <VerticalShowcase verticals={verticalList} />
        </div>
      </Section>

      {/* 06 · CEL laboratory */}
      <Section
        id="cel"
        eyebrow="CUBE Environmental Laboratory"
        title={celOverview.subtitle}
        action={{ href: '/cel', label: 'Testing services' }}
      >
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-5 reveal">
            <p className="text-[16px] leading-relaxed text-[#46565E]">{celOverview.description}</p>
            <ol className="mt-8 border-t border-[#33454E]/15">
              {celOverview.facilities.slice(0, 6).map((f, i) => (
                <li key={f} className="flex items-baseline gap-4 py-3.5 border-b border-[#33454E]/15 text-[15px] text-[#33454E]">
                  <span className="label-mono w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span>{f}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4 reveal-stagger">
            {celServiceList.slice(0, 4).map((s) => (
              <Link key={s.id || s.title} href={s.id ? `/cel#${s.id}` : '/cel'} className="glass glass-interactive glass-edge p-5 lg:p-6 flex flex-col">
                <p className="label-mono">{s.category}</p>
                <h3 className="mt-2 text-base font-bold text-[#243239] leading-snug">{s.title}</h3>
                <p className="mt-2 text-[14px] text-[#5B6A71] leading-relaxed line-clamp-3">{s.description}</p>
                {Array.isArray(s.parameters) && s.parameters.length > 0 && (
                  <p className="mt-auto pt-4 border-t border-[#33454E]/15 text-[13px] text-[#46565E] line-clamp-1">
                    {s.parameters.slice(0, 2).join(' · ')}
                  </p>
                )}
              </Link>
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

      {/* 08 · Contact */}
      <section className="relative py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="glass-strong glass-blur ambient-glow p-8 sm:p-10 lg:p-14 grid lg:grid-cols-12 gap-10 items-center reveal">
            <div className="lg:col-span-7">
              <p className="label-mono">Work with CUBE</p>
              <h2 className="headline-light text-3xl sm:text-4xl lg:text-[2.75rem] text-[#243239] mt-3">
                Bring a project, a tender, or a question.
              </h2>
              <p className="mt-4 text-[16px] text-[#46565E] leading-relaxed max-w-xl">{contactInfo.centerOfExcellence}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold gold-shimmer btn-gold">
                  Contact the Centre <ArrowUpRight size={15} />
                </Link>
                <Link href="/tenders" className="inline-flex items-center gap-2 h-12 px-6 rounded-full btn-soft text-[16px] font-bold">
                  Open tenders
                </Link>
              </div>
            </div>
            <dl className="lg:col-span-5 space-y-5 text-[15px]">
              <div className="flex gap-3">
                <MapPin size={16} strokeWidth={1.5} className="text-[#C4921B] mt-0.5 shrink-0" />
                <dd className="text-[#46565E] leading-relaxed">{contactInfo.address}</dd>
              </div>
              <div className="flex gap-3">
                <Mail size={16} strokeWidth={1.5} className="text-[#C4921B] mt-0.5 shrink-0" />
                <dd>
                  <a href={`mailto:${contactInfo.email}`} className="text-[#243239] hover:text-[#9A7015] transition-colors">{contactInfo.email}</a>
                </dd>
              </div>
              <div className="flex gap-3">
                <Phone size={16} strokeWidth={1.5} className="text-[#C4921B] mt-0.5 shrink-0" />
                <dd>
                  <a href={`tel:${String(contactInfo.phone).replace(/\s+/g, '')}`} className="text-[#243239] hover:text-[#9A7015] transition-colors">{contactInfo.phone}</a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
