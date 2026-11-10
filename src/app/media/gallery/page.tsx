'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
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
  { id: 1, src: '/images/hero/slides_iit-tirupathi.jpg', title: 'IIT Tirupati Campus Development', category: 'Projects', description: 'Civil engineering consultancy and site supervision for permanent campus.' },
  { id: 2, src: '/images/hero/slides_cpcl-arc.jpg', title: 'CPCL Industrial Housing', category: 'Projects', description: 'Structural quality audit and precast construction verification.' },
  { id: 3, src: '/images/cel/about_cel.jpg', title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory', description: 'Advanced instrumentation suite at IIT Madras Research Park.' },
  { id: 4, src: '/images/cel/about_cel1.jpg', title: 'CEL Analytical Diagnostics', category: 'Laboratory', description: 'Water and wastewater characterization stations.' },
  { id: 5, src: '/images/life-at-cube/about_life.jpg', title: 'Technical Collaboration Session', category: 'Workplace', description: 'Multidisciplinary project planning at CUBE headquarters.' },
  { id: 6, src: '/images/life-at-cube/about_life1.jpg', title: 'IIT Madras Faculty Mentorship', category: 'Workplace', description: 'Faculty advisors mentoring project engineers.' },
  { id: 7, src: '/images/life-at-cube/about_life2.jpg', title: 'Laboratory Diagnostics Review', category: 'Workplace', description: 'Analyzing non-destructive test results.' },
  { id: 8, src: '/images/hero/slides_building-training-team.jpg', title: 'State Municipal Engineers Training', category: 'Events', description: 'Over 120 engineers at the modern concrete durability module.' },
  { id: 9, src: '/images/hero/slides_ashiana.jpg', title: 'Ashiana Infrastructure Project', category: 'Projects', description: 'Third party quality assurance for sustainable building design.' },
  { id: 10, src: '/images/hero/slides_mahindra.jpg', title: 'Mahindra World City Studies', category: 'Projects', description: 'Industrial urban infrastructure and stormwater assessment.' },
  { id: 11, src: '/images/projects/environment-sustainability/about_environment.jpg', title: 'Hydrological Basin Assessment', category: 'Projects', description: 'Hydrodynamic flow modeling and flood risk analysis.' },
  { id: 12, src: '/images/projects/smart-cities/about_smart-city.jpg', title: 'Smart Urban Technologies', category: 'Projects', description: 'Sensor grid and municipal telemetry supervision.' },
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
      if (!Array.isArray(data) || data.length === 0) return;
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
    const interval = setInterval(loadGallery, 30000);
    const onFocus = () => loadGallery();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadGallery]);

  const categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA] shadow-md'
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
                onClick={() => openLightbox(idx)}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-cube cursor-pointer border border-slate-200 bg-slate-900 transition-all duration-300"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070E5C]/90 via-navy-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#070E5C] text-[#070E5C] border border-[#BDD7E8]">
                    {item.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-sm font-bold line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{item.description}</p>
                </div>

                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/90 text-[#070E5C] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-white/95 text-[#24272B] backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevLightbox}
            className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <div className="relative w-[90vw] max-w-4xl h-[60vh] sm:h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={filteredItems[lightboxIndex].src}
                alt={filteredItems[lightboxIndex].title}
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-4 text-center text-white">
              <h3 className="text-lg font-bold font-display">{filteredItems[lightboxIndex].title}</h3>
              <p className="text-xs text-slate-300 mt-1">{filteredItems[lightboxIndex].description}</p>
              <span className="text-[10px] text-[#D99A42] mt-1 block">
                {lightboxIndex + 1} of {filteredItems.length}
              </span>
            </div>
          </div>

          <button
            onClick={nextLightbox}
            className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

