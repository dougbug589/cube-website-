'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollSpy } from '@/lib/useScrollSpy';
import SectionRail from '@/components/common/SectionRail';

/**
 * Section navigator for long inner pages: a sticky liquid-glass bar whose
 * gold pill follows the section in view, or, on screens 1900px and wider,
 * a labelled guide in the left margin (SectionRail) instead.
 * Sections need `scroll-mt-40` so they land below the bar.
 */
export default function SectionNav({ sections, id }: { sections: { id: string; label: string }[]; id: string }) {
  const navRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useScrollSpy(sections.map((s) => s.id), navRef);
  const jump = (target: string) => {
    setActive(target);
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
    {/* very wide screens: the guide moves to the empty left margin */}
    <SectionRail sections={sections} active={active} onJump={jump} />
    {/* everywhere else: sticky glass bar under the top bar */}
    <div className="sticky top-[var(--nav-offset,93px)] z-40 px-4 sm:px-6 py-3 min-[1900px]:hidden">
      <div ref={navRef} className="liquid-glass is-solid mx-auto max-w-max rounded-full p-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-0.5 w-max">
          {sections.map((s) => {
            const on = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                data-anchor={s.id}
                aria-current={on ? 'true' : undefined}
                onClick={() => jump(s.id)}
                className={`press relative h-10 px-4 rounded-full text-[14.5px] whitespace-nowrap transition-colors duration-300 ${
                  on ? 'text-[#243239] font-bold' : 'text-[#3B4B53] font-semibold hover:text-[#243239]'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId={`${id}-section-pill`}
                    transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.8 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-[#F8E3A3] to-[#F0C468]/80 border border-[#C4921B]/25 shadow-[0_6px_16px_-10px_rgba(196,146,27,0.8)]"
                  />
                )}
                <span className="relative">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
