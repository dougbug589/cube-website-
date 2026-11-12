import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { verticals } from '@/data/verticals';
import { getPublishedProjects } from '@/lib/db/queries';

/**
 * One layout for all four vertical pages. Every word comes from the vertical's
 * page on cubeiitm.org (src/data/verticals.ts); projects are the published
 * projects filed under this vertical.
 */
export default async function VerticalDetail({ id }: { id: string }) {
  const vertical = verticals.find((v) => v.id === id)!;
  const projects = (await getPublishedProjects()).filter((p: any) => p.category === vertical.title);

  return (
    <div>
      <PageHeader
        badge="Vertical"
        title={vertical.title}
        description={vertical.tagline}
        breadcrumbs={[{ label: 'Verticals', href: '/verticals' }, { label: vertical.title }]}
      />

      {/* Introduction */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7 space-y-5 reveal">
            <p className="text-[19px] sm:text-xl text-[#243239] leading-relaxed">{vertical.description}</p>
            <p className="text-[17px] text-[#46565E] leading-relaxed">{vertical.longDescription}</p>
          </div>
          <div className="lg:col-span-5 relative h-80 sm:h-[420px] rounded-[28px] overflow-hidden depth-2 bg-[#DCE4E8] reveal">
            <Image src={vertical.heroImage} alt="" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Services */}
      {vertical.capabilities.length > 0 && (
        <section className="pb-16 lg:pb-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <p className="label-mono reveal">Services</p>
            <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal-stagger">
              {vertical.capabilities.map((c) => (
                <li key={c} className="glass rounded-[22px] px-6 py-5 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C4921B] shrink-0" />
                  <span className="text-[17px] font-semibold text-[#243239]">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Expertise with figures (Building & Construction) */}
      {vertical.keyServices.length > 0 && (
        <section className="py-16 lg:py-20 band-mist">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <p className="label-mono reveal">Expertise</p>
            <div className="mt-6 grid md:grid-cols-2 gap-5 reveal-stagger">
              {vertical.keyServices.map((k) => (
                <div key={k.title} className="glass glass-interactive glass-edge rounded-[26px] p-7 flex flex-col">
                  <h2 className="font-display text-2xl font-extrabold text-[#243239]">{k.title}</h2>
                  {k.items && k.items.length > 0 && (
                    <ul className="mt-5 grid sm:grid-cols-2 gap-x-5 gap-y-3">
                      {k.items.map((it) => (
                        <li key={it} className="flex items-start gap-2.5 text-[16px] font-semibold text-[#243239] leading-snug">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C4921B] shrink-0" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  )}
                  {k.description && <p className="mt-5 pt-5 border-t border-[#33454E]/10 text-[15px] text-[#5B6A71] leading-relaxed">{k.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <h2 className="headline-light text-3xl sm:text-4xl text-[#243239] reveal">
              Projects <span className="text-[#C4921B]">({projects.length})</span>
            </h2>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj: any) => (
                <ProjectCard key={proj.slug} project={proj} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex justify-center">
          <Link href="/contact" className="press btn-gold gold-shimmer inline-flex items-center gap-2 h-12 px-7 rounded-full text-[16px] font-extrabold">
            Contact CUBE <ArrowUpRight size={16} strokeWidth={2.25} />
          </Link>
        </div>
      </section>
    </div>
  );
}
