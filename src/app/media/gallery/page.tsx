'use client';

import { useCmsUpdates } from '@/lib/live';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageHeader from '@/components/common/PageHeader';
import { X, ChevronLeft, ChevronRight, Expand } from 'lucide-react';

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  category: 'Projects' | 'Laboratory' | 'Workplace' | 'Events';
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, src: '/images/hero/slides_iit-tirupathi.jpg', title: 'IIT Tirupati Permanent Campus – Third Party Quality Assurance', category: 'Projects' },
  { id: 2, src: '/images/hero/slides_cpcl-arc.jpg', title: 'PMC for Construction of ARHC, Manali', category: 'Projects' },
  { id: 3, src: '/images/cel/about_cel.jpg', title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  { id: 4, src: '/images/cel/about_cel1.jpg', title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  { id: 5, src: '/images/life-at-cube/about_life.jpg', title: 'Life at CUBE', category: 'Workplace' },
  { id: 6, src: '/images/life-at-cube/about_life1.jpg', title: 'Life at CUBE', category: 'Workplace' },
  { id: 7, src: '/images/life-at-cube/about_life2.jpg', title: 'Life at CUBE', category: 'Workplace' },
  { id: 8, src: '/images/hero/slides_building-training-team.jpg', title: 'Capacity Building Training Programme', category: 'Events' },
  { id: 9, src: '/images/hero/slides_ashiana.jpg', title: 'Surface Water Management and Flood Inundation Study, Ashiana Shubham', category: 'Projects' },
  { id: 10, src: '/images/hero/slides_mahindra.jpg', title: 'Mahindra World City', category: 'Projects' },
];

/*
 * Display rules for the CMS gallery list (the data itself is left as is):
 * - portraits of the board and advisory panel (they have their own pages)
 *   and stock pictures are not gallery photos, so they are not shown;
 * - captions that were generated from file names get the real caption
 *   (hero slide captions from cubeiitm.org's home page).
 */
const HIDE = [/\/images\/leadership\//, /images_about-bg\.jpg$/, /images_excellence\.jpg$/];
const FIX: Record<string, { title: string; category: GalleryItem['category'] }> = {
  '/images/hero/slides_slide2.jpg': { title: 'Surface Water Management Plan for IIT Jammu Campus', category: 'Projects' },
  '/images/hero/slides_slide3.jpg': {
    title: 'Engineering, Structural Assessment and Mitigation Strategies for Protection and Development of Naida Caves, Diu',
    category: 'Projects',
  },
  '/images/cel/about_cel1.jpg': { title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  '/images/cel/about_cel2.jpg': { title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  '/images/cel/vertical2_lab.jpg': { title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  '/images/about/about_about.jpg': { title: 'Life at CUBE', category: 'Workplace' },
};

function mapGalleryCategory(category: string): GalleryItem['category'] {
  const value = (category || '').toLowerCase();
  if (value.includes('lab')) return 'Laboratory';
  if (value.includes('project') || value.includes('hero') || value.includes('showcase')) return 'Projects';
  if (value.includes('team') || value.includes('leadership') || value.includes('workplace') || value.includes('institutional')) return 'Workplace';
  return 'Events';
}

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.8 };

/*
 * Mosaic plan: which tiles are large (2x2) or wide (2x1) at each column count,
 * so every row is filled and nothing is left alone at the bottom. Rows go
 * block (one large tile + smalls, alternating left/right), plain row, block,
 * ...; the last few photos are stretched to close the final row.
 */
type Span = 's' | 'w' | 'b';
const BLOCK: Record<number, [Span[], Span[]]> = {
  2: [['b'], ['b']],
  3: [['b', 's', 's'], ['s', 'b', 's']],
  4: [['b', 's', 's', 's', 's'], ['s', 's', 'b', 's', 's']],
};
// tails by item count (null: merge with the unit before it first)
const TAIL: Record<number, Record<number, Span[] | null>> = {
  2: { 1: ['w'] },
  3: { 1: null, 2: ['w', 's'], 4: ['w', 's', 's', 'w'] },
  4: { 1: null, 2: ['w', 'w'], 3: ['w', 's', 's'], 4: ['s', 's', 's', 's'], 5: ['b', 's', 's', 's', 's'], 6: ['w', 's', 's', 'w', 's', 's'] },
};
function plan(n: number, cols: number): Span[] {
  if (n === 1) return ['b'];
  const units: Span[][] = [];
  let used = 0;
  for (let k = 0; ; k++) {
    const u = k % 2 === 0 ? BLOCK[cols][(k / 2) % 2] : (Array(cols).fill('s') as Span[]);
    if (n - used < u.length) break;
    units.push(u);
    used += u.length;
  }
  let r = n - used;
  if (r > 0) {
    let tail = TAIL[cols][r];
    if (!tail && units.length) {
      r += units.pop()!.length;
      tail = TAIL[cols][r];
    }
    units.push(tail || (Array(r).fill('s') as Span[]));
  }
  return units.flat();
}
// literal class names per breakpoint (sm: 2 columns, lg: 3, xl: 4)
const SPAN_CLS: Record<'sm' | 'lg' | 'xl', Record<Span, string>> = {
  sm: { s: 'sm:col-span-1 sm:row-span-1', w: 'sm:col-span-2 sm:row-span-1', b: 'sm:col-span-2 sm:row-span-2' },
  lg: { s: 'lg:col-span-1 lg:row-span-1', w: 'lg:col-span-2 lg:row-span-1', b: 'lg:col-span-2 lg:row-span-2' },
  xl: { s: 'xl:col-span-1 xl:row-span-1', w: 'xl:col-span-2 xl:row-span-1', b: 'xl:col-span-2 xl:row-span-2' },
};

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);

  const loadGallery = useCallback(async () => {
    try {
      const res = await fetch('/api/public/gallery', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      // Respect an empty list (everything archived) instead of showing stale fallback.
      if (!Array.isArray(data)) return;
      setItems(
        data
          .filter((item: any) => item.imageUrl && !HIDE.some((re) => re.test(item.imageUrl)))
          .map((item: any, index: number) => ({
            id: index + 1,
            src: item.imageUrl,
            title: FIX[item.imageUrl]?.title || item.title || 'CUBE',
            category: FIX[item.imageUrl]?.category || mapGalleryCategory(item.category),
          }))
      );
    } catch {
      // Keep the curated fallback if the CMS is unreachable.
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);
  // Refetch instantly whenever an admin changes the gallery.
  useCmsUpdates(loadGallery);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: items.length };
    items.forEach((i) => (c[i.category] = (c[i.category] || 0) + 1));
    return c;
  }, [items]);
  const categories = ['All', ...(['Projects', 'Laboratory', 'Workplace', 'Events'] as const).filter((c) => counts[c])];
  const filteredItems = selectedCategory === 'All' ? items : items.filter((item) => item.category === selectedCategory);
  const spans = useMemo(() => {
    const n = filteredItems.length;
    const [p2, p3, p4] = [plan(n, 2), plan(n, 3), plan(n, 4)];
    return filteredItems.map((_, k) => ({
      cls: `${SPAN_CLS.sm[p2[k]]} ${SPAN_CLS.lg[p3[k]]} ${SPAN_CLS.xl[p4[k]]}`,
      big: p4[k] !== 's' || p3[k] !== 's',
    }));
  }, [filteredItems]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const nextLightbox = useCallback(() => {
    setDir(1);
    setLightboxIndex((i) => (i === null || filteredItems.length === 0 ? i : (i + 1) % filteredItems.length));
  }, [filteredItems.length]);
  const prevLightbox = useCallback(() => {
    setDir(-1);
    setLightboxIndex((i) => (i === null || filteredItems.length === 0 ? i : (i - 1 + filteredItems.length) % filteredItems.length));
  }, [filteredItems.length]);

  // If a live CMS update removes photos while the viewer is open, close it
  // instead of crashing on a missing index.
  useEffect(() => {
    if (lightboxIndex !== null && lightboxIndex >= filteredItems.length) setLightboxIndex(null);
  }, [lightboxIndex, filteredItems.length]);

  // Keyboard controls + lock page scroll while the viewer is open.
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') nextLightbox();
      else if (e.key === 'ArrowLeft') prevLightbox();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxIndex, closeLightbox, nextLightbox, prevLightbox]);

  // Swipe left/right on phones (a ref so a fast swipe's touchend sees its touchstart).
  const touchStartX = useRef<number | null>(null);
  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="Media"
        title="Gallery"
        description="Photographs of CUBE's projects, laboratory and workplace."
        breadcrumbs={[{ label: 'Media', href: '/media' }, { label: 'Gallery' }]}
      />

      {/* filter: springing gold pill with counts */}
      <div className="sticky top-[var(--nav-offset,93px)] z-30 py-3">
        <div className="shell">
          <div className="liquid-glass is-solid mx-auto w-max max-w-full rounded-full p-1 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const on = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`press relative h-10 px-4 rounded-full text-[15px] whitespace-nowrap flex items-center gap-2 transition-colors duration-300 ${
                    on ? 'text-[#0B0D0E] font-bold' : 'text-[#C2CCD1] font-semibold hover:text-[#F3F5F6]'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="gallery-filter-pill"
                      transition={SPRING}
                      className="absolute inset-0 rounded-full pill-yellow"
                    />
                  )}
                  <span className="relative">{cat}</span>
                  <span className={`relative grid place-items-center min-w-6 h-6 px-1.5 rounded-full text-[13.5px] font-extrabold tabular-nums ${on ? 'bg-black/10' : 'bg-white/[0.08]'}`}>
                    {counts[cat] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* mosaic: planned per column count (see plan()), no holes, no orphans */}
      <section className="shell pt-6 pb-24">
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[240px] grid-flow-dense gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredItems.map((item, idx) => (
              <motion.button
                key={item.src + item.id}
                layout="position"
                type="button"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={SPRING}
                onClick={() => {
                  setDir(1);
                  setLightboxIndex(idx);
                }}
                aria-label={`Open photo: ${item.title}`}
                className={`group relative rounded-[24px] overflow-hidden bg-[#1A1F22] depth-1 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/60 ${
                  spans[idx]?.cls || ''
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes={spans[idx]?.big ? '(max-width: 640px) 100vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 25vw'}
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                />
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
                <span className="chip-photo absolute top-3 left-3 rounded-full px-3 py-1 text-[13.5px] font-bold text-white">{item.category}</span>
                <span className="chip-photo absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Expand size={15} strokeWidth={2.25} />
                </span>
                <span className="chip-photo absolute left-3 right-3 bottom-3 rounded-2xl px-4 py-3 text-[15px] font-semibold text-white leading-snug line-clamp-2 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                  {item.title}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* viewer: portaled to <body> so position:fixed always covers the screen */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeItem && (
              <motion.div
                key="viewer"
                role="dialog"
                aria-modal="true"
                aria-label={`Photo viewer: ${activeItem.title}`}
                className="fixed inset-0 z-[90] bg-[#10181C]/92 text-white flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={(e) => e.target === e.currentTarget && closeLightbox()}
                onTouchStart={(e) => {
                  touchStartX.current = e.touches[0].clientX;
                }}
                onTouchEnd={(e) => {
                  if (touchStartX.current === null) return;
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  if (Math.abs(dx) > 50) (dx < 0 ? nextLightbox : prevLightbox)();
                  touchStartX.current = null;
                }}
              >
                <button
                  type="button"
                  onClick={closeLightbox}
                  aria-label="Close photo viewer"
                  className="press absolute top-[max(1rem,env(safe-area-inset-top))] right-4 sm:top-6 sm:right-6 grid place-items-center w-12 h-12 rounded-full bg-white/12 hover:bg-white/22 border border-white/15 transition-colors z-10"
                >
                  <X size={22} />
                </button>
                {filteredItems.length > 1 && (
                  <>
                    <button type="button" onClick={prevLightbox} aria-label="Previous photo" className="press absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 rounded-full bg-white/12 hover:bg-white/22 border border-white/15 transition-colors z-10">
                      <ChevronLeft size={24} />
                    </button>
                    <button type="button" onClick={nextLightbox} aria-label="Next photo" className="press absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 grid place-items-center w-12 h-12 rounded-full bg-white/12 hover:bg-white/22 border border-white/15 transition-colors z-10">
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                <div className="w-full max-w-6xl flex flex-col items-center pointer-events-none">
                  <div className="relative w-full h-[62vh] sm:h-[72vh]">
                    <AnimatePresence initial={false} custom={dir}>
                      <motion.div
                        key={activeItem.src}
                        custom={dir}
                        className="absolute inset-0"
                        initial={{ opacity: 0, x: dir * 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: dir * -40 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <Image src={activeItem.src} alt={activeItem.title} fill sizes="90vw" className="object-contain" />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="mt-5 px-12 text-center max-w-3xl">
                    <p className="font-display text-[19px] sm:text-[21px] font-bold leading-snug">{activeItem.title}</p>
                    <p className="mt-1.5 text-[15px] text-white/70 font-semibold">
                      {activeItem.category} · <span className="tabular-nums text-[#F6C22E]">{(lightboxIndex ?? 0) + 1} / {filteredItems.length}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
