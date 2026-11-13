'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

/**
 * Photo grid that opens a full-screen viewer (cross-fade between photos,
 * counter, arrow keys, swipe, Esc). Used for project photo galleries.
 */
export default function PhotoGrid({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(() => {
    setDir(1);
    setIndex((i) => (i === null ? i : (i + 1) % photos.length));
  }, [photos.length]);
  const prev = useCallback(() => {
    setDir(-1);
    setIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener('keydown', onKey);
    };
  }, [index, close, next, prev]);

  const touchX = useRef<number | null>(null);
  const active = index !== null ? photos[index] : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
        {photos.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => {
              setDir(1);
              setIndex(i);
            }}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="group relative aspect-[4/3] rounded-[20px] overflow-hidden bg-[#1A1F22] depth-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D89F03]/60"
          >
            <Image
              src={src}
              alt={`${title}, photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 300px"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
            <span className="chip-photo absolute top-2.5 right-2.5 grid place-items-center w-9 h-9 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Expand size={15} strokeWidth={2.25} />
            </span>
          </button>
        ))}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {active && (
              <motion.div
                key="photo-viewer"
                role="dialog"
                aria-modal="true"
                aria-label={`${title}: photo viewer`}
                className="fixed inset-0 z-[90] bg-[#10181C]/92 text-white flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={(e) => e.target === e.currentTarget && close()}
                onTouchStart={(e) => {
                  touchX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (touchX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchX.current;
                  if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
                  touchX.current = null;
                }}
              >
                <button type="button" onClick={close} aria-label="Close photo viewer" className="press absolute top-[max(1rem,env(safe-area-inset-top))] right-4 sm:top-6 sm:right-6 grid place-items-center w-12 h-12 rounded-full bg-white/12 hover:bg-white/22 border border-white/15 transition-colors z-10">
                  <X size={22} />
                </button>
                {photos.length > 1 && (
                  <>
                    <button type="button" onClick={prev} aria-label="Previous photo" className="press absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 rounded-full bg-white/12 hover:bg-white/22 border border-white/15 transition-colors z-10">
                      <ChevronLeft size={24} />
                    </button>
                    <button type="button" onClick={next} aria-label="Next photo" className="press absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 rounded-full bg-white/12 hover:bg-white/22 border border-white/15 transition-colors z-10">
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <div className="w-full max-w-6xl flex flex-col items-center pointer-events-none">
                  <div className="relative w-full h-[68vh] sm:h-[76vh]">
                    <AnimatePresence initial={false} custom={dir}>
                      <motion.div
                        key={active}
                        className="absolute inset-0"
                        initial={{ opacity: 0, x: dir * 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: dir * -40 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Image src={active} alt={`${title}, photo ${(index ?? 0) + 1}`} fill sizes="90vw" className="object-contain" />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <p className="mt-4 text-[15px] font-semibold text-white/75 tabular-nums">
                    <span className="text-[#D89F03]">{(index ?? 0) + 1}</span> / {photos.length}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
