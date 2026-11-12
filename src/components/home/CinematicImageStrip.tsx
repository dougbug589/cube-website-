'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface StripItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
  link: string;
}

const STRIP_ITEMS: StripItem[] = [
  {
    id: 's1',
    title: 'IIT Tirupati Academic Complex',
    subtitle: 'Institutional Masterplanning & PMC',
    image: '/images/hero/slides_iit-tirupathi.jpg',
    category: 'Institutional',
    link: '/projects/iit-tirupathi',
  },
  {
    id: 's2',
    title: 'CPCL Industrial Housing',
    subtitle: 'Precast Durability & TPQA',
    image: '/images/hero/slides_cpcl-arc.jpg',
    category: 'Buildings',
    link: '/projects/cpcl-arhc',
  },
  {
    id: 's3',
    title: 'PMAY Affordable Housing Assurance',
    subtitle: 'Structural Proof Checking across 40+ Schemes',
    image: '/images/hero/slides_design-engineering-consultancy.jpg',
    category: 'Urban Living',
    link: '/projects',
  },
  {
    id: 's4',
    title: 'CUBE Environmental Testing Facility',
    subtitle: 'Water, Wastewater & Material Durability',
    image: '/images/cel/about_cel.jpg',
    category: 'CEL Lab',
    link: '/cel',
  },
  {
    id: 's5',
    title: 'NICHE Industrial Park',
    subtitle: 'Stormwater & Environmental Engineering',
    image: '/images/hero/slides_niche.jpg',
    category: 'Infrastructure',
    link: '/projects/upt2',
  },
  {
    id: 's6',
    title: 'Engineers Capacity Building Center',
    subtitle: 'IIT Madras Applied Research & Knowledge Sharing',
    image: '/images/hero/slides_building-training-team.jpg',
    category: 'Academia',
    link: '/about',
  },
];

export default function CinematicImageStrip() {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items for continuous smooth CSS marquee loop
  const duplicatedItems = [...STRIP_ITEMS, ...STRIP_ITEMS];

  return (
    <section className="reveal py-20 bg-transparent border-y border-[#DCE4E7] overflow-hidden select-none">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C4921B] font-bold">
              Engineering Panorama
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#243239] tracking-tight">
              Cinematic Portfolio Sequence
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5B6A71] max-w-md">
            Continuously advancing civil engineering research into enduring public infrastructure across Tamil Nadu and South India. Hover or tap any case study to inspect.
          </p>
        </div>
      </div>

      {/* CONTINUOUS SMOOTH AUTOPLAY MOVING CAROUSEL TRACK */}
      <div 
        className="relative w-full overflow-hidden py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          animate={isPaused ? {} : { x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 28,
              ease: 'linear',
            },
          }}
          className="flex space-x-6 w-max"
        >
          {duplicatedItems.map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="w-[300px] sm:w-[380px] lg:w-[420px] shrink-0 group rounded-3xl overflow-hidden bg-white border border-[#DCE4E7] shadow-md hover:shadow-2xl transition-all"
            >
              {/* The whole card opens the project (previously only the small arrow did). */}
              <Link
                href={item.link}
                aria-label={`${item.title}: ${item.subtitle}`}
                tabIndex={idx >= STRIP_ITEMS.length ? -1 : undefined}
                aria-hidden={idx >= STRIP_ITEMS.length ? true : undefined}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B3B44] rounded-3xl"
              >
              {/* Image Box */}
              <div className="relative h-[230px] sm:h-[260px] w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Category Pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#243239] shadow-sm backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content Bottom */}
              <div className="p-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-medium text-[#243239] group-hover:text-[#2B3B44] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#5B6A71] mt-1 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>

                <span
                  aria-hidden
                  className="p-2.5 rounded-full bg-[#F2F5F6] text-[#2B3B44] group-hover:bg-[#2B3B44] group-hover:text-[#C4921B] transition-all shrink-0 mt-0.5 shadow-sm"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
