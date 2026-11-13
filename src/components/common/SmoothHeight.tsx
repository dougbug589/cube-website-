'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * A box whose height glides (grows AND shrinks) to fit its content instead of
 * jumping. The inner wrapper is measured with a ResizeObserver and the outer
 * box animates to that height. Put padding / min-height on `innerClassName`
 * (so it is part of the measured height) and the look (glass, radius) on
 * `className`. Pair with AnimatePresence mode="popLayout" inside, so an
 * outgoing slide leaves the layout while it fades and the box sizes to the
 * incoming one. Reduced motion: height changes instantly.
 */
export default function SmoothHeight({
  children,
  className = '',
  innerClassName = '',
  duration = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  duration?: number;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | 'auto'>('auto');
  const [reduced, setReduced] = useState(false);

  useLayoutEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = inner.current;
    if (!el) return;
    const measure = () => setH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={false}
      animate={{ height: h }}
      transition={reduced ? { duration: 0 } : { duration, ease: [0.22, 1, 0.36, 1] }}
    >
      <div ref={inner} className={`relative ${innerClassName}`}>
        {children}
      </div>
    </motion.div>
  );
}
