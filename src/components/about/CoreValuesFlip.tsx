'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Award, HeartHandshake, Lightbulb, Mountain, Quote, ShieldCheck, Target } from 'lucide-react';

/**
 * Core values as a grid of flip cards: the fronts show the icon and the
 * value; one card at a time turns over in sequence to show its quote on the
 * back, then turns back as the next one flips. Hovering (or focusing) a card
 * flips it and pauses the sequence. Each face rotates on its own
 * (perspective() in its transform, backface hidden), so no preserve-3d
 * parent is needed and each face keeps its frosted-glass backdrop blur.
 * Pauses off screen / background tab; reduced motion = no auto-flip and an
 * instant cross-fade instead of the turn.
 */

type Value = { title: string; description: string };
const ICONS = [ShieldCheck, Award, HeartHandshake, Mountain, Lightbulb, Target];

const split = (d: string) => {
  const m = d.match(/^\s*[“"]?([\s\S]*?)[”"]?\s*[—–-]\s*([^—–-]+)$/);
  return m ? { quote: m[1].trim(), author: m[2].trim() } : { quote: d, author: '' };
};

export default function CoreValuesFlip({ values, interval = 1800 }: { values: Value[]; interval?: number }) {
  const n = values.length;
  const [auto, setAuto] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useRef(false);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hover;
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || n < 2) return;
    const id = setInterval(() => {
      if (hoverRef.current !== null || !inView.current || document.visibilityState !== 'visible') return;
      setAuto((x) => (x + 1) % n);
    }, interval);
    return () => clearInterval(id);
  }, [reduced, n, interval]);

  const flipped = hover ?? (reduced ? -1 : auto);
  const turn = reduced ? 'transition-opacity duration-200' : 'transition-[transform,opacity] duration-[750ms] ease-[cubic-bezier(0.34,1.3,0.64,1)]';

  return (
    <div ref={rootRef} role="list" aria-label="Core values" className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {values.map((val, i) => {
        const Icon = ICONS[i % ICONS.length];
        const { quote, author } = split(val.description);
        const on = flipped === i;
        return (
          <div
            key={val.title}
            role="listitem"
            tabIndex={0}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            className="relative h-[390px] md:h-[410px] xl:h-[390px] 2xl:h-[340px] rounded-[28px] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40"
          >
            {/* front */}
            <div
              aria-hidden={on}
              className={`absolute inset-0 glass glass-edge rounded-[28px] p-7 lg:p-8 flex flex-col [backface-visibility:hidden] ${turn}`}
              style={{ transform: reduced ? undefined : `perspective(1200px) rotateY(${on ? 180 : 0}deg)`, opacity: reduced && on ? 0 : 1 }}
            >
              <div className="flex items-center justify-between">
                <span className="grid place-items-center w-16 h-16 rounded-[20px] pill-yellow text-[#0B0D0E]">
                  <Icon size={28} strokeWidth={2} />
                </span>
                <span className="font-display text-[15px] font-extrabold text-[#F6C22E] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <h2 className="mt-auto font-display text-[36px] lg:text-[40px] font-extrabold text-[#F3F5F6] leading-tight">{val.title}</h2>
            </div>

            {/* back: the quote */}
            <div
              aria-hidden={!on}
              className={`absolute inset-0 liquid-glass rounded-[28px] p-7 lg:p-8 flex flex-col ring-1 ring-[#F6C22E]/45 [backface-visibility:hidden] ${turn}`}
              style={{ transform: reduced ? undefined : `perspective(1200px) rotateY(${on ? 0 : -180}deg)`, opacity: reduced && !on ? 0 : 1 }}
            >
              <div className="flex items-center gap-3">
                <span className="grid place-items-center w-11 h-11 rounded-2xl pill-yellow text-[#0B0D0E]">
                  <Quote size={18} strokeWidth={2.25} />
                </span>
                <p className="font-display text-[22px] font-extrabold text-[#F3F5F6]">{val.title}</p>
              </div>
              <p className="mt-5 text-[16.5px] sm:text-[18px] leading-relaxed text-[#F3F5F6]">“{quote}”</p>
              {author && <p className="mt-auto pt-4 border-t border-white/10 text-[15.5px] font-bold text-[#F6C22E]">— {author}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
