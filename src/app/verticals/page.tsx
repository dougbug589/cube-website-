'use client';

import React, { useRef } from 'react';
import { useScrollSpy } from '@/lib/useScrollSpy';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { 
  Building2, ShieldCheck, CheckCircle2, ArrowRight, 
  FlaskConical, Cpu, Compass, Waves, Trees, MapPin
} from 'lucide-react';
import { verticals } from '@/data/verticals';
import { projects as fallbackProjects } from '@/data/projects';
import { useLiveList } from '@/lib/live';

export default function CompleteVerticalsExperience() {
  const projects = useLiveList<any>('/api/public/projects', fallbackProjects as any[]);

  const navAnchors = [
    { id: 'building-construction', label: 'Building & Construction' },
    { id: 'environment-sustainability', label: 'Environment & Sustainability' },
    { id: 'smart-cities', label: 'Smart Cities' },
    { id: 'urban-planning-transportation', label: 'Urban Planning & Transportation' },
  ];

  // Highlight follows scrolling; tapping a pill still jumps to its section.
  const anchorBarRef = useRef<HTMLDivElement>(null);
  const [activeVertical, setActiveVertical] = useScrollSpy(navAnchors.map((a) => a.id), anchorBarRef);

  const scrollTo = (id: string) => {
    setActiveVertical(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-transparent text-[#243239] min-h-screen">
      <PageHeader
        badge="Verticals"
        title="Our verticals"
        description="Building & Construction, Environment & Sustainability, Smart Cities, and Urban Planning & Transportation."
        breadcrumbs={[{ label: 'Verticals' }]}
      />

      {/* Sticky Apple Glass Anchor Navigation Bar */}
      <section className="sticky top-[var(--nav-offset,84px)] transition-[top] duration-500 z-40 bg-white/85 backdrop-blur-2xl border-y border-[#D3DDE1]/70 py-3.5 px-4 sm:px-6 shadow-xs">
        <div ref={anchorBarRef} className="relative max-w-7xl mx-auto flex items-center justify-start gap-2 overflow-x-auto scrollbar-none no-scrollbar py-1">
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {navAnchors.map((item) => (
              <button
                key={item.id}
                type="button"
                data-anchor={item.id}
                aria-current={activeVertical === item.id ? 'true' : undefined}
                onClick={() => scrollTo(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 whitespace-nowrap ${
                  activeVertical === item.id
                    ? 'bg-[#F0C468] text-[#243239] shadow-xs'
                    : 'bg-white/60 text-[#243239] hover:bg-[#F2F5F6] hover:text-[#2B3B44] border border-[#D3DDE1]/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4 CONTINUOUS SCROLLABLE VERTICAL DIVISIONS */}
      <div className="space-y-0">
        {verticals.map((vert, vIdx) => {
          const vertProjects = projects.filter((p) => 
            p.category.toLowerCase().includes(vert.title.toLowerCase().split(' ')[0]) ||
            p.category.toLowerCase().includes(vert.id.split('-')[0])
          ).slice(0, 3);

          const isEven = vIdx % 2 === 0;

          return (
            <section
              key={vert.id}
              id={vert.id}
              className={`py-20 sm:py-28 border-b border-[#DCE4E7] ${
                isEven ? 'bg-gradient-to-b from-[#FFFFFF] to-[#F6F8F9]' : 'bg-[#FFFFFF]'
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
                  
                  <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F0C468]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2B3B44] bg-[#F2F5F6] px-3.5 py-1 rounded-full border border-[#D3DDE1]">
                        Vertical Division 0{vIdx + 1}
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#2B3B44] tracking-tight leading-tight">
                      {vert.title}
                    </h2>

                    <p className="text-base sm:text-lg font-medium text-[#C4921B]">
                      {vert.tagline}
                    </p>

                    <p className="text-sm sm:text-base text-[#243239]/85 leading-relaxed font-sans">
                      {vert.longDescription}
                    </p>

                    {/* Capabilities Checklist */}
                    <div className="pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#2B3B44] mb-3">
                        Key Capabilities &amp; Institutional Scope
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {vert.capabilities.map((cap, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-[#D3DDE1]/70 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-[#C4921B] shrink-0 mt-0.5" />
                            <span className="text-xs text-[#243239] font-semibold">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Image Feature Card */}
                  <div className="lg:col-span-5">
                    <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-[#D3DDE1] p-6 shadow-[0_20px_50px_rgba(36,50,57,0.08)] relative overflow-hidden">
                      <div className="relative h-72 sm:h-80 w-full rounded-2xl overflow-hidden mb-6 border border-white ring-1 ring-[#D3DDE1]">
                        <Image
                          src={vert.heroImage || '/images/hero/slides_07-cat.jpg'}
                          alt={vert.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#5B6A71] border-t border-[#DCE4E7] pt-4">
                        <span className="font-semibold text-[#2B3B44]">{vert.projectCount ? `${vert.projectCount} projects` : ''}</span>
                        <Link
                          href="/projects"
                          className="font-bold text-[#2B3B44] hover:text-[#C4921B] flex items-center gap-1 transition"
                        >
                          <span>Explore Projects</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Related Projects Showcase */}
                {vertProjects.length > 0 && (
                  <div className="pt-8 border-t border-[#DCE4E7]">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-display font-bold text-[#2B3B44]">
                        Featured Schemes in {vert.title}
                      </h3>
                      <Link href="/projects" className="text-xs font-semibold text-[#C4921B] hover:underline flex items-center gap-1">
                        <span>View All Projects</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {vertProjects.map((proj, pIdx) => (
                        <div key={proj.slug || pIdx} className="p-5 rounded-3xl bg-white border border-[#D3DDE1] shadow-2xs hover:shadow-xs transition">
                          <span className="text-[13.5px] font-bold text-[#2B3B44] uppercase tracking-wider">{proj.client}</span>
                          <h4 className="font-display font-bold text-base text-[#243239] mt-1 leading-snug">{proj.title}</h4>
                          <p className="text-xs text-[#5B6A71] mt-2 line-clamp-2">{proj.description}</p>
                          <div className="mt-4 pt-3 border-t border-[#DCE4E7] flex items-center justify-between text-xs">
                            <span className="text-[#C4921B] font-semibold">{proj.status}</span>
                            <Link href={`/projects/${proj.slug}`} className="font-bold text-[#2B3B44] hover:underline">
                              Case Study &rarr;
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

