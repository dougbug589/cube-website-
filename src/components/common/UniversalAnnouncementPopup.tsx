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
            className="pointer-events-auto rounded-3xl bg-white/92 backdrop-blur-2xl border border-[#BDD7E8] shadow-[0_16px_40px_rgba(7,14,92,0.1),inset_0_1px_1px_rgba(255,255,255,0.95)] p-4 sm:p-5 relative select-none"
          >
            {/* Specular highlight line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

            {ann.imageUrl && (
              <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 border border-[#BDD7E8]/60 shadow-xs">
                <Image
                  src={ann.imageUrl}
                  alt={ann.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#D99A42] text-white text-[9px] font-bold tracking-wider shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{ann.badge || 'WE ARE HIRING'}</span>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D99A42] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-0.5 rounded-full border border-[#BDD7E8]">
                  {ann.badge || ann.type || 'Announcement'}
                </span>
              </div>

              <button
                onClick={() => dismiss(ann.id, ann.frequency)}
                className="text-[#747B83] hover:text-[#24272B] p-1 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-2.5 space-y-1">
              <h4 className="text-xs sm:text-sm font-bold font-serif text-[#24272B] tracking-tight line-clamp-1">
                {ann.title}
              </h4>
              <p className="text-[11px] text-[#747B83] leading-relaxed line-clamp-2">
                {ann.description}
              </p>
            </div>

            {ann.ctaUrl && (
              <div className="mt-3 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between">
                <Link
                  href={ann.ctaUrl}
                  onClick={() => dismiss(ann.id, ann.frequency)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#070E5C] hover:text-[#D99A42] transition-colors"
                >
                  <span>{ann.ctaText || 'Learn More'}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#D99A42]" />
                </Link>
                <span className="text-[9px] text-[#747B83] uppercase tracking-wider">
                  Swipe to dismiss
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
