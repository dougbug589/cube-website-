import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import PhotoGrid from '@/components/common/PhotoGrid';
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
    <section className="space-y-5">
      <h2 className="font-display text-[26px] sm:text-[28px] font-extrabold text-[#F3F5F6]">{title}</h2>
      {children}
    </section>
  );
}

// Long single paragraphs of facts ("Total Builtup Area: ... Total Buildings
// (Blocks) - 27 Nos. ...") read better one fact per line. Split only at a
// full stop followed by a capital letter; short text is left as it is.
const asLines = (items: string[]) =>
  items.length === 1 && items[0].length > 160
    ? items[0].split(/(?<=\.)\s+(?=[A-Z])/).map((x) => x.trim()).filter(Boolean)
    : items;

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3.5 text-[18px] text-[#F3F5F6] leading-relaxed">
          <CheckCircle2 className="w-5 h-5 text-[#F6C22E] mt-1.5 shrink-0" />
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
    <div className="text-[#F3F5F6] min-h-screen">
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

      {project.heroImage && (
        <div className="shell">
          <div className="relative aspect-[16/9] lg:aspect-[21/8] w-full rounded-[32px] overflow-hidden depth-3 bg-[#1A1F22]">
            <Image src={project.heroImage} alt={project.title} fill sizes="(max-width: 1600px) 100vw, 1536px" className="object-cover" priority />
          </div>
        </div>
      )}

      <section className="py-14 lg:py-16">
        <div className="shell">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Main content: only what the project's page on cubeiitm.org states */}
            <div className="lg:col-span-8 space-y-12">

              {descriptionLines.length > 0 && (
                <Block title="Description">
                  {descriptionLines.length === 1 && descriptionLines[0].length <= 160 ? (
                    <p className="text-[19px] text-[#F3F5F6] leading-relaxed whitespace-pre-line">{descriptionLines[0]}</p>
                  ) : (
                    <Bullets items={asLines(descriptionLines)} />
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
                  <Bullets items={asLines(highlights)} />
                </Block>
              )}

              {gallery.length > 0 && (
                <Block title="Photographs">
                  <PhotoGrid photos={gallery} title={project.title} />
                </Block>
              )}
            </div>

            {/* Facts and figures, as listed on the live project page */}
            <div className="lg:col-span-4">
              <div className="glass rounded-[28px] p-7 space-y-5 lg:sticky lg:top-[calc(var(--nav-offset,93px)+1rem)]">
                <h2 className="font-display text-[22px] font-extrabold text-[#F3F5F6] pb-3 border-b border-white/10">Facts and figures</h2>
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <span className="label-mono block">{label}</span>
                    <span className="mt-1 block text-[17px] font-semibold text-[#F3F5F6] leading-snug whitespace-pre-line">{value}</span>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/10">
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
        <section className="band-mist py-16 lg:py-20">
          <div className="shell">
            <h2 className="headline-light text-3xl sm:text-[2.4rem] text-[#F3F5F6] mb-8">
              More in {project.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
