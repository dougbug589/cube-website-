'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown, Landmark, GraduationCap, Quote } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SectionHeading from '@/components/common/SectionHeading';
import SectionNav from '@/components/common/SectionNav';
import { aboutContent } from '@/data/about';
import { boardMembers as fallbackBoard, advisoryPanel as fallbackAdvisory } from '@/data/leadership';
import { teamMembers as fallbackTeam } from '@/data/team';
import { clients as fallbackClients } from '@/data/clients';
import { useLiveList } from '@/lib/live';
import { clientLogoAlt } from '@/lib/content';
import { contactInfo } from '@/data/contact';

const LEADER_CATEGORIES = new Set(['leadership', 'board', 'advisory']);
const FALLBACK_PEOPLE: any[] = [
  ...fallbackBoard.map((m) => ({ ...m, category: 'board' })),
  ...fallbackAdvisory.map((m) => ({ ...m, category: 'advisory' })),
  ...fallbackTeam.map((m) => ({ ...m, category: m.department })),
];
const withRole = (list: any[]) => list.map((m) => ({ ...m, role: m.role || m.designation || '' }));

// Section labels follow the About menu on cubeiitm.org.
const SECTIONS = [
  { id: 'overview', label: 'About CUBE' },
  { id: 'vision-mission', label: 'Vision & Mission' },
  { id: 'objectives-values', label: 'Objectives & Values' },
  { id: 'chairman-message', label: 'Chairman Message' },
  { id: 'ceo-message', label: 'CEO Message' },
  { id: 'governing-board', label: 'Board Members' },
  { id: 'advisory-panel', label: 'IIT Advisory Panel' },
  { id: 'our-team', label: 'Our Team' },
  { id: 'clients-partners', label: 'Our Clients' },
];


export default function AboutPage() {
  // Live CMS data: archived/edited members and clients update instantly.
  const people = useLiveList<any>('/api/public/team', FALLBACK_PEOPLE, withRole);
  const clients = useLiveList<any>('/api/public/clients', fallbackClients as any[]);
  const { boardMembers, advisoryPanel, teamMembers } = useMemo(
    () => ({
      boardMembers: people.filter((m) => m.category === 'board'),
      advisoryPanel: people.filter((m) => m.category === 'advisory'),
      teamMembers: people.filter((m) => !LEADER_CATEGORIES.has(m.category)),
    }),
    [people]
  );
  const [showAllTeam, setShowAllTeam] = useState(false);
  const missionPoints = useMemo(
    () => aboutContent.mission.split(';').map((m) => m.trim().replace(/\.$/, '')).filter(Boolean),
    []
  );

  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader
        badge="About"
        title="About CUBE"
        description="Centre for Urbanization, Buildings & Environment, a Centre of Excellence of the Government of Tamil Nadu and IIT Madras."
        breadcrumbs={[{ label: 'About CUBE' }]}
      />

      <SectionNav id="about" sections={SECTIONS} />

      {/* 1 · Overview */}
      <section id="overview" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell grid lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-7 reveal">
            <p className="label-mono">About CUBE</p>
            <p className="mt-4 text-[20px] sm:text-[22px] leading-relaxed text-[#243239] font-semibold">{aboutContent.overview[0]}</p>
            <div className="mt-6 space-y-5 text-[17px] leading-relaxed text-[#46565E]">
              {aboutContent.overview.slice(1).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-[calc(var(--nav-offset,93px)+5rem)] self-start reveal-stagger">
            <div className="liquid-glass rounded-[28px] p-8 text-center">
              <div className="relative h-36 w-36 mx-auto">
                <Image src="/images/branding/cube-primary-logo.png" alt="CUBE" fill sizes="144px" className="object-contain" />
              </div>
              <p className="mt-5 font-display text-2xl font-extrabold text-[#243239]">Centre of Excellence</p>
              <p className="mt-1 label-mono">IIT Madras · Government of Tamil Nadu</p>
              <p className="mt-5 pt-5 border-t border-[#33454E]/10 text-[15px] text-[#5B6A71] leading-relaxed">{contactInfo.address}</p>
            </div>
            <div className="glass glass-interactive glass-edge rounded-[24px] p-5 flex items-start gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#F7EDD3] text-[#9A7015] depth-1 shrink-0">
                <Landmark size={21} strokeWidth={2} />
              </span>
              <span>
                <span className="block font-display text-[18px] font-bold text-[#243239]">Government of Tamil Nadu</span>
                <span className="mt-1 block text-[15.5px] text-[#5B6A71] leading-relaxed">
                  Seed funding from CMDA, TNHB, TNPCB and MAWS; four State Government departments nominate members to the Governing Body.
                </span>
              </span>
            </div>
            <div className="glass glass-interactive glass-edge rounded-[24px] p-5 flex items-start gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#F7EDD3] text-[#9A7015] depth-1 shrink-0">
                <GraduationCap size={21} strokeWidth={2} />
              </span>
              <span>
                <span className="block font-display text-[18px] font-bold text-[#243239]">IIT Madras</span>
                <span className="mt-1 block text-[15.5px] text-[#5B6A71] leading-relaxed">
                  Raised by IIT Madras with the Government of Tamil Nadu; the Governing Body is headed by the Director, IITM, with four members from IITM Faculty.
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Vision & Mission */}
      <section id="vision-mission" className="scroll-mt-40 py-16 lg:py-20 band-mist">
        <div className="shell">
          <SectionHeading eyebrow="Vision & Mission" title="Vision & mission." />
          <div className="grid lg:grid-cols-12 gap-5 reveal-stagger">
            <div className="lg:col-span-5 liquid-glass rounded-[28px] p-8 lg:p-10">
              <p className="label-mono">Vision</p>
              <p className="mt-4 font-display text-[22px] lg:text-[24px] font-bold leading-snug text-[#243239]">{aboutContent.vision}</p>
            </div>
            <div className="lg:col-span-7 glass rounded-[28px] p-8 lg:p-10">
              <p className="label-mono">Mission</p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {missionPoints.map((m) => (
                  <li key={m} className="flex items-start gap-3 text-[16.5px] text-[#46565E] leading-relaxed">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#C4921B] shrink-0" />
                    <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · Objectives & Core Values */}
      <section id="objectives-values" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell">
          <SectionHeading eyebrow="Objectives" title="Objectives." />
          <ol className="grid sm:grid-cols-2 gap-4 reveal-stagger">
            {aboutContent.objectives.map((obj, i) => (
              <li key={i} className="glass glass-interactive rounded-[22px] p-5 flex items-start gap-4">
                <span className="font-display text-[22px] font-extrabold text-[#C4921B] tabular-nums leading-none mt-0.5 w-9 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[16.5px] text-[#243239] leading-relaxed">{obj}</span>
              </li>
            ))}
          </ol>

          <SectionHeading eyebrow="Core Values" title="Core values." className="mt-16 lg:mt-20" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal-stagger">
            {aboutContent.coreValues.map((val, i) => (
              <div key={i} className="glass glass-interactive glass-edge rounded-[24px] p-6">
                <p className="font-display text-[22px] font-extrabold text-[#243239]">{val.title}</p>
                <p className="mt-2 text-[16px] text-[#5B6A71] leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · Chairman Message */}
      <Message
        id="chairman-message"
        label="Chairman Message"
        image="/images/leadership/board_member_kamakoti.jpg"
        name="Prof. V Kamakoti"
        lines={['Director, IIT Madras']}
        paragraphs={aboutContent.chairmanMessage}
        band
      />

      {/* 5 · CEO Message */}
      <Message
        id="ceo-message"
        label="CEO Message"
        image="/images/leadership/ceo_padmanaban.jpg"
        name="L. PADMANABAN"
        lines={['(Major General [Retired])', 'CEO']}
        paragraphs={aboutContent.ceoMessage}
      />

      {/* 6 · Board Members */}
      <section id="governing-board" className="scroll-mt-40 py-16 lg:py-20 band-mist">
        <div className="shell">
          <SectionHeading
            eyebrow="Board Members"
            title="Governing Body."
            lead="Headed by the Director, IITM, with nominees from four Tamil Nadu State Government departments, four members from IITM Faculty and four members from prominent industries and organizations."
            action={{ href: '/about/board-members', label: 'Board members' }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 reveal-stagger">
            {boardMembers.map((m, i) => (
              <div key={`${m.name}-${i}`} className="glass glass-interactive glass-edge rounded-[24px] overflow-hidden flex flex-col">
                <div className="relative aspect-square bg-[#DCE4E8]">
                  <Image src={m.image || '/images/leadership/about_leader.jpg'} alt={m.name} fill sizes="(max-width: 640px) 50vw, 17vw" className="object-cover object-top" />
                </div>
                <div className="p-4 lg:p-5">
                  <p className="font-display text-[17px] font-bold text-[#243239] leading-snug">{m.name}</p>
                  {m.role && <p className="mt-1 text-[14.5px] font-semibold text-[#9A7015]">{m.role}</p>}
                  {m.organization && <p className="mt-1 text-[14px] text-[#5B6A71] leading-snug line-clamp-3">{m.organization}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 · IIT Advisory Panel */}
      <section id="advisory-panel" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell">
          <SectionHeading
            eyebrow="IIT Advisory Panel"
            title="IIT Madras advisory panel."
            lead="25 faculty from the Departments of Civil, Mechanical, Aerospace and Chemical Engineering, IIT Madras."
            action={{ href: '/about/advisory-panel', label: 'Advisory panel' }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 reveal-stagger">
            {advisoryPanel.map((a, i) => (
              <div key={`${a.name}-${i}`} className="glass glass-interactive rounded-[22px] p-4 text-center">
                <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-[#DCE4E8] depth-1">
                  <Image src={a.image || '/images/leadership/about_leader.jpg'} alt={a.name} fill sizes="80px" className="object-cover object-top" />
                </div>
                <p className="mt-3 font-display text-[16px] font-bold text-[#243239] leading-snug">{a.name}</p>
                {a.role && <p className="mt-1 text-[13.5px] text-[#5B6A71] leading-snug line-clamp-2">{a.role}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 · Our Team */}
      <section id="our-team" className="scroll-mt-40 py-16 lg:py-20 band-mist">
        <div className="shell">
          <SectionHeading
            eyebrow="Our Team"
            title={<>Our team <span className="text-[#C4921B]">({teamMembers.length})</span></>}
            lead="Staff across Building & Construction, Environment & Sustainability, Urban Planning & Transportation and Administration."
            action={{ href: '/about/team', label: 'Team by department' }}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 reveal-stagger">
            {(showAllTeam ? teamMembers : teamMembers.slice(0, 12)).map((t, i) => (
              <div key={`${t.name}-${i}`} className="glass rounded-[20px] p-3.5 flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0 depth-1">
                  <Image src={t.image || '/images/team/team_unknown.png'} alt={t.name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-[16px] font-bold text-[#243239] truncate">{t.name}</p>
                  <p className="text-[14px] font-semibold text-[#9A7015] truncate">{t.designation}</p>
                  {t.department && <p className="text-[13.5px] text-[#5B6A71] truncate">{t.department}</p>}
                </div>
              </div>
            ))}
          </div>
          {teamMembers.length > 12 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAllTeam((v) => !v)}
                className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold"
              >
                {showAllTeam ? 'Show fewer' : `Show all ${teamMembers.length}`}
                <ChevronDown size={17} className={`transition-transform duration-300 ${showAllTeam ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 9 · Our Clients */}
      <section id="clients-partners" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell">
          <SectionHeading
            eyebrow="Our Clients"
            title={<>Clients <span className="text-[#C4921B]">({clients.length})</span></>}
            action={{ href: '/about/clients', label: 'All clients' }}
          />
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 reveal-stagger">
            {clients.map((c, i) => (
              <div key={`${c.logo}-${i}`} className="group h-24 rounded-[18px] bg-white border border-[#33454E]/[0.07] depth-1 p-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1">
                <div className="relative w-full h-full">
                  <Image
                    src={c.logo || '/images/clients/client_1.png'}
                    alt={clientLogoAlt(c.name)}
                    fill
                    sizes="150px"
                    className="object-contain grayscale opacity-80 transition-[filter,opacity] duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link href="/contact" className="press btn-gold gold-shimmer inline-flex items-center gap-2 h-12 px-7 rounded-full text-[16px] font-extrabold">
              Contact CUBE <ArrowUpRight size={16} strokeWidth={2.25} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Portrait + message, signed as on cubeiitm.org. */
function Message({
  id,
  label,
  image,
  name,
  lines,
  paragraphs,
  band = false,
}: {
  id: string;
  label: string;
  image: string;
  name: string;
  lines: string[];
  paragraphs: string[];
  band?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-40 py-16 lg:py-20 ${band ? 'band-mist' : ''}`}>
      <div className="shell grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        <div className="lg:col-span-4 reveal lg:sticky lg:top-[calc(var(--nav-offset,93px)+5rem)]">
          <div className="relative aspect-[4/5] max-w-sm rounded-[28px] overflow-hidden depth-3 bg-[#DCE4E8]">
            <Image src={image} alt={name} fill sizes="(max-width: 1024px) 80vw, 30vw" className="object-cover object-top" />
          </div>
          <p className="mt-5 font-display text-2xl font-extrabold text-[#243239]">{name}</p>
          {lines.map((l) => (
            <p key={l} className="text-[15.5px] text-[#5B6A71]">{l}</p>
          ))}
        </div>
        <div className="lg:col-span-8 reveal">
          <p className="label-mono inline-flex items-center gap-2">
            <Quote size={15} className="text-[#C4921B]" /> {label}
          </p>
          {paragraphs[0] && <p className="mt-4 text-[20px] sm:text-[21px] leading-relaxed text-[#243239] font-semibold">{paragraphs[0]}</p>}
          <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-[#46565E]">
            {paragraphs.slice(1).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
