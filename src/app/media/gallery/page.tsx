'use client';
import { useCmsUpdates } from '@/lib/live';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import PageHeader from '@/components/common/PageHeader';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  category: 'Projects' | 'Laboratory' | 'Workplace' | 'Events';
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, src: '/images/hero/slides_iit-tirupathi.jpg', title: 'IIT Tirupati Permanent Campus – Third Party Quality Assurance', category: 'Projects', description: '' },
  { id: 2, src: '/images/hero/slides_cpcl-arc.jpg', title: 'PMC for Construction of ARHC, Manali', category: 'Projects', description: '' },
  { id: 3, src: '/images/cel/about_cel.jpg', title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory', description: '' },
  { id: 4, src: '/images/cel/about_cel1.jpg', title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory', description: '' },
  { id: 5, src: '/images/life-at-cube/about_life.jpg', title: 'Life at CUBE', category: 'Workplace', description: '' },
  { id: 6, src: '/images/life-at-cube/about_life1.jpg', title: 'Life at CUBE', category: 'Workplace', description: '' },
  { id: 7, src: '/images/life-at-cube/about_life2.jpg', title: 'Life at CUBE', category: 'Workplace', description: '' },
  { id: 8, src: '/images/hero/slides_building-training-team.jpg', title: 'Capacity Building Training Programme', category: 'Events', description: '' },
  { id: 9, src: '/images/hero/slides_ashiana.jpg', title: 'Surface Water Management and Flood Inundation Study, Ashiana Shubham', category: 'Projects', description: '' },
  { id: 10, src: '/images/hero/slides_mahindra.jpg', title: 'Mahindra World City', category: 'Projects', description: '' },
];

function mapGalleryCategory(category: string): GalleryItem['category'] {
  const value = (category || '').toLowerCase();
  if (value.includes('lab')) return 'Laboratory';
  if (value.includes('project') || value.includes('hero') || value.includes('showcase')) return 'Projects';
  if (value.includes('team') || value.includes('leadership') || value.includes('workplace')) return 'Workplace';
  return 'Events';
}

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);

  const loadGallery = useCallback(async () => {
    try {
      const res = await fetch('/api/public/gallery', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      // Respect an empty list (everything archived) instead of showing stale fallback.
      if (!Array.isArray(data)) return;
      setItems(
        data.map((item: any, index: number) => ({
          id: index + 1,
          src: item.imageUrl,
          title: item.title || 'CUBE Gallery',
          category: mapGalleryCategory(item.category),
          description: item.description || item.category || 'CUBE institutional gallery',
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

  const categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const nextLightbox = useCallback(() => {
    setLightboxIndex((i) => (i === null || filteredItems.length === 0 ? i : (i + 1) % filteredItems.length));
  }, [filteredItems.length]);

  const prevLightbox = useCallback(() => {
    setLightboxIndex((i) =>
      i === null || filteredItems.length === 0 ? i : (i - 1 + filteredItems.length) % filteredItems.length
    );
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

  // Swipe left/right on phones.
  // A ref (not state) so a fast swipe's touchend always sees its touchstart.
  const touchStartX = useRef<number | null>(null);

  const activeItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div>
      <PageHeader
        badge="Photographic Archive"
        title="Institutional Photo Gallery"
        description="A visual collection documenting project sites, research laboratories, technical seminars, and professional life at CUBE."
        breadcrumbs={[
          { label: 'Media', href: '/media' },
          { label: 'Gallery' },
        ]}
      />

      <section className="py-20 bg-transparent">
        <div className="shell">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-[#F2F5F6] text-[#2B3B44] border border-[#B9C5CA] shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Open photo: ${item.title}`}
                onClick={() => openLightbox(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(idx);
                  }
                }}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-cube cursor-pointer border border-slate-200 bg-[#F0C468] transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C4921B]"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B3B44]/90 via-navy-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <div className="absolute top-3 left-3">
                  <span className="text-[13.5px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#2B3B44] text-[#2B3B44] border border-[#D3DDE1]">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                  <p className="text-[13.5px] text-slate-300 line-clamp-1 mt-0.5">{item.description}</p>
                </div>

                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 text-[#2B3B44] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal: portaled to <body> so position:fixed always covers the
          screen (the page frame applies a CSS filter, which breaks fixed). */}
      {activeItem &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Photo viewer: ${activeItem.title}`}
            className="fixed inset-0 z-[60] bg-[#050A2E]/95 text-white backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeLightbox()}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
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
              className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 sm:top-6 sm:right-6 p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={prevLightbox}
                aria-label="Previous photo"
                className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
              <div className="relative w-[90vw] max-w-4xl h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={activeItem.src}
                  alt={activeItem.title}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
              <div className="mt-4 px-10 text-center text-white">
                <h3 className="text-lg font-bold font-display">{activeItem.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{activeItem.description}</p>
                <span className="text-[13.5px] text-[#C4921B] mt-1 block">
                  {(lightboxIndex ?? 0) + 1} of {filteredItems.length}
                </span>
              </div>
            </div>

            {filteredItems.length > 1 && (
              <button
                type="button"
                onClick={nextLightbox}
                aria-label="Next photo"
                className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

