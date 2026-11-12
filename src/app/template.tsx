'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Route transition. A template re-mounts on every navigation (layouts don't),
 * so each new page gets a short fade-and-lift. Kept quick (≈0.25 s) and it
 * never starts from invisible, so it reads as instant feedback, not a delay.
 * Transform / opacity only; skipped for reduced motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0.35, y: 14 }}
      animate={{ opacity: 1, y: 0, transitionEnd: { transform: 'none' } }}
      transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
    >
      {children}
    </motion.div>
  );
}
