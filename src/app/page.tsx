'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, MapPin, Mail, Phone } from 'lucide-react';

import EtihadHero from '@/components/hero/EtihadHero';
import StackedProjectCarousel from '@/components/home/StackedProjectCarousel';
import VerticalShowcase from '@/components/home/VerticalShowcase';

import { CMS_UPDATED_EVENT } from '@/lib/live';
import { verticals as fallbackVerticals } from '@/data/verticals';
import { projects as fallbackProjects } from '@/data/projects';
import { celOverview } from '@/data/cel';
import { aboutContent } from '@/data/about';
import { boardMembers as fallbackBoardMembers, executiveLeadership } from '@/data/leadership';
import { newsItems as fallbackNewsItems } from '@/data/news';
import { clients as fallbackClients } from '@/data/clients';
import { contactInfo } from '@/data/contact';

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

  const liveProjects = useMemo(() => projectList.filter((p) => p.status !== 'archived'), [projectList]);
  const latestNews = useMemo(() => newsList.slice(0, 3), [newsList]);
  const leaders = useMemo(() => boardList.slice(0, 4), [boardList]);
  const logos = useMemo(() => clientList.filter((c) => c.logo), [clientList]);

  const facts = [
    { k: 'Mandate', v: 'Centre of Excellence', s: 'Govt of Tamil Nadu × IIT Madras' },
    { k: 'Verticals', v: String(verticalList.length).padStart(2, '0'), s: 'Engineering disciplines' },
    { k: 'Portfolio', v: String(liveProjects.length), s: 'Applied projects on record' },
    { k: 'Laboratory', v: 'CEL', s: 'Environmental testing, IITM Research Park' },
  ];

  return (
    <div className="flex flex-col min-h-screen text-[#243239]">
      {/* 01 · Hero */}
      <EtihadHero />

      {/* 02 · Featured projects (stacked carousel on constellation) */}
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

      {/* 03 · Facts strip */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="hairline" />
          <dl className="grid grid-cols-2 lg:grid-cols-4 reveal-stagger">
            {facts.map((f, i) => (
              <div
                key={f.k}
                className={`py-8 lg:py-10 px-4 lg:px-8 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''} border-[#33454E]/15 ${i === 0 ? 'pl-0 lg:pl-0' : ''}`}
              >
                <dt className="label-mono">{f.k}</dt>
                <dd className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#243239]">{f.v}</dd>
                <dd className="mt-1 text-[14px] text-[#5B6A71]">{f.s}</dd>
              </div>
            ))}
          </dl>
          <div className="hairline" />
        </div>
      </section>

      {/* 04 · About */}
      <Section
        id="about"
        eyebrow="About CUBE"
        title="Academic depth, delivered as public infrastructure."
        action={{ href: '/about', label: 'About the Centre' }}
      >
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 reveal">
            <p className="text-lg sm:text-xl leading-relaxed text-[#33454E]">{aboutContent.overview[0]}</p>
            {aboutContent.overview[1] && (
              <p className="mt-6 text-[16px] leading-relaxed text-[#46565E]">{aboutContent.overview[1]}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about#governing-board" className="inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold gold-shimmer btn-gold">
                Governing board <ArrowUpRight size={15} />
              </Link>
              <Link href="/about#our-team" className="inline-flex items-center gap-2 h-12 px-6 rounded-full btn-soft text-[16px] font-bold">
                Our team
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 grid gap-4 reveal-stagger">
            <div className="glass glass-edge p-6 lg:p-7">
              <p className="label-mono">Vision</p>
              <p className="mt-3 text-[16px] leading-relaxed text-[#33454E]">{aboutContent.vision}</p>
            </div>
            <div className="glass glass-edge p-6 lg:p-7">
              <p className="label-mono">Mission</p>
              <p className="mt-3 text-[16px] leading-relaxed text-[#33454E]">{aboutContent.mission}</p>
            </div>
          </div>
        </div>
      </Section>

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

      {/* 07 · Leadership */}
      <Section
        id="leadership"
        band
        eyebrow="Governance"
        title="Led by IIT Madras and the Government of Tamil Nadu."
        action={{ href: '/about#governing-board', label: 'Full governing board' }}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 reveal-stagger">
          {leaders.map((m, i) => (
            <div key={`${m.name}-${i}`} className="glass glass-edge p-4 flex items-center gap-4 sm:block">
              <div className="relative w-16 h-16 sm:w-full sm:h-56 rounded-xl overflow-hidden shrink-0 bg-[#E6ECEF]">
                {m.image && (
                  <Image src={m.image} alt={m.name} fill sizes="(max-width: 640px) 64px, 25vw" className="object-cover object-top" />
                )}
              </div>
              <div className="sm:mt-4">
                <p className="text-[16px] font-bold text-[#243239] leading-snug">{m.name}</p>
                <p className="mt-1 text-[13.5px] text-[#5B6A71] leading-snug line-clamp-2">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 08 · Clients marquee */}
      {logos.length > 0 && (
        <section className="relative py-12 lg:py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 mb-8 reveal">
            <p className="label-mono">Clients &amp; partners</p>
          </div>
          <div className="relative [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div
              className="flex w-max gap-4 animate-marquee hover:[animation-play-state:paused]"
              style={{ animationDuration: `${Math.max(40, logos.length * 3)}s` }}
            >
              {[...logos, ...logos].map((c, i) => (
                <div key={`${c.name}-${i}`} className="h-20 w-40 shrink-0 rounded-xl bg-[#F2F5F6]/[0.92] border border-white/40 p-4">
                  <div className="relative w-full h-full">
                    <Image src={c.logo} alt={c.name} fill sizes="160px" className="object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 09 · News */}
      {latestNews.length > 0 && (
        <Section id="news" eyebrow="Newsroom" title="Latest from the Centre." action={{ href: '/media#news', label: 'All news' }}>
          <div className="grid md:grid-cols-3 gap-4 lg:gap-5 reveal-stagger">
            {latestNews.map((n) => (
              <Link
                key={n.id || n.title}
                href={n.slug || n.id ? `/media/news/${n.slug || n.id}` : '/media#news'}
                className="group glass glass-interactive glass-edge overflow-hidden flex flex-col"
              >
                {n.image && (
                  <div className="relative h-48 overflow-hidden">
                    <Image src={n.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-[13px] text-[#5B6A71]">
                    {n.date && <span className="font-sans">{n.date}</span>}
                    {n.date && n.category && <span className="opacity-40">·</span>}
                    {n.category && <span>{n.category}</span>}
                  </div>
                  <h3 className="mt-2 text-[16px] font-bold text-[#243239] leading-snug line-clamp-2">{n.title}</h3>
                  {n.summary && <p className="mt-2 text-[14px] text-[#5B6A71] leading-relaxed line-clamp-2">{n.summary}</p>}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* 10 · Contact */}
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
