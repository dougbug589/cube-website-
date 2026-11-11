import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { Leaf, Droplets, CheckCircle2, ArrowRight, FlaskConical, Waves, ShieldCheck } from 'lucide-react';
import { verticals } from '@/data/verticals';
import { getPublishedProjects } from '@/lib/db/queries';

// Always render with live CMS data (archived projects disappear instantly).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Environment & Sustainability Vertical | CUBE IIT Madras',
  description: 'Water resources, STP/ETP design, 2D flood hydrodynamic modeling, lake rejuvenation, and sustainability advisory by CUBE.',
};

export default async function EnvironmentSustainabilityPage() {
  const projects = await getPublishedProjects();
  const vertical = verticals.find((v) => v.id === 'environment-sustainability')!;
  const verticalProjects = projects.filter((p: any) => p.category === 'Environment & Sustainability');

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageHeader
        badge="Core Vertical"
        title={vertical.title}
        description={vertical.longDescription}
        breadcrumbs={[
          { label: 'Verticals', href: '/verticals' },
          { label: 'Environment & Sustainability' },
        ]}
      />

      {/* Main Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Overview Grid - Stacked on Mobile, 2-Col on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
                <Leaf className="w-3.5 h-3.5 text-teal-600" />
                <span>Water &amp; Ecological Engineering</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-navy-950 leading-tight">
                {vertical.tagline}
              </h2>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {vertical.longDescription}
              </p>

              {/* Verified Capabilities Checklist */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vertical.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-start text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical Visual Feature */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-cube border border-slate-200 group">
              <Image
                src={vertical.heroImage}
                alt="Environment & Sustainability CUBE"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070E5C]/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-medium bg-white/90 text-[#24272B] backdrop-blur-md p-3 rounded-xl border border-[#BDD7E8]">
                Ecological Restoration &amp; Urban Watershed Management
              </div>
            </div>

          </div>

          {/* Key Environmental Services */}
          <div className="mt-12 pt-12 border-t border-slate-200">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Specialized Mandates
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-navy-950 mt-2">
                Key Environmental Services &amp; Advisory
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vertical.keyServices.map((srv, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-teal-400/60 hover:shadow-lg transition-all duration-300">
                  <h4 className="text-base font-bold text-navy-950 mb-2 flex items-center">
                    <Waves className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" />
                    <span>{srv.title}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Connected CEL Environmental Laboratory Banner */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-[#060F1E] to-[#0A1A33] text-white border border-teal-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[11px] uppercase tracking-wider font-bold text-teal-300 bg-teal-900/60 px-3 py-1 rounded-full border border-teal-400/30">
                Co-Located Testing Laboratory
              </span>
              <h4 className="text-xl sm:text-2xl font-bold font-display">
                CUBE Environmental Laboratory (CEL)
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Providing comprehensive water quality, wastewater analysis, and solid waste characterization with state-of-the-art analytical equipment.
              </p>
            </div>
            <Link
              href="/cel"
              className="px-6 py-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-navy-950 font-bold text-xs sm:text-sm flex-shrink-0 transition-all shadow-cube-glow flex items-center"
            >
              <span>Explore CEL Services</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Landmark Projects in this Vertical */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  Applied Track Record
                </span>
                <h3 className="text-2xl font-bold font-display text-navy-950 mt-2">
                  Featured Environmental Projects
                </h3>
              </div>
              <Link
                href="/projects"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center"
              >
                <span>View All 40+ Projects</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {verticalProjects.slice(0, 3).map((proj) => (
                <ProjectCard key={proj.slug} project={proj} />
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
