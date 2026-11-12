'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Pause, Play, Quote } from 'lucide-react';

/**
 * Leadership message: portrait on the left, the message on the right inside a
 * raised liquid-glass "reading window" that scrolls itself, slowly, like a
 * teleprompter. It starts once the box is on screen, pauses while the pointer
 * is over it or the reader scrolls it by hand (resumes a few seconds later),
 * holds at the end, glides back to the top and starts again. A pause button
 * stops it for good (WCAG 2.2.2); reduced motion turns it off entirely.
 * Scrolling is driven by rAF writes to scrollTop (no React re-renders).
 */

const SPEED = 24; // px per second
const START_DELAY = 1400; // ms after the box comes into view
const END_HOLD = 2600; // ms at the end before rewinding
const AFTER_USER = 3500; // ms of quiet after a manual scroll

export default function MessageSection({
  id,
  label,
  image,
  name,
  lines,
  paragraphs,
  band = false,
}: {
  id: string;
  label: string;
  image: string;
  name: string;
  lines: string[];
  paragraphs: string[];
  band?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  playingRef.current = playing;
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(reduce);

    // progress rail follows the scroll position (manual or automatic)
    const syncThumb = () => {
      const t = thumbRef.current;
      if (!t) return;
      const max = box.scrollHeight - box.clientHeight;
      const ratio = box.clientHeight / box.scrollHeight;
      t.style.height = `${Math.max(12, ratio * 100)}%`;
      t.style.transform = `translateY(${max > 0 ? (box.scrollTop / max) * ((1 - ratio) / ratio) * 100 : 0}%)`;
    };
    syncThumb();
    box.addEventListener('scroll', syncThumb, { passive: true });
    window.addEventListener('resize', syncThumb, { passive: true });
    if (reduce) {
      return () => {
        box.removeEventListener('scroll', syncThumb);
        window.removeEventListener('resize', syncThumb);
      };
    }

    let raf = 0;
    let last = 0;
    let pos = box.scrollTop;
    let inView = false;
    let hover = false;
    let holdUntil = 0;
    let phase: 'run' | 'end' | 'rewind' = 'run';
    let selfScroll = false; // ignore scroll events we caused

    const io = new IntersectionObserver(
      ([e]) => {
        const was = inView;
        inView = e.isIntersecting && e.intersectionRatio > 0.35;
        if (inView && !was) holdUntil = performance.now() + START_DELAY;
      },
      { threshold: [0, 0.35, 0.6] }
    );
    io.observe(box);

    const userScrolled = () => {
      if (selfScroll) return;
      holdUntil = performance.now() + AFTER_USER;
      pos = box.scrollTop;
      phase = 'run';
    };
    const onEnter = () => (hover = true);
    const onLeave = () => {
      hover = false;
      holdUntil = Math.max(holdUntil, performance.now() + 800);
      pos = box.scrollTop;
    };
    box.addEventListener('wheel', userScrolled, { passive: true });
    box.addEventListener('touchstart', userScrolled, { passive: true });
    box.addEventListener('keydown', userScrolled);
    box.addEventListener('pointerenter', onEnter);
    box.addEventListener('pointerleave', onLeave);

    const step = (t: number) => {
      raf = requestAnimationFrame(step);
      const dt = last ? Math.min(64, t - last) : 0;
      last = t;
      const active = inView && playingRef.current && !hover && document.visibilityState === 'visible';
      if (!active || t < holdUntil) {
        pos = box.scrollTop;
        return;
      }
      const max = box.scrollHeight - box.clientHeight;
      if (max <= 1) return;

      if (phase === 'end') {
        // glide back to the top, then pause before the next pass
        phase = 'rewind';
        selfScroll = true;
        box.scrollTo({ top: 0, behavior: 'smooth' });
        holdUntil = t + 1600;
        window.setTimeout(() => (selfScroll = false), 1400);
        return;
      }
      if (phase === 'rewind') {
        phase = 'run';
        pos = box.scrollTop;
      }
      pos = Math.min(max, pos + (SPEED * dt) / 1000);
      selfScroll = true;
      box.scrollTop = pos;
      selfScroll = false;
      if (pos >= max - 0.5) {
        phase = 'end';
        holdUntil = t + END_HOLD;
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      box.removeEventListener('scroll', syncThumb);
      window.removeEventListener('resize', syncThumb);
      box.removeEventListener('wheel', userScrolled);
      box.removeEventListener('touchstart', userScrolled);
      box.removeEventListener('keydown', userScrolled);
      box.removeEventListener('pointerenter', onEnter);
      box.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <section id={id} className={`scroll-mt-40 py-16 lg:py-24 ${band ? 'band-mist' : ''}`}>
      <div className="shell grid lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
        {/* portrait with a name plate, soft gold aura behind for depth */}
        <figure className="lg:col-span-4 relative reveal">
          <div aria-hidden className="absolute -inset-6 rounded-[48px] bg-[radial-gradient(60%_60%_at_40%_40%,rgba(240,196,104,0.35),transparent_70%)] blur-2xl pointer-events-none" />
          <div className="relative h-[440px] sm:h-[520px] lg:h-[560px] rounded-[32px] overflow-hidden depth-3 bg-[#DCE4E8]">
            <Image src={image} alt={name} fill sizes="(max-width: 1024px) 92vw, 34vw" className="object-cover object-[50%_25%]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1B262C]/70 via-transparent to-transparent" />
            <figcaption className="chip-photo absolute left-4 right-4 bottom-4 rounded-[22px] px-5 py-4 text-white">
              <span className="block font-display text-[22px] font-extrabold leading-tight">{name}</span>
              {lines.map((l) => (
                <span key={l} className="block mt-0.5 text-[15px] text-white/85 font-semibold">{l}</span>
              ))}
            </figcaption>
          </div>
        </figure>

        {/* the message: raised glass reading window that scrolls itself */}
        <div className="lg:col-span-8 reveal">
          <div className="liquid-glass is-solid relative h-[460px] sm:h-[520px] lg:h-[560px] rounded-[32px] depth-3 flex flex-col overflow-hidden">
            <div className="relative flex items-center gap-3 px-6 sm:px-9 pt-6 sm:pt-7 pb-3">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-gradient-to-b from-[#F8E3A3] to-[#F0C468] text-[#243239] depth-1 shrink-0">
                <Quote size={19} strokeWidth={2.25} />
              </span>
              <p className="label-mono">{label}</p>
              {!reduced && (
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-pressed={!playing}
                  aria-label={playing ? `Pause the ${label} auto-scroll` : `Play the ${label} auto-scroll`}
                  className="press ml-auto inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-white/80 border border-[#33454E]/10 text-[14px] font-bold text-[#46565E] hover:text-[#243239] transition-colors"
                >
                  {playing ? <Pause size={14} strokeWidth={2.5} /> : <Play size={14} strokeWidth={2.5} />}
                  {playing ? 'Pause' : 'Play'}
                </button>
              )}
            </div>

            <div className="relative flex-1 min-h-0">
              <div
                ref={boxRef}
                tabIndex={0}
                aria-label={`${label} from ${name}`}
                className="message-window h-full overflow-y-auto overscroll-contain no-scrollbar px-6 sm:px-9 pr-10 sm:pr-14 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F0C468]/40 rounded-b-[32px]"
              >
                <div className="pt-4 pb-16">
                  {paragraphs[0] && (
                    <p className="font-display text-[21px] sm:text-[24px] leading-[1.6] text-[#243239] font-semibold">{paragraphs[0]}</p>
                  )}
                  <div className="mt-6 space-y-5 text-[17px] sm:text-[19px] leading-[1.75] text-[#46565E]">
                    {paragraphs.slice(1).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                  <p className="mt-8 pt-6 border-t border-[#33454E]/10">
                    <span className="block font-display text-[19px] font-extrabold text-[#243239]">{name}</span>
                    <span className="block text-[15.5px] text-[#5B6A71]">{lines.join(' · ')}</span>
                  </p>
                </div>
              </div>
              {/* progress rail */}
              <div aria-hidden className="absolute right-4 sm:right-5 top-3 bottom-6 w-[3px] rounded-full bg-[#33454E]/[0.08] overflow-hidden">
                <div ref={thumbRef} className="w-full rounded-full bg-gradient-to-b from-[#E9B215] to-[#C4921B] will-change-transform" style={{ height: '30%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
