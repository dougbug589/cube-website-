'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useCmsUpdates } from '@/lib/live';
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

const ANN_TTL_MS = 5 * 60 * 1000;
const ANN_CACHE = new Map<string, { t: number; data: unknown }>();

export default function UniversalAnnouncementPopup() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const pathname = usePathname();

  // Load announcements targeted at THIS page (previously the page was never
  // sent, so home-only popups appeared on every page). Reloads on navigation
  // and instantly when an admin changes announcements.
  // Answers are cached per page for a few minutes, so moving between pages
  // does not cost a server request each time; an admin change (CMS update
  // event) bypasses the cache.
  const loadAnnouncements = useCallback(async (force = false) => {
    try {
      const key = pathname || '/';
      const hit = ANN_CACHE.get(key);
      let data: unknown;
      if (!force && hit && Date.now() - hit.t < ANN_TTL_MS) {
        data = hit.data;
      } else {
        const res = await fetch(`/api/public/announcements?page=${encodeURIComponent(key)}`, {
          cache: 'no-store',
        });
        if (!res.ok) return;
        data = await res.json();
        ANN_CACHE.set(key, { t: Date.now(), data });
      }
      if (!Array.isArray(data)) return;
      const visible = data.filter((ann: Announcement) => {
        if (ann.frequency === 'once_per_session') {
          try {
            return !sessionStorage.getItem(`cube_ann_seen_${ann.id}`);
          } catch {
            return true;
          }
        }
        return true;
      });
      setAnnouncements(visible.slice(0, 3)); // Stack up to 3 announcements
    } catch {
      // Offline: keep current state.
    }
  }, [pathname]);

  // After the new page has rendered (idle), not in the middle of navigation.
  useEffect(() => {
    const w = window as any;
    const run = () => loadAnnouncements();
    const id = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 1500 }) : window.setTimeout(run, 300);
    return () => (w.cancelIdleCallback ? w.cancelIdleCallback(id) : clearTimeout(id));
  }, [loadAnnouncements]);

  useCmsUpdates(useCallback(() => loadAnnouncements(true), [loadAnnouncements]));

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
    <div className="fixed z-50 flex flex-col gap-3 pointer-events-none left-3 right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:left-auto sm:bottom-auto sm:top-24 sm:right-8 sm:w-full sm:max-w-sm">
      <AnimatePresence>
        {activeAnnouncements.map((ann, idx) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 28, delay: idx * 0.1 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 60) {
                dismiss(ann.id, ann.frequency);
              }
            }}
            className="pointer-events-auto rounded-3xl bg-[#14181B]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(36,50,57,0.18),0_4px_16px_rgba(36,39,43,0.08)] p-4 sm:p-5 relative select-none max-h-[70vh] overflow-y-auto"
          >
            {/* Specular highlight line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-90" />

            {ann.imageUrl && (
              <div className="relative hidden sm:block h-36 w-full rounded-2xl overflow-hidden mb-3.5 border border-white/10 shadow-xs">
                <Image
                  src={ann.imageUrl}
                  alt={ann.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-[#D89F03]/35 text-[#F3F5F6] text-[13.5px] font-bold tracking-wider shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/[0.06] animate-pulse" />
                  <span>{ann.badge || 'WE ARE HIRING'}</span>
                </div>
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D89F03]/35 animate-pulse" />
                <span className="text-[13.5px] font-bold uppercase tracking-wider text-[#E3E8EA] bg-white/[0.05] px-3 py-1 rounded-full border border-white/10">
                  {ann.badge || ann.type || 'Announcement'}
                </span>
              </div>

              <button
                onClick={() => dismiss(ann.id, ann.frequency)}
                className="text-[#A7B2B8] hover:text-[#E3E8EA] p-2.5 -m-1 rounded-full hover:bg-white/[0.05] transition-colors cursor-pointer"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              <h4 className="text-sm sm:text-base font-bold font-display text-[#E3E8EA] tracking-tight line-clamp-2">
                {ann.title}
              </h4>
              <p className="text-xs text-[#F3F5F6] font-medium leading-relaxed line-clamp-2 sm:line-clamp-3">
                {ann.description}
              </p>
            </div>

            {ann.ctaUrl && (
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <Link
                  href={ann.ctaUrl}
                  onClick={() => dismiss(ann.id, ann.frequency)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-full bg-white/[0.05] hover:bg-[#2B3B44] text-[#E3E8EA] hover:text-white font-bold text-xs border border-white/10 transition shadow-2xs hover:shadow-xs active:scale-95"
                >
                  <span>{ann.ctaText || 'Learn More'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D89F03]" />
                </Link>
                <button
                  onClick={() => dismiss(ann.id, ann.frequency)}
                  className="text-[13.5px] font-semibold text-[#A7B2B8] hover:text-[#E3E8EA] uppercase tracking-wider cursor-pointer px-2 py-2.5 -my-2"
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
