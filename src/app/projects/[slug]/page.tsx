import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { 
  Building2, CheckCircle2, Target, Wrench, 
  ArrowLeft, ArrowRight, ShieldCheck, MapPin, ArrowUpRight, Sparkles
} from 'lucide-react';
import { getProjectBySlug, getPublishedProjects } from '@/lib/db/queries';
import { GlassPanel } from '@/components/common/AppleLiquidGlass';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Project Not Found | CUBE' };
  return {
    title: `${project.title} | CUBE Projects`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const allProjects = await getPublishedProjects();
  const relatedProjects = allProjects
    .filter((p) => p.category === project.category && p.slug !== project.slug)
    .slice(0, 3);

  return (
    <div className="bg-[#FFFFFF] text-[#24272B] min-h-screen">
      <PageHeader
        badge={project.category}
        title={project.title}
        description={project.description}
        backHref="/projects"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.title },
        ]}
      />

      <section className="py-20 bg-gradient-to-b from-[#FFFFFF] via-[#F6FAFD] to-[#EAF2F8] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left 8 Cols: Main Project Content */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Hero Image with Apple Frosted Frame */}
              <div className="relative h-96 sm:h-[480px] w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(7,14,92,0.08)] border-2 border-white ring-1 ring-[#BDD7E8] bg-slate-100">
                <Image
                  src={project.heroImage || '/images/hero/slides_iit-tirupathi.jpg'}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating Inset Badge */}
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-white z-10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D99A42]" />
                    <span className="text-xs sm:text-sm font-semibold drop-shadow-sm">
                      {project.location || 'Tamil Nadu, India'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-[#070E5C] backdrop-blur-md">
                    Verified State Scheme
                  </span>
                </div>
              </div>

              {/* Project Overview */}
              <GlassPanel variant="card" className="p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D99A42]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#070E5C]">
                    Comprehensive Case Study
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#24272B] tracking-tight">
                  Project Overview &amp; Mandate
                </h2>
                <p className="text-xs sm:text-sm text-[#747B83] leading-relaxed">
                  {project.description}
                </p>
              </GlassPanel>

              {/* Objectives */}
              {project.objectives && project.objectives.length > 0 && (
                <GlassPanel variant="card" className="p-8 space-y-5">
                  <div className="flex items-center space-x-2 text-[#070E5C] font-bold text-sm tracking-wide uppercase">
                    <Target className="w-4 h-4 text-[#D99A42]" />
                    <span>Project Objectives &amp; Technical Mandate</span>
                  </div>
                  <ul className="space-y-3 pt-2">
                    {project.objectives.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start text-xs sm:text-sm text-[#24272B]">
                        <CheckCircle2 className="w-4 h-4 text-[#D99A42] mr-2.5 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </GlassPanel>
              )}

              {/* Scope of Work */}
              {project.scopeOfWork && project.scopeOfWork.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-light text-[#24272B] flex items-center">
                    <Wrench className="w-5 h-5 text-[#070E5C] mr-2" />
                    <span>Scope of Engineering Work</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {project.scopeOfWork.map((scope: string, i: number) => (
                      <div 
                        key={i} 
                        className="p-5 rounded-2xl bg-white border border-[#BDD7E8] shadow-2xs hover:shadow-sm transition-all"
                      >
                        <span className="text-[10px] font-bold text-[#D99A42] uppercase tracking-wider block mb-1.5">
                          0{i + 1}. Mandate Scope
                        </span>
                        <p className="text-xs text-[#24272B] leading-relaxed">
                          {scope}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Horizontal Project Gallery */}
              {project.galleryImages && project.galleryImages.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="font-serif text-2xl font-light text-[#24272B]">
                    Site &amp; Execution Photographs
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {project.galleryImages.map((img: string, i: number) => (
                      <div 
                        key={i} 
                        className="relative h-48 rounded-2xl overflow-hidden shadow-xs border border-[#BDD7E8] group"
                      >
                        <Image
                          src={img}
                          alt={`${project.title} photo ${i + 1}`}
                          fill
                          className="object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Project Metadata Sidebar in Apple Liquid Glass */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-7 rounded-3xl apple-glass-card border border-[#BDD7E8] shadow-sm space-y-5 sticky top-28">
                <h3 className="font-serif text-lg font-medium text-[#24272B] pb-3 border-b border-[#E5E7EB]">
                  Project Specifications
                </h3>

                <div>
                  <span className="text-[10px] font-bold text-[#747B83] uppercase tracking-wider block">
                    Institutional Vertical
                  </span>
                  <span className="text-xs font-semibold text-[#070E5C] mt-1 block">
                    {project.category}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#747B83] uppercase tracking-wider block">
                    Execution Body
                  </span>
                  <span className="text-xs font-semibold text-[#24272B] mt-1 block">
                    CUBE IIT Madras
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-[#747B83] uppercase tracking-wider block">
                    Quality Mandate
                  </span>
                  <span className="text-xs text-[#747B83] mt-1 block leading-relaxed">
                    Independent Third-Party Quality Assurance (TPQA) &amp; Structural Proof Checking
                  </span>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]">
                  <Link
                    href="/contact"
                    className="w-full flex items-center justify-center py-3 px-4 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] hover:bg-[#D99A42] hover:text-white border border-[#BDD7E8] transition-all shadow-xs"
                  >
                    <span>Enquire for Similar Projects</span>
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-20 bg-[#FFFFFF] border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-light text-[#24272B] mb-8">
              Related Projects in {project.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
