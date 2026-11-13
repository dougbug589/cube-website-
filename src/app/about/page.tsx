'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Landmark, GraduationCap } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SectionHeading from '@/components/common/SectionHeading';
import SectionPhoto from '@/components/common/SectionPhoto';
import SectionNav from '@/components/common/SectionNav';
import FocusCarousel from '@/components/common/FocusCarousel';
import Marquee from '@/components/common/Marquee';
import MessageSection from '@/components/about/MessageSection';
import RingCarousel from '@/components/about/RingCarousel';
import { Monogram } from '@/components/common/PersonCard';
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
  { id: 'objectives-values', label: 'Objectives' },
  { id: 'core-values', label: 'Core Values' },
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
  const missionPoints = useMemo(
    () => aboutContent.mission.split(';').map((m) => m.trim().replace(/\.$/, '')).filter(Boolean),
    []
  );

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="About"
        title="About CUBE"
        description="Centre for Urbanization, Buildings & Environment, a Centre of Excellence of the Government of Tamil Nadu and IIT Madras."
        breadcrumbs={[{ label: 'About CUBE' }]}
      />

      <SectionNav id="about" sections={SECTIONS} />

      {/* 1 · Overview */}
      <section id="overview" className="relative scroll-mt-40 py-20 lg:py-28">
        {/* the CUBE office at the IIT Madras Research Park; darker on the left where the text runs */}
        <SectionPhoto src="/images/about/about_about.jpg" wash="bg-gradient-to-r from-[#0B0D0E]/85 via-[#0B0D0E]/70 to-[#0B0D0E]/50" />
        <div className="relative shell grid lg:grid-cols-12 gap-10 lg:gap-14">
          <div className="lg:col-span-7 reveal">
            <p className="label-mono">About CUBE</p>
            <p className="mt-4 text-[20px] sm:text-[22px] leading-relaxed text-[#F3F5F6] font-semibold">{aboutContent.overview[0]}</p>
            <div className="mt-6 space-y-5 text-[20px] leading-[1.75] text-[#DDE3E6]">
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
              <p className="mt-5 font-display text-2xl font-extrabold text-[#F3F5F6]">Centre of Excellence</p>
              <p className="mt-1 label-mono">IIT Madras · Government of Tamil Nadu</p>
              <p className="mt-5 pt-5 border-t border-white/10 text-[17px] text-[#C2CCD1] leading-relaxed">{contactInfo.address}</p>
            </div>
            <div className="glass glass-interactive glass-edge rounded-[24px] p-5 flex items-start gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl pill-yellow text-[#0B0D0E] depth-1 shrink-0">
                <Landmark size={21} strokeWidth={2} />
              </span>
              <span>
                <span className="block font-display text-[18px] font-bold text-[#F3F5F6]">Government of Tamil Nadu</span>
                <span className="mt-1 block text-[17.5px] text-[#C2CCD1] leading-relaxed">
                  Seed funding from CMDA, TNHB, TNPCB and MAWS; four State Government departments nominate members to the Governing Body.
                </span>
              </span>
            </div>
            <div className="glass glass-interactive glass-edge rounded-[24px] p-5 flex items-start gap-4">
              <span className="grid place-items-center w-12 h-12 rounded-2xl pill-yellow text-[#0B0D0E] depth-1 shrink-0">
                <GraduationCap size={21} strokeWidth={2} />
              </span>
              <span>
                <span className="block font-display text-[18px] font-bold text-[#F3F5F6]">IIT Madras</span>
                <span className="mt-1 block text-[17.5px] text-[#C2CCD1] leading-relaxed">
                  Raised by IIT Madras with the Government of Tamil Nadu; the Governing Body is headed by the Director, IITM, with four members from IITM Faculty.
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · Vision & Mission */}
      <section id="vision-mission" className="relative scroll-mt-40 py-20 lg:py-28">
        {/* IIT Tirupati permanent campus (CUBE: third party quality assurance) */}
        <SectionPhoto src="/images/hero/slides_iit-tirupathi.jpg" wash="bg-[#0B0D0E]/50" />
        <div className="relative shell">
          <SectionHeading eyebrow="Vision & Mission" title="Vision & mission." />
          <div className="grid lg:grid-cols-12 gap-5 reveal-stagger">
            <div className="lg:col-span-5 liquid-glass rounded-[28px] p-8 lg:p-10">
              <p className="label-mono">Vision</p>
              <p className="mt-4 font-display text-[22px] lg:text-[24px] font-bold leading-snug text-[#F3F5F6]">{aboutContent.vision}</p>
            </div>
            <div className="lg:col-span-7 glass rounded-[28px] p-8 lg:p-10">
              <p className="label-mono">Mission</p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {missionPoints.map((m) => (
                  <li key={m} className="flex items-start gap-3 text-[19px] text-[#DDE3E6] leading-relaxed">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#F6C22E] shrink-0" />
                    <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · Objectives & Core Values */}
      <section id="objectives-values" className="relative scroll-mt-40 py-20 lg:py-28">
        {/* surface water management plan for the IIT Jammu campus (a CUBE project) */}
        <SectionPhoto src="/images/hero/slides_slide2.jpg" wash="bg-[#0B0D0E]/55" />
        <div className="relative shell">
          <SectionHeading eyebrow="Objectives" title="Objectives." />
          <ol className="grid sm:grid-cols-2 gap-4 reveal-stagger">
            {aboutContent.objectives.map((obj, i) => (
              <li key={i} className="glass glass-interactive rounded-[22px] p-5 flex items-start gap-4">
                <span className="font-display text-[22px] font-extrabold text-[#F6C22E] tabular-nums leading-none mt-0.5 w-9 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[16.5px] text-[#F3F5F6] leading-relaxed">{obj}</span>
              </li>
            ))}
          </ol>

        </div>
      </section>

      <section id="core-values" className="relative scroll-mt-40 py-20 lg:py-28">
        {/* the CUBE team */}
        <SectionPhoto src="/images/hero/slides_building-training-team.jpg" wash="bg-[#0B0D0E]/55" position="object-[50%_35%]" />
        <div className="relative shell">
          <SectionHeading eyebrow="Core Values" title="Core values." />
          <div>
            <FocusCarousel
              label="Core values"
              items={aboutContent.coreValues}
              keyOf={(v) => v.title}
              variant="equal"
              interval={1800}
              heightClass="h-[380px] md:h-[400px] xl:h-[330px]"
              render={(val) => (
                <div className="liquid-glass h-full rounded-[30px] p-7 sm:p-8 flex flex-col">
                  <p className="font-display text-[26px] sm:text-[28px] font-extrabold text-[#F3F5F6]">{val.title}</p>
                  <span aria-hidden className="mt-3 block h-[3px] w-12 rounded-full bg-[#F6C22E]" />
                  <p className="mt-5 text-[17.5px] sm:text-[18px] text-[#DDE3E6] leading-relaxed">{val.description}</p>
                </div>
              )}
            />
          </div>
        </div>
      </section>

      {/* 4 · Chairman Message */}
      <MessageSection
        id="chairman-message"
        label="Chairman Message"
        image="/images/leadership/kamakoti_iitm.jpg"
        name="Prof. V Kamakoti"
        lines={['Director, IIT Madras']}
        paragraphs={aboutContent.chairmanMessage}
        band
      />

      {/* 5 · CEO Message */}
      <MessageSection
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
          {/* no .reveal wrapper: an animating ancestor would hold back the glass blur */}
          <RingCarousel label="Governing Body" people={boardMembers} interval={2200} />
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
          <div>
            <FocusCarousel
              label="IIT Madras advisory panel"
              items={advisoryPanel}
              keyOf={(a) => a.name}
              heightClass="h-[500px] sm:h-[520px]"
              maxCard={400}
              interval={2200}
              render={(a, active) => (
                <article className={`glass h-full rounded-[30px] overflow-hidden flex flex-col ${active ? 'ring-1 ring-[#F6C22E]/40' : ''}`}>
                  <div className="relative flex-1 min-h-0 bg-[#1A1F22]">
                    {a.image ? (
                      <Image src={a.image} alt={a.name} fill sizes="400px" className="object-cover object-[50%_20%]" draggable={false} />
                    ) : (
                      <Monogram name={a.name} className="absolute inset-0" />
                    )}
                  </div>
                  <div className="p-5 sm:p-6">
                    <h3 className="font-display text-[20px] sm:text-[22px] font-bold text-[#F3F5F6] leading-snug">{a.name}</h3>
                    {a.role && <p className="mt-1 text-[15.5px] font-semibold text-[#F6C22E] leading-snug line-clamp-2">{a.role}</p>}
                    {(a.organization || a.department) && <p className="mt-1 text-[16px] text-[#C2CCD1] leading-snug line-clamp-1">{a.organization || a.department}</p>}
                  </div>
                </article>
              )}
            />
          </div>
        </div>
      </section>

      {/* 8 · Our Team */}
      <section id="our-team" className="scroll-mt-40 py-16 lg:py-20 band-mist">
        <div className="shell">
          <SectionHeading
            eyebrow="Our Team"
            title={<>Our team <span className="text-[#F6C22E]">({teamMembers.length})</span></>}
            lead="Staff across Building & Construction, Environment & Sustainability, Urban Planning & Transportation and Administration."
            action={{ href: '/about/team', label: 'Team by department' }}
          />
          <div className="reveal">
            <Marquee
              label="CUBE team"
              rows={[0, 1].map((r) =>
                teamMembers
                  .filter((_, i) => i % 2 === r)
                  .map((t, i) => (
                    <div key={`${t.name}-${i}`} className="glass w-[300px] sm:w-[330px] rounded-[22px] p-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/[0.06] shrink-0 depth-1">
                        {t.image && !/team_unknown/.test(t.image) ? (
                          <Image src={t.image} alt={t.name} fill sizes="64px" className="object-cover object-top" draggable={false} />
                        ) : (
                          <Monogram name={t.name} className="absolute inset-0 [&>span]:text-[20px]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-[17.5px] font-bold text-[#F3F5F6] truncate">{t.name}</p>
                        <p className="text-[15.5px] font-semibold text-[#F6C22E] truncate">{t.designation}</p>
                        {t.department && <p className="text-[16px] text-[#C2CCD1] truncate">{t.department}</p>}
                      </div>
                    </div>
                  ))
              )}
            />
          </div>
        </div>
      </section>

      {/* 9 · Our Clients */}
      <section id="clients-partners" className="scroll-mt-40 py-16 lg:py-20">
        <div className="shell">
          <SectionHeading
            eyebrow="Our Clients"
            title={<>Clients <span className="text-[#F6C22E]">({clients.length})</span></>}
            action={{ href: '/about/clients', label: 'All clients' }}
          />
          <div className="reveal">
            <Marquee
              label="CUBE clients"
              speed={40}
              rows={[0, 1].map((r) =>
                clients
                  .filter((_, i) => i % 2 === r)
                  .map((c, i) => (
                    <div key={`${c.logo}-${i}`} className="w-[200px] sm:w-[230px] h-32 lg:h-36 rounded-[22px] bg-white border border-white/[0.08] depth-1 px-5 py-4">
                      <div className="relative w-full h-full">
                        <Image src={c.logo || '/images/clients/client_1.png'} alt={clientLogoAlt(c.name)} fill sizes="230px" className="object-contain" draggable={false} />
                      </div>
                    </div>
                  ))
              )}
            />
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
