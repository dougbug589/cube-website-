'use client';

import React from 'react';

/**
 * Left-edge section guide for very wide screens (1900px and up): every section
 * name is listed (faint), the current one in full ink with a gold tick. It
 * sits in the empty margin beside the 1600px page shell; measured: the
 * longest label ("Objectives & Values", 139px bold) plus tick and inset ends
 * ~20px before the content at 1920px, so it never overlaps below that width.
 * Ticks animate with transform only.
 */

export default function SectionRail({
  sections,
  active,
  onJump,
  label = 'Sections on this page',
  className = '',
}: {
  sections: { id: string; label: string }[];
  active: string | null;
  onJump: (id: string) => void;
  label?: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={`hidden min-[1900px]:flex fixed left-2.5 top-1/2 -translate-y-1/2 z-30 flex-col ${className}`}>
      {sections.map((s) => {
        const on = s.id === active;
        return (
          <button
            key={s.id}
            type="button"
            data-anchor={s.id}
            aria-current={on ? 'true' : undefined}
            onClick={() => onJump(s.id)}
            className="group flex items-center gap-2 h-8 text-left"
          >
            <span className="relative w-4 h-[3px]">
              <span
                className={`absolute inset-y-0 left-0 w-4 rounded-full origin-left transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  on
                    ? 'scale-x-100 bg-gradient-to-r from-[#F6C22E] to-[#F6C22E]'
                    : 'scale-x-50 bg-white/20 group-hover:scale-x-75 group-hover:bg-[#33454E]/45'
                }`}
              />
            </span>
            <span
              className={`whitespace-nowrap text-[13.5px] transition-colors duration-300 ${
                on ? 'font-bold text-[#F3F5F6]' : 'font-semibold text-[#8E9AA0] group-hover:text-[#F3F5F6]'
              }`}
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
