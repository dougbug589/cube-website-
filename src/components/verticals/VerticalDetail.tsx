import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { verticals } from '@/data/verticals';
import { getPublishedProjects } from '@/lib/db/queries';
import { parseFigure, fmtFigure } from '@/lib/figures';

/**
 * One layout for all four vertical pages. Every word comes from the vertical's
 * page on cubeiitm.org (src/data/verticals.ts); projects are the published
 * projects filed under this vertical. Expertise items that contain a number
 * ("Over 35 Projects") are shown as figures, the rest as a list.
 */
export default async function VerticalDetail({ id }: { id: string }) {
  const vertical = verticals.find((v) => v.id === id)!;
  const projects = (await getPublishedProjects()).filter((p: any) => p.category === vertical.title);
  const others = verticals.filter((v) => v.id !== id);

  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader
        badge="Vertical"
        title={vertical.title}
        description={vertical.tagline}
        breadcrumbs={[{ label: 'Verticals', href: '/verticals' }, { label: vertical.title }]}
      />

      {/* wide photo */}
      <div className="shell">
        <div className="relative aspect-[16/9] lg:aspect-[21/8] rounded-[32px] overflow-hidden depth-3 bg-[#DCE4E8] reveal">
          <Image src={vertical.heroImage} alt={vertical.title} fill priority sizes="(max-width: 1600px) 100vw, 1536px" className="object-cover" />
        </div>
      </div>

      {/* introduction */}
      <section className="py-14 lg:py-20">
        <div className="shell grid lg:grid-cols-12 gap-8 lg:gap-14">
          <p className="lg:col-span-6 font-display text-[23px] sm:text-[27px] font-bold leading-[1.45] text-[#243239] reveal">{vertical.description}</p>
          <div className="lg:col-span-6 reveal">
            <p className="text-[18px] text-[#46565E] leading-relaxed">{vertical.longDescription}</p>
            {vertical.capabilities.length > 0 && (
              <>
                <p className="mt-8 label-mono">Services</p>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {vertical.capabilities.map((c) => (
                    <li key={c} className="inline-flex items-center gap-2 rounded-full bg-white border border-[#33454E]/10 px-4 py-2 text-[15.5px] font-semibold text-[#243239] depth-1">
                      <CheckCircle2 size={16} className="text-[#C4921B]" />
                      {c}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* expertise: figures where the item has a number */}
      {vertical.keyServices.length > 0 && (
        <section className="py-16 lg:py-20 band-mist">
          <div className="shell">
            <p className="label-mono reveal">Expertise</p>
            <div className="mt-6 grid lg:grid-cols-2 gap-5 reveal-stagger">
              {vertical.keyServices.map((k) => {
                const items = k.items || [];
                const figures = items.map((it) => ({ it, f: /\d/.test(it) ? parseFigure(it) : null }));
                const nums = figures.filter((x) => x.f);
                const words = figures.filter((x) => !x.f);
                return (
                  <article key={k.title} className="glass glass-edge rounded-[28px] p-7 lg:p-8 flex flex-col">
                    <h2 className="font-display text-[26px] font-extrabold text-[#243239]">{k.title}</h2>
                    {nums.length > 0 && (
                      <dl className="mt-5 grid grid-cols-2 gap-3">
                        {nums.map(({ it, f }) => (
                          <div key={it} className="rounded-[20px] bg-white/80 border border-[#33454E]/[0.08] p-4">
                            {f!.lead && <dt className="text-[14.5px] font-semibold text-[#5B6A71] leading-snug">{f!.lead}</dt>}
                            <dd className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                              {f!.prefix && <span className="font-display text-[17px] font-extrabold text-[#9A7015]">{f!.prefix}</span>}
                              <span className="font-display text-[34px] font-extrabold leading-none tracking-[-0.02em] text-[#243239] tabular-nums">{fmtFigure(f!.value, f!.decimals)}</span>
                              <span className="font-display text-[16px] font-extrabold text-[#C4921B] leading-snug">{f!.unit}</span>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {words.length > 0 && (
                      <ul className="mt-5 space-y-2.5">
                        {words.map(({ it }) => (
                          <li key={it} className="flex items-start gap-3 text-[17px] font-semibold text-[#243239] leading-snug">
                            <span className="mt-2 w-2 h-2 rounded-full bg-[#C4921B] shrink-0" />
                            {it}
                          </li>
                        ))}
                      </ul>
                    )}
                    {k.description && <p className="mt-6 pt-5 border-t border-[#33454E]/10 text-[16.5px] text-[#5B6A71] leading-relaxed">{k.description}</p>}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* projects */}
      {projects.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="shell">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 reveal">
              <h2 className="headline-light text-3xl sm:text-[2.6rem] text-[#243239]">
                Projects <span className="text-[#C4921B]">({projects.length})</span>
              </h2>
              <Link href="/projects" className="group self-start md:self-auto inline-flex items-center gap-2 text-[16px] font-bold text-[#243239] border-b-2 border-[#C4921B] pb-1 hover:text-[#9A7015] transition-colors">
                All projects <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj: any) => (
                <ProjectCard key={proj.slug} project={proj} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* other verticals */}
      <section className="band-mist py-16 lg:py-20">
        <div className="shell">
          <h2 className="headline-light text-3xl sm:text-[2.4rem] text-[#243239] mb-8">Other verticals</h2>
          <div className="grid sm:grid-cols-3 gap-5 reveal-stagger">
            {others.map((o) => (
              <Link key={o.id} href={`/verticals/${o.slug}`} className="press group relative h-64 rounded-[26px] overflow-hidden depth-2 bg-[#DCE4E8]">
                <Image src={o.heroImage} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]" />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/80 via-[#1B262C]/15 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-3 text-white">
                  <span className="font-display text-[22px] font-extrabold leading-tight">{o.title}</span>
                  <span className="chip-photo grid place-items-center w-10 h-10 rounded-full shrink-0 transition-transform duration-500 group-hover:rotate-45">
                    <ArrowUpRight size={17} strokeWidth={2.25} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="shell flex justify-center">
          <Link href="/contact" className="press btn-gold gold-shimmer inline-flex items-center gap-2 h-12 px-7 rounded-full text-[16px] font-extrabold">
            Contact CUBE <ArrowUpRight size={16} strokeWidth={2.25} />
          </Link>
        </div>
      </section>
    </div>
  );
}
