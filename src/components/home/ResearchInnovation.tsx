'use client';

import React from 'react';
import Link from 'next/link';
import { Lightbulb, Cpu, FileCheck2, FlaskConical, ArrowUpRight, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
import { GlassPanel } from '@/components/common/AppleLiquidGlass';

const INNOVATION_DOMAINS = [
  {
    title: 'Digital Twin & Smart Infrastructure',
    tag: 'Vertical 3: Smart Cities',
    description: 'Developing IoT telemetry, dynamic structural vibration monitoring, and predictive failure analysis for critical bridges, high-rises, and industrial towers.',
    deliverable: 'Real-time telemetry proof checking & sensor analytics',
    icon: Cpu,
  },
  {
    title: 'Advanced Materials & Concrete Durability',
    tag: 'Vertical 1: Building Systems',
    description: 'Rapid chloride penetration testing (RCPT), carbonation resistance, non-destructive testing (NDT), and precast seismic connection assessments.',
    deliverable: '50-100 year structural design service-life validation',
    icon: Building2,
  },
  {
    title: 'Environmental Diagnostics & Micro-Pollutants',
    tag: 'CEL Analytical Testing',
    description: 'ICP-MS and atomic absorption spectroscopy for heavy metals, organic micropollutants, industrial wastewater profiling, and groundwater hydrology.',
    deliverable: 'CPCB / BIS compliant ISO testing certifications',
    icon: FlaskConical,
  },
  {
    title: 'Applied Engineering Policy & Codes',
    tag: 'Governance Translation',
    description: 'Formulating technical specifications, state government public works tenders, precast design codes, and green building performance standards.',
    deliverable: 'Independent technical guidelines for government departments',
    icon: FileCheck2,
  },
];

export default function ResearchInnovation() {
  return (
    <section className="py-24 bg-[#FFFFFF] border-b border-[#E5E7EB] relative overflow-hidden">
      
      {/* Soft Ambient Depth */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#EAF2F8]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-[#D99A42] font-bold inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Applied Research Translation &bull; IIT Madras Ecosystem</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight mt-2">
            Research, Innovation &amp; Consultancy
          </h2>
          <p className="text-xs sm:text-sm text-[#747B83] mt-2 leading-relaxed">
            Uniting world-renowned academic intellect with practical municipal engineering to solve high-stakes challenges across South India.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INNOVATION_DOMAINS.map((domain, idx) => {
            const Icon = domain.icon;
            return (
              <GlassPanel
                key={idx}
                variant="card"
                interactive
                className="p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#BDD7E8] flex items-center justify-center text-[#070E5C] mb-4 shadow-2xs group-hover:bg-[#EAF2F8] transition-colors">
                    <Icon className="w-5 h-5 text-[#070E5C]" />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-0.5 rounded-full border border-[#BDD7E8]">
                    {domain.tag}
                  </span>

                  <h3 className="font-serif text-xl font-medium text-[#24272B] mt-3 tracking-tight group-hover:text-[#070E5C] transition-colors">
                    {domain.title}
                  </h3>

                  <p className="text-xs text-[#747B83] mt-2 leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E5E7EB]">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D99A42] flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-[#24272B]/90 leading-tight">
                      {domain.deliverable}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>

        {/* Action Link */}
        <div className="mt-12 text-center">
          <Link
            href="/about/advisory-panel"
            className="inline-flex items-center px-6 py-3 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] hover:bg-[#D99A42] hover:text-white border border-[#BDD7E8] shadow-2xs transition-all gap-2"
          >
            <span>Consult with IIT Madras Advisory Panel (25 Professors)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}

