'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { verticals } from '@/data/verticals';
import { parseFigure, fmtFigure, type Figure } from '@/lib/figures';

/**
 * "TPQA – Expertise Highlights" from the Building & Construction page of
 * cubeiitm.org, read from the vertical data (single source of truth) and
 * shown annual-report style: the project value as a large headline figure on
 * a glass card, the other figures as a ledger beside it (label left, figure
 * right). The figures count up when the block comes into view, then briefly
 * scramble and relock every few seconds.
 * Text updates go straight to the DOM in rAF (no React re-render per frame).
 */

const BC = verticals.find((v: any) => v.slug === 'building-construction') as any;
const TPQA = BC?.keyServices?.find((k: any) => /tpqa/i.test(k.title));
const FIGURES: Figure[] = ((TPQA?.items as string[]) || []).map(parseFigure).filter(Boolean) as Figure[];

// eases out gently, so the climb stays visible right up to the final value
const easeOutCubic = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(1 - k, 3));
// tidier unit wording for the ledger (the figures themselves are unchanged)
const UNIT: Record<string, string> = { Acres: 'acres', 'Mil Sqft': 'Mn sq ft' };
const D = 2200; // ms per figure
const STAGGER = 160; // ms between figures
// After the count, the figures briefly scramble through random values every
// 5 s and lock back onto the real figure, one after another.
const SCRAMBLE_EVERY = 5000;
const SCRAMBLE_LOCK = 650; // ms until the first figure locks
const SCRAMBLE_STEP = 45; // ms between random values
const randomLike = (v: number) => {
  const digits = String(Math.round(v)).length;
  const lo = digits > 1 ? 10 ** (digits - 1) : 0;
  return lo + Math.floor(Math.random() * (10 ** digits - lo));
};

export default function ExpertiseFigures() {
  const rootRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDListElement>(null);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || FIGURES.length === 0) return;
    // Server HTML shows the final figures (crawlers, no-JS, reduced motion).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    let raf = 0;
    let counting = false;
    let timer = 0;
    const write = (k: (i: number) => number) =>
      FIGURES.forEach((f, i) => {
        const el = numRefs.current[i];
        if (el) el.textContent = fmtFigure(f.value * k(i), f.decimals);
      });
    const scramble = () => {
      const t0 = performance.now();
      let last = 0;
      const tick = (t: number) => {
        const done = FIGURES.map((_, i) => t - t0 >= SCRAMBLE_LOCK + i * STAGGER);
        if (t - last >= SCRAMBLE_STEP || done.every(Boolean)) {
          last = t;
          FIGURES.forEach((f, i) => {
            const el = numRefs.current[i];
            if (el) el.textContent = fmtFigure(done[i] ? f.value : randomLike(f.value), done[i] ? f.decimals : 0);
          });
        }
        if (done.every(Boolean)) timer = window.setTimeout(scramble, SCRAMBLE_EVERY);
        else raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      counting = false;
      setShown(false);
      write(() => 0);
    };
    const run = () => {
      if (counting) return;
      counting = true;
      setShown(true);
      const t0 = performance.now();
      const tick = (t: number) => {
        write((i) => easeOutCubic(Math.min(1, Math.max(0, (t - t0 - i * STAGGER) / D))));
        if (t - t0 < D + FIGURES.length * STAGGER) raf = requestAnimationFrame(tick);
        else timer = window.setTimeout(scramble, SCRAMBLE_EVERY);
      };
      raf = requestAnimationFrame(tick);
    };
    // Start at zero until the reader reaches the row.
    reset();
    // Count once the row is well into view (most of it visible, above the
    // bottom fifth of the screen)...
    const enter = new IntersectionObserver(([e]) => e.isIntersecting && run(), {
      threshold: 0.6,
      rootMargin: '0px 0px -20% 0px',
    });
    // ...and go back to zero when it has left the screen, so it counts again
    // the next time the reader comes back to it.
    const leave = new IntersectionObserver(([e]) => !e.isIntersecting && counting && reset(), { threshold: 0 });
    enter.observe(row);
    leave.observe(row);
    return () => {
      enter.disconnect();
      leave.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  if (FIGURES.length === 0) return null;

  // the money figure leads; the rest form the ledger beside it
  const leadIdx = Math.max(0, FIGURES.findIndex((f) => f.prefix || /value/i.test(f.lead)));
  const lead = FIGURES[leadIdx];
  const rest = FIGURES.map((f, i) => ({ f, i })).filter((x) => x.i !== leadIdx);
  const num = (f: Figure, i: number, cls: string) => (
    <span
      ref={(el) => {
        numRefs.current[i] = el;
      }}
      aria-hidden
      className={`font-display font-extrabold leading-none tabular-nums text-[#F3F5F6] ${cls}`}
    >
      {fmtFigure(f.value, f.decimals)}
    </span>
  );
  // the visible digits count and scramble; assistive tech gets the real figure
  const spoken = (f: Figure) => [f.lead, f.prefix, fmtFigure(f.value, f.decimals), f.unit].filter(Boolean).join(' ');

  return (
    <section id="expertise" aria-labelledby="expertise-title" className="relative pb-16 lg:pb-24">
      <div ref={rootRef} className="shell">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 lg:mb-10">
          <div>
            <p className="label-mono">TPQA · Expertise highlights</p>
            <h2 id="expertise-title" className="headline-light text-[1.9rem] sm:text-[2.2rem] text-[#F3F5F6] mt-2">
              Third-party quality assurance, by the numbers.
            </h2>
          </div>
          <Link
            href="/verticals/building-construction"
            className="group self-start md:self-auto whitespace-nowrap inline-flex items-center gap-2 text-[16px] font-bold text-[#F3F5F6] border-b-2 border-[#F6C22E] pb-1 hover:text-[#F6C22E] transition-colors"
          >
            Building &amp; Construction
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <dl ref={rowRef} className="grid lg:grid-cols-12 gap-5 lg:gap-8 items-stretch">
          {/* the headline figure */}
          <div className="lg:col-span-5 liquid-glass rounded-[32px] p-7 sm:p-9 lg:p-10 flex flex-col justify-center">
            <dt className="label-mono">Value</dt>
            <dd className="mt-5" aria-label={spoken(lead)}>
              <span aria-hidden className="block text-[16px] font-semibold text-[#A7B2B8]">
                {lead.lead.replace(/^value\s+of\s*/i, '') || 'over'}
              </span>
              <span className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
                {lead.prefix && <span aria-hidden className="font-display text-[40px] sm:text-[52px] lg:text-[44px] xl:text-[58px] font-extrabold leading-none text-[#F6C22E]">₹</span>}
                {num(lead, leadIdx, 'text-[56px] sm:text-[76px] lg:text-[62px] xl:text-[84px] tracking-[-0.04em]')}
                <span aria-hidden className="font-display text-[24px] sm:text-[30px] font-extrabold text-[#F6C22E]">{lead.unit}</span>
              </span>
              <span
                aria-hidden
                className="mt-6 block h-[3px] w-20 rounded-full bg-[#F6C22E] origin-left transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: shown ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: '300ms' }}
              />
            </dd>
          </div>

          {/* the ledger: label on the left, figure on the right */}
          <div className="lg:col-span-7 flex flex-col justify-center border-y border-white/10 divide-y divide-white/10">
            {rest.map(({ f, i }) => (
              <div key={f.lead} className="py-6 lg:py-7 flex items-baseline justify-between gap-4 sm:gap-8">
                <dt className="text-[16px] sm:text-[18px] font-semibold text-[#A7B2B8] leading-snug">{f.lead.replace(/\bArea\b/, 'area')}</dt>
                <dd className="flex items-baseline gap-2 whitespace-nowrap" aria-label={spoken(f)}>
                  {num(f, i, 'text-[38px] sm:text-[48px] xl:text-[54px] tracking-[-0.03em]')}
                  <span aria-hidden className="font-display text-[17px] sm:text-[21px] font-extrabold text-[#F6C22E] [word-spacing:0.18em]">
                    {UNIT[f.unit] || f.unit}
                  </span>
                </dd>
              </div>
            ))}
          </div>
        </dl>
      </div>
    </section>
  );
}
