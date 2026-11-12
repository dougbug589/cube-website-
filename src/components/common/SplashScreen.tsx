'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SPLASH_KEY as KEY } from '@/lib/splash';

/**
 * First-visit splash + page reveal.
 *
 * Shown once per browser session. An inline script in the root layout runs
 * before first paint and adds `no-splash` to <html> when it has already been
 * seen (or reduced motion is on), so returning pages never flash it.
 *
 * Timeline (all transform / opacity / filter):
 *   0 ms      logo settles (scale + blur), wordmark rises, gold line draws
 *   1150 ms   splash lifts away with rounded corners; html gets `splash-done`,
 *             which springs the page content up into place
 *   2000 ms   splash unmounts
 */

const HOLD_MS = 1150;
const EXIT_MS = 850;

export default function SplashScreen() {
  const [phase, setPhase] = useState<'show' | 'exit' | 'gone'>('show');

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains('no-splash')) {
      setPhase('gone');
      return;
    }
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* storage blocked: splash still plays, just not remembered */
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t1 = setTimeout(() => {
      setPhase('exit');
      html.classList.add('splash-done');
      document.body.style.overflow = prevOverflow;
    }, HOLD_MS);
    const t2 = setTimeout(() => setPhase('gone'), HOLD_MS + EXIT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.body.style.overflow = prevOverflow;
      html.classList.add('splash-done');
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div aria-hidden className={`splash ${phase === 'exit' ? 'is-exit' : ''}`}>
      <div className="splash-inner">
        <div className="splash-logo relative w-[220px] h-[90px] sm:w-[280px] sm:h-[115px]">
          <Image src="/images/branding/cube-live-logo.png" alt="" fill priority sizes="280px" className="object-contain" />
        </div>
        <p className="splash-word font-display text-[28px] sm:text-[34px] font-extrabold tracking-[0.12em] text-[#243239] mt-5">CUBE</p>
        <p className="splash-tag text-[13px] font-bold uppercase tracking-[0.2em] text-[#5B6A71] mt-1.5">Centre of Excellence</p>
        <span className="splash-line mt-7" />
      </div>
    </div>
  );
}

