import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { getProjectBySlug, getPublishedProjects } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Project Not Found | CUBE' };
  return {
    title: `${project.title} | CUBE Projects`,
    description: String(project.description || '').split('\n')[0].slice(0, 200),
  };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-bold text-[#243239]">{title}</h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[17px] text-[#46565E] leading-relaxed">
          <CheckCircle2 className="w-5 h-5 text-[#C4921B] mt-1 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const p = project as any;
  const descriptionLines: string[] = String(p.description || '').split('\n').map((l: string) => l.trim()).filter(Boolean);
  const services: string[] = Array.isArray(p.services) ? p.services : [];
  const highlights: string[] = Array.isArray(p.highlights) ? p.highlights : [];
  const gallery: string[] = (Array.isArray(p.galleryImages) ? p.galleryImages : []).filter((g: string) => g && g !== p.heroImage);
  const facts: [string, string][] = (
    [
      ['Vertical', p.category],
      ['Client', p.client],
      ['Status', p.projectStatus],
      ['Start date', p.startDate],
      ['End date', p.endDate],
      ['Location', p.location],
      ['Scope of work', Array.isArray(p.scopeOfWork) ? p.scopeOfWork.join('\n') : ''],
    ] as [string, string | undefined][]
  ).filter((f): f is [string, string] => Boolean(f[1] && String(f[1]).trim()));

  const allProjects = await getPublishedProjects();
  const relatedProjects = allProjects
    .filter((p) => p.category === project.category && p.slug !== project.slug)
    .slice(0, 3);

  return (
    <div className="bg-transparent text-[#243239] min-h-screen">
      <PageHeader
        badge={project.category}
        title={project.title}
        description={[p.client, p.location, p.projectStatus].filter(Boolean).join(' · ')}
        backHref="/projects"
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: project.title },
        ]}
      />

      <section className="py-16 lg:py-20 bg-transparent border-b border-[#DCE4E7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Main content: only what the project's page on cubeiitm.org states */}
            <div className="lg:col-span-8 space-y-10">
              {project.heroImage && (
                <div className="relative h-80 sm:h-[460px] w-full rounded-[28px] overflow-hidden depth-2 bg-[#DCE4E8]">
                  <Image src={project.heroImage} alt={project.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
                </div>
              )}

              {descriptionLines.length > 0 && (
                <Block title="Description">
                  {descriptionLines.length === 1 ? (
                    <p className="text-[17px] text-[#46565E] leading-relaxed whitespace-pre-line">{descriptionLines[0]}</p>
                  ) : (
                    <Bullets items={descriptionLines} />
                  )}
                </Block>
              )}

              {services.length > 0 && (
                <Block title="Services">
                  <Bullets items={services} />
                </Block>
              )}

              {highlights.length > 0 && (
                <Block title="Key highlights">
                  {highlights.length === 1 ? (
                    <p className="text-[17px] text-[#46565E] leading-relaxed whitespace-pre-line">{highlights[0]}</p>
                  ) : (
                    <Bullets items={highlights} />
                  )}
                </Block>
              )}

              {gallery.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-[#243239]">Image gallery</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {gallery.map((img: string, i: number) => (
                      <div key={img} className="relative h-48 rounded-2xl overflow-hidden depth-1 bg-[#DCE4E8] group">
                        <Image
                          src={img}
                          alt={`${project.title}, photo ${i + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, 300px"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Facts and figures, as listed on the live project page */}
            <div className="lg:col-span-4">
              <div className="glass rounded-[28px] p-7 space-y-5 lg:sticky lg:top-[calc(var(--nav-offset,93px)+1rem)]">
                <h2 className="font-display text-xl font-bold text-[#243239] pb-3 border-b border-[#DCE4E7]">Facts and figures</h2>
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <span className="label-mono block">{label}</span>
                    <span className="mt-1 block text-[16px] font-semibold text-[#243239] leading-snug whitespace-pre-line">{value}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-[#DCE4E7]">
                  <Link
                    href="/contact"
                    className="press btn-soft w-full inline-flex items-center justify-center gap-1.5 h-12 rounded-full text-[15.5px] font-bold"
                  >
                    Enquire about similar work <ArrowUpRight size={16} strokeWidth={2.25} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-20 bg-transparent border-b border-[#DCE4E7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-[#243239] mb-8">
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
