'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Monogram } from '@/components/common/PersonCard';

/**
 * Governing Body as a spotlight slideshow (deliberately different from the
 * carousels elsewhere on the page): a large portrait cross-fades to the next
 * member with a slow Ken Burns zoom, while the name, role and organisation
 * slide in on a glass panel beside it. A strip of every member's portrait sits
 * underneath: the current one is lit with a yellow ring, the rest dimmed;
 * clicking one jumps to it. Auto-advances; pauses on hover, keyboard focus,
 * off screen and in background tabs; reduced motion = no auto-advance and
 * plain fades. No arrows or dots.
 */

type Member = { name: string; role?: string; organization?: string; image?: string };

const EASE = [0.22, 1, 0.36, 1] as const;

export default function BoardSpotlight({ members, interval = 3000 }: { members: Member[]; interval?: number }) {
  const n = members.length;
  const [i, setI] = useState(0);
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

  const go = useCallback(
    (to: number) => {
      lastMove.current = performance.now();
      setI(((to % n) + n) % n);
    },
    [n]
  );

  useEffect(() => {
    if (reduced || n < 2) return;
    const id = setInterval(() => {
      if (paused.current || !inView.current || document.visibilityState !== 'visible') return;
      if (performance.now() - lastMove.current < interval * 0.9) return;
      lastMove.current = performance.now();
      setI((x) => (x + 1) % n);
    }, interval);
    return () => clearInterval(id);
  }, [reduced, n, interval]);

  if (n === 0) return null;
  const m = members[i];

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Governing Body"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(i + 1);
        else if (e.key === 'ArrowLeft') go(i - 1);
      }}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      className="focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/40 rounded-[34px]"
    >
      <div className="grid lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* portrait: cross-fade + slow zoom */}
        <div className="lg:col-span-5 relative h-[420px] sm:h-[480px] lg:h-[500px] rounded-[30px] overflow-hidden bg-[#1A1F22] depth-3">
          <AnimatePresence initial={false}>
            <motion.div
              key={m.name}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: reduced ? 1 : 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.6, ease: EASE }, scale: { duration: reduced ? 0 : interval / 1000 + 0.6, ease: 'linear' } }}
            >
              {m.image ? (
                <Image src={m.image} alt={m.name} fill sizes="(max-width: 1024px) 92vw, 40vw" className="object-cover object-[50%_22%]" priority={i === 0} />
              ) : (
                <Monogram name={m.name} className="absolute inset-0" />
              )}
            </motion.div>
          </AnimatePresence>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0B0D0E]/70 via-transparent to-transparent pointer-events-none" />
          <span className="chip-photo absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-[15px] font-extrabold text-white tabular-nums">
            {String(i + 1).padStart(2, '0')} <span className="text-white/60">/ {String(n).padStart(2, '0')}</span>
          </span>
        </div>

        {/* details + strip */}
        <div className="lg:col-span-7 liquid-glass rounded-[30px] p-6 sm:p-8 lg:p-10 flex flex-col">
          <div className="min-h-[170px] sm:min-h-[150px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -10 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="label-mono">{m.role || 'Board Member'}</p>
                <h3 className="mt-3 font-display text-[30px] sm:text-[38px] font-extrabold text-[#F3F5F6] leading-tight">{m.name}</h3>
                {m.organization && <p className="mt-3 text-[18px] sm:text-[19px] text-[#DDE3E6] leading-relaxed max-w-2xl">{m.organization}</p>}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* every member; the current one lit */}
          <ul className="mt-auto pt-6 grid grid-cols-6 gap-2.5 sm:gap-3" aria-label="Board members">
            {members.map((x, k) => {
              const on = k === i;
              return (
                <li key={x.name}>
                  <button
                    type="button"
                    onClick={() => go(k)}
                    aria-label={`Show ${x.name}`}
                    aria-current={on ? 'true' : undefined}
                    className={`press relative block w-full aspect-square rounded-2xl overflow-hidden bg-[#1A1F22] transition-[opacity,filter,box-shadow] duration-500 ${
                      on ? 'opacity-100 ring-2 ring-[#F6C22E] shadow-[0_0_18px_-2px_rgba(246,194,46,0.55)]' : 'opacity-45 grayscale-[60%] hover:opacity-80 hover:grayscale-0'
                    }`}
                  >
                    {x.image ? (
                      <Image src={x.image} alt="" fill sizes="96px" className="object-cover object-[50%_20%]" />
                    ) : (
                      <Monogram name={x.name} className="absolute inset-0 [&>span]:text-[16px]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
