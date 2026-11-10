'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Briefcase, ArrowUpRight, ShieldCheck, Sparkles, 
  Bell, FileText, Calendar, ChevronRight
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  type: string;
  badge?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  frequency: string;
  isActive: boolean;
}

export default function UniversalAnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch('/api/public/announcements');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Filter out frequency === 'once_per_session' if already seen
          const visible = data.filter((ann: Announcement) => {
            if (ann.frequency === 'once_per_session') {
              return !sessionStorage.getItem(`cube_ann_seen_${ann.id}`);
            }
            return true;
          });
          setAnnouncements(visible.slice(0, 3)); // Stack up to 3 announcements
        }
      } catch (e) {
        // Fallback or offline resilience
      }
    }
    loadAnnouncements();
  }, []);

  const dismiss = (id: string, frequency: string) => {
    if (frequency === 'once_per_session') {
      sessionStorage.setItem(`cube_ann_seen_${id}`, 'true');
    }
    setDismissedIds((prev) => [...prev, id]);
  };

  const activeAnnouncements = announcements.filter(
    (a) => !dismissedIds.includes(a.id)
  );

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {activeAnnouncements.map((ann, idx) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 28, delay: idx * 0.1 }}
            drag="x"
            dragConstraints={{ left: 0, right: 200 }}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 60) {
                dismiss(ann.id, ann.frequency);
              }
            }}
            className="pointer-events-auto rounded-3xl bg-white backdrop-blur-2xl border border-[#BDD7E8] shadow-[0_20px_50px_rgba(7,14,92,0.18),0_4px_16px_rgba(36,39,43,0.08)] p-5 relative select-none"
          >
            {/* Specular highlight line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#BDD7E8] to-transparent opacity-90" />

            {ann.imageUrl && (
              <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-3.5 border border-[#BDD7E8]/80 shadow-xs">
                <Image
                  src={ann.imageUrl}
                  alt={ann.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-[#D99A42] text-white text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{ann.badge || 'WE ARE HIRING'}</span>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D99A42] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3 py-1 rounded-full border border-[#BDD7E8]">
                  {ann.badge || ann.type || 'Announcement'}
                </span>
              </div>

              <button
                onClick={() => dismiss(ann.id, ann.frequency)}
                className="text-[#747B83] hover:text-[#070E5C] p-1.5 rounded-full hover:bg-[#EAF2F8] transition-colors cursor-pointer"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              <h4 className="text-sm sm:text-base font-bold font-serif text-[#070E5C] tracking-tight line-clamp-2">
                {ann.title}
              </h4>
              <p className="text-xs text-[#24272B] font-medium leading-relaxed line-clamp-3">
                {ann.description}
              </p>
            </div>

            {ann.ctaUrl && (
              <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <Link
                  href={ann.ctaUrl}
                  onClick={() => dismiss(ann.id, ann.frequency)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#EAF2F8] hover:bg-[#070E5C] text-[#070E5C] hover:text-white font-bold text-xs border border-[#BDD7E8] transition-all shadow-2xs hover:shadow-xs active:scale-95"
                >
                  <span>{ann.ctaText || 'Learn More'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D99A42]" />
                </Link>
                <button
                  onClick={() => dismiss(ann.id, ann.frequency)}
                  className="text-[10px] font-semibold text-[#747B83] hover:text-[#070E5C] uppercase tracking-wider cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
