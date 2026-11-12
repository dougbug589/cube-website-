'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Droplets, Recycle, Wind, Award, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { GlassPanel } from '@/components/common/AppleLiquidGlass';

const SUSTAINABILITY_PILLARS = [
  {
    id: 'water-management',
    title: 'Water & Wastewater Engineering',
    category: 'CEL Facility & IIT Madras',
    metric: 'CEL',
    metricLabel: 'Co-located Environmental Laboratory',
    description: 'Analytical testing, effluent characterization, tertiary water reuse validation, and CETP/STP process optimization for municipal bodies and industrial clusters across South India.',
    icon: Droplets,
    image: '/images/projects/environment-sustainability/cmwssb_01.jpg',
    href: '/cel',
  },
  {
    id: 'circular-economy',
    title: 'Construction & Solid Waste Valorization',
    category: 'Circular Engineering',
    metric: 'Solid Waste',
    metricLabel: 'Testing & Analysis at CEL',
    description: 'Characterization of Construction and Demolition (C&D) waste, fly ash, slag, and quarry dust as structural raw materials, validating sustainable precast concrete alternatives.',
    icon: Recycle,
    image: '/images/projects/environment-sustainability/about_environment.jpg',
    href: '/verticals/environment-sustainability',
  },
  {
    id: 'low-carbon',
    title: 'Low-Carbon Precast Housing',
    category: 'Affordable Sustainable Homes',
    metric: '40+',
    metricLabel: 'Housing for All Schemes',
    description: 'Independent engineering proof checking for mass affordable housing schemes (PMAY/ARHC) evaluating precast EPS sandwich panels, monolithic concrete, and light-gauge steel.',
    icon: Leaf,
    image: '/images/projects/building-construction/hfapmay_01.jpg',
    href: '/projects',
  },
  {
    id: 'urban-heat',
    title: 'Climate-Resilient Urban Mobility',
    category: 'Smart Infrastructure',
    metric: '4 Verticals',
    metricLabel: 'Integrated Interdisciplinary Audits',
    description: 'Urban microclimate mitigation, storm drainage flow modeling, and multi-modal transit planning guiding municipal authorities toward resilient zero-emission infrastructure.',
    icon: Wind,
    image: '/images/projects/urban-planning/images_upt.jpg',
    href: '/verticals/urban-planning-transportation',
  },
];

export default function SustainabilityStorytelling() {
  return (
    <section className="reveal py-24 bg-gradient-to-b from-[#FFFFFF] via-[#FAF8F4] to-[#F5EFE4] border-b border-[#E5E7EB] relative overflow-hidden">
      
      {/* Background Refractive Glows */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#C9BCA6]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/70 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Morphogenesis Reference 3) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[#C4921B] font-bold inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Environmental Stewardship &bull; Morphogenesis Impact Model</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight">
              Sustainability &amp; Ecological Engineering
            </h2>
            <p className="text-xs sm:text-sm text-[#747B83] leading-relaxed pt-1">
              Translating advanced civil and environmental research from IIT Madras into verified low-carbon infrastructure, zero-effluent water reuse, and climate-resilient urbanization.
            </p>
          </div>

          <Link
            href="/verticals/environment-sustainability"
            className="px-6 py-3 rounded-full text-xs font-semibold text-[#2B3B44] bg-white border border-[#D8CDB8] hover:bg-[#F5EFE4] hover:scale-105 active:scale-95 shadow-xs transition-all self-start md:self-end flex items-center gap-2"
          >
            <span>Explore Environmental Vertical</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C4921B]" />
          </Link>
        </div>

        {/* 4 Pillars Grid with Apple Liquid Glass and Photography */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SUSTAINABILITY_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <GlassPanel
                key={pillar.id}
                variant="card"
                interactive
                className="p-6 sm:p-8 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Icon & Category */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/90 border border-[#D8CDB8] flex items-center justify-center text-[#2B3B44] shadow-2xs group-hover:bg-[#F5EFE4] transition-colors">
                      <Icon className="w-5 h-5 text-[#2B3B44]" />
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/80 border border-[#E5E7EB] text-[#747B83]">
                      {pillar.category}
                    </span>
                  </div>

                  {/* Title & Verified Metric */}
                  <h3 className="font-serif text-2xl font-medium text-[#24272B] tracking-tight group-hover:text-[#2B3B44] transition-colors">
                    {pillar.title}
                  </h3>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-semibold text-[#2B3B44]">
                      {pillar.metric}
                    </span>
                    <span className="text-xs text-[#747B83] font-medium">
                      &bull; {pillar.metricLabel}
                    </span>
                  </div>

                  <p className="text-xs text-[#747B83] mt-3 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-6 mt-6 border-t border-[#E5E7EB] flex items-center justify-between">
                  <Link
                    href={pillar.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B3B44] group-hover:text-[#C4921B] transition-colors"
                  >
                    <span>Read Verification Methodology</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <span className="text-[10px] font-bold text-[#747B83] uppercase tracking-wider">
                    IIT Madras Research
                  </span>
                </div>
              </GlassPanel>
            );
          })}
        </div>

      </div>
    </section>
  );
}

