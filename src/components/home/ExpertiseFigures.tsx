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

// eases out gently, so the climb stays visible right up to the final value
const easeOutCubic = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(1 - k, 3));
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

        <dl ref={rowRef} className="grid grid-cols-2 lg:grid-cols-4 border-y border-[#33454E]/10">
          {FIGURES.map((f, i) => (
            <div
              key={f.lead}
              className={`relative py-8 lg:py-10 px-4 sm:px-6 lg:px-8 ${i % 2 === 1 ? 'border-l' : ''} ${i > 0 ? 'lg:border-l' : ''} ${i > 1 ? 'border-t lg:border-t-0' : ''} border-[#33454E]/10`}
            >
              <dt className="text-[15px] font-semibold text-[#4B5A61]">{f.lead}</dt>
              <dd
                className="mt-3 flex items-baseline gap-2 flex-wrap"
                // the visible digits count and scramble; assistive tech gets the real figure
                aria-label={[f.prefix, fmtFigure(f.value, f.decimals), f.unit].filter(Boolean).join(' ')}
              >
                {f.prefix && <span className="font-display text-[22px] sm:text-[26px] font-extrabold text-[#9A7015]">{f.prefix}</span>}
                <span
                  ref={(el) => {
                    numRefs.current[i] = el;
                  }}
                  aria-hidden
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
