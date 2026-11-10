'use client';

import React, { useRef } from 'react';
import { useScrollSpy } from '@/lib/useScrollSpy';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { 
  Newspaper, Calendar, Image as ImageIcon, BookOpen, 
  ArrowRight, Sparkles, MapPin, ExternalLink, Download
} from 'lucide-react';
import { newsItems as fallbackNewsItems } from '@/data/news';
import { useLiveList } from '@/lib/live';

export default function CompleteMediaExperience() {
  // Live CMS news: published items only, updates instantly on admin changes.
  const newsItems = useLiveList<any>('/api/public/news', fallbackNewsItems as any[]);

  const navAnchors = [
    { id: 'news', label: 'News & Announcements' },
    { id: 'events', label: 'Technical Events & Workshops' },
    { id: 'gallery', label: 'Project Photo Gallery' },
    { id: 'life-at-cube', label: 'Life at CUBE' },
    { id: 'publications', label: 'Technical Publications' },
  ];

  // Highlight follows scrolling; tapping a pill still jumps to its section.
  const anchorBarRef = useRef<HTMLDivElement>(null);
  const [activeMediaTab, setActiveMediaTab] = useScrollSpy(navAnchors.map((a) => a.id), anchorBarRef);

  const scrollTo = (id: string) => {
    setActiveMediaTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sampleEvents = [
    {
      title: 'Statewide Municipal Engineers Capacity Building Program',
      date: 'May 18 - 20, 2024',
      location: 'IIT Madras Research Park Auditorium, Chennai',
      category: 'Capacity Building',
      image: '/images/hero/slides_building-training-team.jpg',
      description: '3-day residential workshop focused on modern concrete durability, non-destructive testing (NDT), and precast quality assurance for over 120 executive engineers from Tamil Nadu urban local bodies.',
    },
    {
      title: 'Workshop on Innovative Precast Housing & Light House Projects',
      date: 'January 24, 2024',
      location: 'Civil Engineering Department, IIT Madras',
      category: 'Technical Seminar',
      image: '/images/hero/slides_07-cat.jpg',
      description: 'Dissemination seminar presenting structural monitoring findings and construction speed benchmarks from the Light House Project (LHP) Chennai under GHTC-India.',
    },
    {
      title: 'Urban Water Resilience & Flood Mitigation Symposium',
      date: 'November 12, 2023',
      location: 'IC&SR Hall, IIT Madras',
      category: 'Symposium',
      image: '/images/about/about_environment.jpg',
      description: 'Technical session bringing together hydrologists, CMDA planners, and IIT Madras civil engineering faculty to deliberate 2D hydrodynamic modeling for coastal catchments.',
    }
  ];

  const galleryImages = [
    { src: '/images/hero/slides_iit-tirupathi.jpg', title: 'IIT Tirupati Campus Structural PMC' },
    { src: '/images/hero/slides_cpcl-arc.jpg', title: 'CPCL Industrial & ARHC Precast Housing' },
    { src: '/images/hero/slides_ashiana.jpg', title: 'Affordable Housing Structural Assurance' },
    { src: '/images/hero/slides_design-engineering-consultancy.jpg', title: 'Design Engineering & Hydrodynamic Modeling' },
    { src: '/images/hero/slides_building-training-team.jpg', title: 'CEL Testing & State Engineers Workshop' },
    { src: '/images/hero/slides_07-cat.jpg', title: 'Precast Quality Assurance & Field Testing' },
  ];

  const publications = [
    {
      title: 'Technical Guidelines for Independent Third-Party Quality Assurance in Affordable Housing',
      authors: 'CUBE Building Vertical & IIT Madras Faculty Committee',
      date: '2024',
      desc: 'Standardized operational manual outlining non-destructive testing frequencies, batch plant audits, and precast joint tolerances for state housing schemes.',
    },
    {
      title: '2D Hydrodynamic Flood Inundation Modeling for Coastal Urban Catchments',
      authors: 'CUBE Environmental Division & Department of Civil Engineering, IIT Madras',
      date: '2023',
      desc: 'Comparative study on integrated river basin hydrology and urban storm drainage networks for Chennai metropolitan watersheds.',
    },
    {
      title: 'Benchmarking Concrete Durability Parameters in Aggressive Coastal Environments',
      authors: 'CUBE Environmental Laboratory (CEL) Technical Staff',
      date: '2023',
      desc: 'Field and laboratory evaluation of rapid chloride permeability and sulphate resistance in high-performance precast mixes.',
    }
  ];

  return (
    <div className="bg-[#FFFFFF] text-[#24272B] min-h-screen">
      <PageHeader
        badge="Media & Dispatches"
        title="Institutional Media Centre"
        description="Comprehensive press announcements, capacity-building workshops, visual photo archive, research publications, and campus culture at CUBE."
        breadcrumbs={[{ label: 'Media' }]}
      />

      {/* Sticky Apple Glass Anchor Navigation Bar */}
      <section className="sticky top-[var(--nav-offset,84px)] transition-[top] duration-500 z-40 bg-white/85 backdrop-blur-2xl border-y border-[#BDD7E8]/70 py-3.5 px-4 sm:px-6 shadow-xs">
        <div ref={anchorBarRef} className="relative max-w-7xl mx-auto flex items-center justify-start gap-2 overflow-x-auto scrollbar-none no-scrollbar py-1">
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {navAnchors.map((item) => (
              <button
                key={item.id}
                type="button"
                data-anchor={item.id}
                aria-current={activeMediaTab === item.id ? 'true' : undefined}
                onClick={() => scrollTo(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 whitespace-nowrap ${
                  activeMediaTab === item.id
                    ? 'bg-[#070E5C] text-white shadow-xs'
                    : 'bg-white/60 text-[#24272B] hover:bg-[#EAF2F8] hover:text-[#070E5C] border border-[#BDD7E8]/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 1. NEWS & ANNOUNCEMENTS */}
      <section id="news" className="py-20 sm:py-24 bg-gradient-to-b from-[#FFFFFF] to-[#F6FAFD] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-white px-3.5 py-1 rounded-full border border-[#BDD7E8]">
                Press Dispatches
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C] mt-2">
                Latest News &amp; Announcements
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#747B83] mt-2 sm:mt-0">
              Verified institutional reports and state project updates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white border border-[#BDD7E8] p-6 shadow-2xs hover:shadow-md hover:border-[#8EBCE0] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#747B83] mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]">
                      {item.category || 'Press Release'}
                    </span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#070E5C] leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#24272B]/80 mt-2 line-clamp-3 leading-relaxed">
                    {item.summary || item.content}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#D99A42] font-semibold">IIT Madras &amp; GoTN</span>
                  <Link href={`/media/news/${(item as any).slug || item.id}`} className="font-bold text-[#070E5C] hover:underline flex items-center gap-1">
                    <span>Read Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TECHNICAL EVENTS & WORKSHOPS */}
      <section id="events" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
              Knowledge Dissemination
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C] mt-2">
              Workshops &amp; Engineering Seminars
            </h2>
            <p className="text-xs sm:text-sm text-[#747B83] mt-2">
              Mentoring state municipal engineers and showcasing cutting-edge precast and environmental advances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sampleEvents.map((evt, idx) => (
              <div key={idx} className="rounded-3xl bg-[#F6FAFD] border border-[#BDD7E8] p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 border border-white ring-1 ring-[#BDD7E8]">
                    <Image src={evt.image} alt={evt.title} fill className="object-cover" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A42]">{evt.category} &bull; {evt.date}</span>
                  <h3 className="font-serif font-bold text-base text-[#070E5C] mt-1 leading-snug">{evt.title}</h3>
                  <p className="text-xs text-[#747B83] mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D99A42]" />
                    <span>{evt.location}</span>
                  </p>
                  <p className="text-xs text-[#24272B]/80 mt-3 line-clamp-3 leading-relaxed">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PHOTO GALLERY */}
      <section id="gallery" className="py-20 sm:py-24 bg-gradient-to-b from-[#FFFFFF] to-[#F6FAFD] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
              Site Documentation
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C] mt-2">
              Curated Project &amp; Laboratory Gallery
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, i) => (
              <div key={i} className="group rounded-3xl overflow-hidden border border-[#BDD7E8] bg-white shadow-2xs hover:shadow-md transition-all">
                <div className="relative h-60 w-full overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                    <p className="text-white text-xs font-semibold leading-snug">{img.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LIFE AT CUBE */}
      <section id="life-at-cube" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
                Workplace Culture
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C]">
                Life at CUBE: Applied Engineering Innovation at IITM Research Park
              </h2>
              <p className="text-sm text-[#24272B]/85 leading-relaxed font-sans">
                Operating out of the premier IIT Madras Research Park in Chennai, CUBE brings together young engineering minds, seasoned state advisors, and world-renowned faculty in an open, vibrant research environment.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#F6FAFD] border border-[#BDD7E8]">
                  <h4 className="text-xs font-bold text-[#070E5C] uppercase tracking-wider">Faculty Collaboration</h4>
                  <p className="text-xs text-[#747B83] mt-1">Direct daily liaison with IIT Madras departments and research labs.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F6FAFD] border border-[#BDD7E8]">
                  <h4 className="text-xs font-bold text-[#070E5C] uppercase tracking-wider">Field Impact</h4>
                  <p className="text-xs text-[#747B83] mt-1">Direct oversight of major infrastructure works shaping Tamil Nadu.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative h-80 w-full rounded-3xl overflow-hidden border border-[#BDD7E8] shadow-md">
                <Image src="/images/hero/slides_building-training-team.jpg" alt="Team at CUBE" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TECHNICAL PUBLICATIONS */}
      <section id="publications" className="py-20 sm:py-24 bg-gradient-to-b from-[#F6FAFD] to-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
              Applied Research Briefs
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C] mt-2">
              Technical Publications &amp; Whitepapers
            </h2>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {publications.map((pub, idx) => (
              <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-white border border-[#BDD7E8] shadow-2xs hover:shadow-xs transition">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A42]">{pub.authors} &bull; {pub.date}</span>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#070E5C] mt-1 leading-snug">{pub.title}</h3>
                <p className="text-xs sm:text-sm text-[#24272B]/80 mt-2 leading-relaxed">{pub.desc}</p>
                <div className="mt-5 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#747B83]">Published by CUBE IIT Madras</span>
                  <a href="mailto:contact@cubeiitm.org?subject=Request Publication Copy" className="font-bold text-[#070E5C] hover:text-[#D99A42] flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-[#D99A42]" />
                    <span>Request Technical Document</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
