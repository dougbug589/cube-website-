'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Section guide for the long home page: a slim spine on the left edge with a
 * gold tick per section; the section in view opens into a small glass pill
 * with its name. Click to jump. Wide screens only, visible between the hero
 * and the footer. Scroll work is rAF-throttled and only sets state when the
 * active section actually changes.
 */
export default function SectionSpine({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      const first = document.getElementById(sections[0]?.id);
      const footer = document.querySelector('footer');
      const pastHero = first ? first.getBoundingClientRect().top < window.innerHeight * 0.75 : false;
      const beforeFooter = footer ? footer.getBoundingClientRect().top > window.innerHeight * 0.6 : true;
      setVisible(pastHero && beforeFooter);
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label="Sections on this page"
          className="hidden min-[1760px]:flex fixed left-4 top-1/2 z-30 flex-col gap-1.5"
          initial={{ opacity: 0, x: -12, y: '-50%' }}
          animate={{ opacity: 1, x: 0, y: '-50%' }}
          exit={{ opacity: 0, x: -12, y: '-50%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          {sections.map((s) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                aria-current={on ? 'true' : undefined}
                aria-label={s.label}
                className="group relative flex items-center h-7"
              >
                {/* tick: grows and turns gold for the active section */}
                <span
                  className={`block h-[3px] rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    on ? 'w-6 bg-gradient-to-r from-[#E9B215] to-[#C4921B]' : 'w-3.5 bg-[#33454E]/25 group-hover:w-5 group-hover:bg-[#33454E]/45'
                  }`}
                />
                <span
                  className={`ml-2.5 whitespace-nowrap rounded-full text-[13.5px] font-bold transition-[opacity,transform] duration-300 ${
                    on
                      ? 'px-3 py-1 text-[#243239] bg-white/95 border border-[#C4921B]/25 shadow-[0_6px_16px_-10px_rgba(36,50,57,0.45)] opacity-100 translate-x-0'
                      : 'px-3 py-1 text-[#46565E] bg-white/85 border border-[#33454E]/10 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
