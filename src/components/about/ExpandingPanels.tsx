'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Monogram } from '@/components/common/PersonCard';

/**
 * Expanding panels (the CodePen "expanding flex cards" pattern): every member
 * is a tall strip side by side; the open one widens to show the full portrait
 * with name, role and organisation, the rest stay narrow and dimmed. The open
 * panel moves along on its own; hovering or clicking a strip opens it (and
 * pauses the auto-advance). Phones stack the strips vertically instead.
 * Pauses off screen and in background tabs; reduced motion = no auto-advance.
 * Only 12 flex items change size, so the flex-grow transition stays cheap.
 */

type Member = { name: string; role?: string; organization?: string; image?: string };

export default function ExpandingPanels({ members, interval = 2200, label }: { members: Member[]; interval?: number; label: string }) {
  const n = members.length;
  const [open, setOpen] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const inView = useRef(false);
  const lastMove = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = useCallback((k: number) => {
    lastMove.current = performance.now();
    setOpen(k);
  }, []);

  useEffect(() => {
    if (reduced || n < 2) return;
    const id = setInterval(() => {
      if (paused.current || !inView.current || document.visibilityState !== 'visible') return;
      if (performance.now() - lastMove.current < interval * 0.9) return;
      lastMove.current = performance.now();
      setOpen((x) => (x + 1) % n);
    }, interval);
    return () => clearInterval(id);
  }, [reduced, n, interval]);

  if (n === 0) return null;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="flex flex-col md:flex-row gap-2 md:gap-2.5 md:h-[500px]"
    >
      {members.map((m, k) => {
        const on = k === open;
        return (
          <button
            key={m.name}
            type="button"
            onClick={() => show(k)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && show(k)}
            aria-expanded={on}
            aria-label={`${m.name}${m.role ? `, ${m.role}` : ''}`}
            className={`group relative overflow-hidden rounded-[22px] md:rounded-[26px] bg-[#1A1F22] text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/50 transition-[flex-grow,height,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:h-full md:min-w-0 md:basis-0 shrink-0 md:shrink ${
              on
                ? 'h-[340px] md:grow-[9] ring-2 ring-[#F6C22E] shadow-[0_0_26px_-4px_rgba(246,194,46,0.45)]'
                : 'h-[52px] md:grow'
            }`}
          >
            {m.image ? (
              <Image
                src={m.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover object-[50%_22%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${on ? 'scale-100' : 'scale-110'}`}
              />
            ) : (
              <Monogram name={m.name} className="absolute inset-0" />
            )}
            {/* shade: dark on closed strips, a bottom gradient on the open one */}
            <span
              aria-hidden
              className={`absolute inset-0 transition-opacity duration-700 ${on ? 'opacity-0' : 'opacity-100'} bg-[#0B0D0E]/60 group-hover:bg-[#0B0D0E]/45`}
            />
            <span aria-hidden className={`absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0B0D0E]/95 via-[#0B0D0E]/55 to-transparent transition-opacity duration-700 ${on ? 'opacity-100' : 'opacity-0'}`} />

            {/* closed strip: name runs up the strip (desktop) / across it (phone) */}
            <span
              className={`absolute font-display font-bold text-white/85 whitespace-nowrap transition-opacity duration-300 ${on ? 'opacity-0' : 'opacity-100 delay-200'}
                left-4 top-1/2 -translate-y-1/2 text-[15px]
                md:left-1/2 md:top-auto md:bottom-5 md:translate-y-0 md:-translate-x-1/2 md:[writing-mode:vertical-rl] md:rotate-180 md:text-[14.5px]`}
            >
              {m.name}
            </span>

            {/* open panel: details */}
            <span className={`absolute inset-x-0 bottom-0 p-5 md:p-7 transition-[opacity,transform] duration-500 ${on ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-3'}`}>
              <span className="block text-[13.5px] font-extrabold tracking-[0.1em] uppercase text-[#F6C22E]">{m.role || 'Board Member'}</span>
              <span className="mt-1.5 block font-display text-[24px] md:text-[30px] font-extrabold text-white leading-tight">{m.name}</span>
              {m.organization && <span className="mt-1.5 block text-[15.5px] md:text-[16.5px] text-white/80 leading-snug line-clamp-2 max-w-xl">{m.organization}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
