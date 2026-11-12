'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * "We ___ / ___" typewriter headline.
 *
 * "We" stays put. The verb types, then the gold phrase, then a short hold,
 * a quick backspace, and the next pair. One timer drives a small state
 * machine; each step is a single text update, so the only paint per
 * keystroke is the changed glyphs. The caret blinks with a CSS opacity
 * animation (compositor-only).
 *
 * Layout never shifts: the phrase line reserves two lines below lg and is
 * forced to one line from lg up (sizing is handled by the parent's clamp()).
 *
 * - Screen readers get one stable sentence; the animated text is aria-hidden.
 * - prefers-reduced-motion: full first pair, no typing, no blinking.
 * - `paused` stops typing when the hero is off-screen or the tab is hidden.
 */

export type HeadlinePair = { verb: string; phrase: string };

export const CUBE_PAIRS: HeadlinePair[] = [
  { verb: 'engineer', phrase: 'campuses that endure.' },
  { verb: 'assure', phrase: 'housing India can trust.' },
  { verb: 'test', phrase: 'the water cities drink.' },
  { verb: 'plan', phrase: 'cities that move.' },
  { verb: 'are', phrase: 'a Centre of Excellence.' },
];

type Phase = 'typeVerb' | 'typePhrase' | 'hold' | 'deletePhrase' | 'deleteVerb' | 'gap';

const TYPE_MS = 52; // per character, with a little jitter for a human rhythm
const DELETE_MS = 22;
const HOLD_MS = 1500;
const GAP_MS = 260;

export default function RotatingHeadline({
  pairs = CUBE_PAIRS,
  prefix = 'We',
  paused = false,
  className = '',
}: {
  pairs?: HeadlinePair[];
  prefix?: string;
  paused?: boolean;
  className?: string;
}) {
  const [reduced, setReduced] = useState(false);
  const [pairIdx, setPairIdx] = useState(0);
  const [verbLen, setVerbLen] = useState(0);
  const [phraseLen, setPhraseLen] = useState(0);
  const [phase, setPhase] = useState<Phase>('typeVerb');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const pair = pairs[pairIdx % pairs.length];

  useEffect(() => {
    if (reduced || paused || pairs.length === 0) return;

    const jitter = () => TYPE_MS + Math.round((Math.random() - 0.5) * 30);
    let delay = 0;
    let step: () => void = () => {};

    switch (phase) {
      case 'typeVerb':
        if (verbLen < pair.verb.length) {
          delay = jitter();
          step = () => setVerbLen((n) => n + 1);
        } else {
          delay = 140; // tiny beat between verb and phrase
          step = () => setPhase('typePhrase');
        }
        break;
      case 'typePhrase':
        if (phraseLen < pair.phrase.length) {
          delay = jitter();
          step = () => setPhraseLen((n) => n + 1);
        } else {
          delay = 0;
          step = () => setPhase('hold');
        }
        break;
      case 'hold':
        delay = HOLD_MS;
        step = () => setPhase('deletePhrase');
        break;
      case 'deletePhrase':
        if (phraseLen > 0) {
          delay = DELETE_MS;
          step = () => setPhraseLen((n) => n - 1);
        } else {
          delay = 60;
          step = () => setPhase('deleteVerb');
        }
        break;
      case 'deleteVerb':
        if (verbLen > 0) {
          delay = DELETE_MS + 8;
          step = () => setVerbLen((n) => n - 1);
        } else {
          delay = GAP_MS;
          step = () => {
            setPairIdx((i) => (i + 1) % pairs.length);
            setPhase('typeVerb');
          };
        }
        break;
      case 'gap':
        break;
    }

    timer.current = setTimeout(step, delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase, verbLen, phraseLen, pair, paused, reduced, pairs.length]);

  const verbText = reduced ? pair.verb : pair.verb.slice(0, verbLen);
  const phraseText = reduced ? pair.phrase : pair.phrase.slice(0, phraseLen);
  const caretOnVerb = !reduced && (phase === 'typeVerb' || phase === 'deleteVerb');
  const caretOnPhrase = !reduced && !caretOnVerb;
  const typing = phase === 'typeVerb' || phase === 'typePhrase' || phase === 'deletePhrase' || phase === 'deleteVerb';

  const srText = `${prefix} ${pairs.map((p) => p.verb).join(', ')}: ${pairs.map((p) => p.phrase.replace(/\.$/, '')).join('; ')}.`;

  return (
    <h1 className={className}>
      <span className="sr-only">{srText}</span>
      <span aria-hidden className="block">
        <span className="block whitespace-nowrap">
          {prefix} {verbText}
          {caretOnVerb && <Caret steady={typing} />}
        </span>
        <span className="block min-h-[2.12em] lg:min-h-0 lg:whitespace-nowrap text-[#E9B215]">
          {phraseText}
          {caretOnPhrase && <Caret steady={typing} />}
        </span>
      </span>
    </h1>
  );
}

/** Gold caret. Solid while keys are moving, blinks while holding. */
function Caret({ steady }: { steady: boolean }) {
  return (
    <span
      className={`relative top-[0.1em] inline-block align-baseline w-[0.07em] h-[0.8em] ml-[0.06em] rounded-full bg-[#E9B215] ${
        steady ? '' : 'animate-caret'
      }`}
    />
  );
}
