'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * "We ___ / ___" rotating headline.
 *
 * Prefix stays put, the verb and the gold phrase swap together. Each swap
 * slides words up through a mask (translateY + opacity only, no layout
 * animation), so it stays on the compositor at 60fps+.
 *
 * - Screen readers get one stable sentence (`srText`), the animation is aria-hidden.
 * - prefers-reduced-motion: shows the first pair, no rotation.
 * - `paused` lets the parent stop rotation when off-screen / tab hidden.
 */

export type HeadlinePair = { verb: string; phrase: string };

export const CUBE_PAIRS: HeadlinePair[] = [
  { verb: 'engineer', phrase: 'campuses that endure.' },
  { verb: 'assure', phrase: 'housing India can trust.' },
  { verb: 'test', phrase: 'the water cities drink.' },
  { verb: 'plan', phrase: 'cities that move.' },
  { verb: 'build', phrase: 'beyond foundations.' },
];

const EASE = [0.16, 1, 0.3, 1] as const;

function Slot({ id, children, delay = 0, className = '' }: { id: string; children: React.ReactNode; delay?: number; className?: string }) {
  // used for the single rotating verb
  return (
    // inline-grid + overflow-clip: exiting and entering words share one cell,
    // so swapping never shifts surrounding text vertically.
    <span className={`relative inline-grid overflow-clip align-bottom pb-[0.12em] -mb-[0.12em] ${className}`}>
      <AnimatePresence initial={false}>
        <motion.span
          key={id}
          initial={{ y: '105%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1, transition: { duration: 0.6, ease: EASE, delay } }}
          exit={{ y: '-105%', opacity: 0, transition: { duration: 0.4, ease: EASE, delay: delay * 0.5 } }}
          className="[grid-area:1/1] whitespace-nowrap will-change-transform"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function RotatingHeadline({
  pairs = CUBE_PAIRS,
  prefix = 'We',
  intervalMs = 2400,
  paused = false,
  className = '',
}: {
  pairs?: HeadlinePair[];
  prefix?: string;
  intervalMs?: number;
  paused?: boolean;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (paused || reduced || pairs.length < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % pairs.length), intervalMs);
    return () => clearTimeout(t);
  }, [i, paused, reduced, pairs.length, intervalMs]);

  const pair = pairs[i % pairs.length];
  const srText = `${prefix} ${pairs.map((p) => p.verb).join(', ')}: ${pairs.map((p) => p.phrase.replace(/\.$/, '')).join('; ')}.`;

  return (
    <h1 className={className}>
      <span className="sr-only">{srText}</span>
      <span aria-hidden className="block">
        <span className="block">
          {prefix}{' '}
          <Slot id={`v-${i}`}>{pair.verb}</Slot>
        </span>
        {/* phrase: one masked cell; words stagger in, the whole phrase lifts out */}
        <span className="relative grid overflow-clip pb-[0.12em] -mb-[0.12em] min-h-[2.24em] lg:min-h-0 lg:whitespace-nowrap content-start text-[#E9B215]">
          <AnimatePresence initial={false}>
            <motion.span
              key={`p-${i}`}
              initial="hidden"
              animate="show"
              exit={{ y: '-105%', opacity: 0, transition: { duration: 0.4, ease: EASE } }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } } }}
              className="[grid-area:1/1] will-change-transform"
            >
              {pair.phrase.split(' ').map((w, wi) => (
                <span key={wi} className="inline-block overflow-clip align-bottom pb-[0.12em] -mb-[0.12em] mr-[0.25em] last:mr-0">
                  <motion.span
                    className="inline-block will-change-transform"
                    variants={{
                      hidden: { y: '105%', opacity: 0 },
                      show: { y: '0%', opacity: 1, transition: { duration: 0.6, ease: EASE } },
                    }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </h1>
  );
}
