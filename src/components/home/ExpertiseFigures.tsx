'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { verticals } from '@/data/verticals';
import { parseFigure, fmtFigure, type Figure } from '@/lib/figures';

/**
 * "TPQA – Expertise Highlights" from the Building & Construction page of
 * cubeiitm.org, read from the vertical data (single source of truth) and
 * shown as a light ledger: big tabular figures that count up once when the
 * row comes into view, a gold rule that draws under each, and the source link.
 * Text updates go straight to the DOM in rAF (no React re-render per frame).
 */

const BC = verticals.find((v: any) => v.slug === 'building-construction') as any;
const TPQA = BC?.keyServices?.find((k: any) => /tpqa/i.test(k.title));
const FIGURES: Figure[] = ((TPQA?.items as string[]) || []).map(parseFigure).filter(Boolean) as Figure[];

const easeOutExpo = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));

export default function ExpertiseFigures() {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || FIGURES.length === 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const run = () => {
      setShown(true);
      if (reduce) return;
      const t0 = performance.now();
      const D = 1700;
      const tick = (t: number) => {
        FIGURES.forEach((f, i) => {
          // a short stagger so the figures land one after another
          const k = Math.min(1, Math.max(0, (t - t0 - i * 140) / D));
          const el = numRefs.current[i];
          if (el) el.textContent = fmtFigure(f.value * easeOutExpo(k), f.decimals);
        });
        if (t - t0 < D + FIGURES.length * 140) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  if (FIGURES.length === 0) return null;

  return (
    <section id="expertise" aria-labelledby="expertise-title" className="relative pb-16 lg:pb-24">
      <div ref={rootRef} className="shell">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 lg:mb-10">
          <div>
            <p className="label-mono">TPQA · Expertise highlights</p>
            <h2 id="expertise-title" className="headline-light text-[1.9rem] sm:text-[2.2rem] text-[#243239] mt-2">
              Third-party quality assurance, by the numbers.
            </h2>
          </div>
          <Link
            href="/verticals/building-construction"
            className="group self-start md:self-auto inline-flex items-center gap-2 text-[16px] font-bold text-[#243239] border-b-2 border-[#C4921B] pb-1 hover:text-[#9A7015] transition-colors"
          >
            Building &amp; Construction
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4 border-y border-[#33454E]/10">
          {FIGURES.map((f, i) => (
            <div
              key={f.lead}
              className={`relative py-8 lg:py-10 px-4 sm:px-6 lg:px-8 ${i % 2 === 1 ? 'border-l' : ''} ${i > 0 ? 'lg:border-l' : ''} ${i > 1 ? 'border-t lg:border-t-0' : ''} border-[#33454E]/10`}
            >
              <dt className="text-[15px] font-semibold text-[#4B5A61]">{f.lead}</dt>
              <dd className="mt-3 flex items-baseline gap-2 flex-wrap">
                {f.prefix && <span className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#9A7015]">{f.prefix}</span>}
                <span
                  ref={(el) => {
                    numRefs.current[i] = el;
                  }}
                  className="font-display text-[44px] sm:text-[56px] xl:text-[64px] font-extrabold leading-none tracking-[-0.03em] text-[#243239] tabular-nums"
                >
                  {fmtFigure(f.value, f.decimals)}
                </span>
                <span className="font-display text-[18px] sm:text-[22px] font-extrabold text-[#C4921B]">{f.unit}</span>
              </dd>
              {/* gold rule draws in under each figure (transform only) */}
              <span
                aria-hidden
                className="absolute left-4 sm:left-6 lg:left-8 bottom-0 h-[3px] w-16 rounded-full bg-gradient-to-r from-[#E9B215] to-[#C4921B] origin-left transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: shown ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: `${i * 140 + 300}ms` }}
              />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
