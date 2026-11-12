import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, Wrench, HardHat } from 'lucide-react';
import { verticals } from '@/data/verticals';
import { getPublishedProjects } from '@/lib/db/queries';

// Always render with live CMS data (archived projects disappear instantly).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Building & Construction Vertical | CUBE IIT Madras',
  description: 'Structural design, PMC, third-party quality assurance (TPQA), precast technology and engineering consultancy by CUBE.',
};

export default async function BuildingConstructionPage() {
  const projects = await getPublishedProjects();
  const vertical = verticals.find((v) => v.id === 'building-construction')!;
  const verticalProjects = projects.filter((p: any) => p.category === 'Building & Construction');

  return (
    <div>
      <PageHeader
        badge="Core Vertical"
        title={vertical.title}
        description={vertical.longDescription}
        breadcrumbs={[
          { label: 'Verticals' },
          { label: 'Building & Construction' },
        ]}
      />

      {/* Overview & Key Services */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B07F14] bg-[#FBF6EA] px-3 py-1 rounded-full border border-[#C9BCA6]">
                Engineering Consultancy &amp; TPQA
              </span>
              <h2 className="text-3xl font-display font-extrabold text-navy-950">
                {vertical.tagline}
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {vertical.longDescription}
              </p>

              {/* Capabilities checklist */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vertical.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-[#C4921B] mr-2 flex-shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-cube border border-slate-200">
              <Image
                src={vertical.heroImage}
                alt="Building & Construction CUBE"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Key Services Grid */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold font-display text-navy-950 mb-8 text-center">
              Specialized Engineering Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vertical.keyServices.map((srv, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#C4921B] transition-all">
                  <h4 className="text-base font-bold text-navy-950 mb-2 flex items-center">
                    <Wrench className="w-4 h-4 text-[#C4921B] mr-2" />
                    {srv.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real Projects Grid */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B07F14] bg-[#FBF6EA] px-3 py-1 rounded-full border border-[#C9BCA6]">
              Field Execution
            </span>
            <h2 className="text-3xl font-display font-extrabold text-navy-950 mt-3">
              Building &amp; Construction Projects ({verticalProjects.length})
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Verified proof checking, TPQA, and project management consultancy across Tamil Nadu and national sites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {verticalProjects.map((proj) => (
              <ProjectCard key={proj.slug} project={proj} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-[#FFFFFF] via-[#FAF8F4] to-[#F5EFE4] border-t border-[#D8CDB8]/60 text-[#24272B] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Require Structural Assurance or PMC for Your Project?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#747B83]">
            Consult with IIT Madras faculty advisors and CUBE structural engineers for independent technical proof checking.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#C4921B] hover:bg-[#C77B60] shadow-md transition"
            >
              <span>Connect with Building Division</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

