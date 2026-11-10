'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, Briefcase, CheckCircle2, Save, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { updateAnnouncementAction } from '@/app/admin/actions/cms';
import { useRouter } from 'next/navigation';

export default function AnnouncementsManagerClient({ initialAnnouncement }: { initialAnnouncement: any }) {
  const router = useRouter();
  const [ann, setAnn] = useState(initialAnnouncement || {
    id: 'ann_hiring_2026',
    title: 'WE ARE HIRING: Senior Structural & Environmental Engineers',
    subtitle: 'Centre of Excellence | IIT Madras & Govt of Tamil Nadu',
    description: 'CUBE invites applications from passionate civil, structural, environmental engineers and urban planners to work on marquee state infrastructure projects.',
    badge: 'WE ARE HIRING',
    ctaText: 'View Open Positions',
    ctaUrl: '/careers',
    imageUrl: '/images/hero/slides_building-training-team.jpg',
    frequency: 'once_per_session',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const form = new FormData(e.currentTarget);
    const payload = {
      id: ann.id,
      title: form.get('title') as string,
      subtitle: form.get('subtitle') as string,
      description: form.get('description') as string,
      badge: form.get('badge') as string,
      ctaText: form.get('ctaText') as string,
      ctaUrl: form.get('ctaUrl') as string,
      imageUrl: form.get('imageUrl') as string,
      frequency: form.get('frequency') as string,
      isActive: form.get('isActive') === 'on',
    };

    const res = await updateAnnouncementAction(payload);
    if (res.success) {
      setAnn(payload);
      setSaved(true);
      setLoading(false);
      router.refresh();
      setTimeout(() => setSaved(false), 4000);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              High Priority System
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Public Popup Engine</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-[#24272B] mt-1">
            Universal Announcements &amp; Hiring Popup
          </h1>
        </div>

        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase flex items-center space-x-1.5 ${
          ann.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
        }`}>
          <span className={`h-2 w-2 rounded-full ${ann.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span>{ann.isActive ? 'Popup Active on Live Site' : 'Popup Deactivated'}</span>
        </span>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Popup settings successfully updated and revalidated on public website!</span>
        </div>
      )}

      {/* Grid: Settings Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Configuration Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-[#24272B] mb-4 pb-2 border-b border-slate-100 flex items-center">
            <Bell className="w-4 h-4 text-[#070E5C] mr-2" />
            <span>Popup Behavior &amp; Content Configuration</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900">Enable Announcement Popup</div>
                <div className="text-[11px] text-slate-500">Show modal alert to incoming visitors</div>
              </div>
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={ann.isActive}
                className="h-5 w-5 rounded text-[#070E5C] focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pill Badge Text
                </label>
                <input
                  type="text"
                  name="badge"
                  defaultValue={ann.badge || 'WE ARE HIRING'}
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Display Frequency
                </label>
                <select
                  name="frequency"
                  defaultValue={ann.frequency || 'once_per_session'}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="once_per_session">Once Per Browser Session (Recommended)</option>
                  <option value="always">Every Page Load (Testing Only)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Announcement Main Title
              </label>
              <input
                type="text"
                name="title"
                defaultValue={ann.title}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                defaultValue={ann.subtitle || ''}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description Body
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={ann.description}
                required
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  name="ctaText"
                  defaultValue={ann.ctaText || 'View Open Positions'}
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  CTA Destination URL
                </label>
                <input
                  type="text"
                  name="ctaUrl"
                  defaultValue={ann.ctaUrl || '/careers'}
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Banner Image Path / URL
              </label>
              <input
                type="text"
                name="imageUrl"
                defaultValue={ann.imageUrl || '/images/hero/slides_building-training-team.jpg'}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-bold text-xs flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save &amp; Update Live Popup</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Real-Time Visual Preview matching Live Website Apple Liquid Glass Design (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#BDD7E8] p-5 rounded-3xl shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-[#070E5C] mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#D99A42]" />
                <span>Live Website Preview Render</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] font-semibold border border-[#BDD7E8]">
                Apple Liquid Glass
              </span>
            </div>
            
            {/* Exactly replicates the live public website Apple Glass popup card */}
            <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#BDD7E8] shadow-[0_16px_40px_rgba(7,14,92,0.1),inset_0_1px_1px_rgba(255,255,255,0.95)] p-5 relative overflow-hidden text-[#24272B]">
              {/* Specular highlight line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

              {ann.imageUrl && (
                <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-4 border border-[#BDD7E8]/60 shadow-xs">
                  <Image
                    src={ann.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-[#D99A42] text-white text-[10px] font-bold tracking-wider shadow-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{ann.badge || 'WE ARE HIRING'}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D99A42] animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-0.5 rounded-full border border-[#BDD7E8]">
                    {ann.badge || 'WE ARE HIRING'}
                  </span>
                </div>

                <h4 className="text-base font-bold font-serif text-[#070E5C] leading-snug pt-1">
                  {ann.title}
                </h4>
                {ann.subtitle && (
                  <p className="text-[11px] text-[#747B83] font-medium">{ann.subtitle}</p>
                )}
                <p className="text-xs text-[#24272B]/80 mt-2 line-clamp-3 leading-relaxed">
                  {ann.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[10px] text-[#747B83] uppercase tracking-wider font-semibold">Live Mode Preview</span>
                <span className="px-4 py-2 rounded-full bg-white hover:bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8] text-xs font-bold shadow-xs transition flex items-center gap-1.5">
                  <span>{ann.ctaText || 'View Open Positions'}</span>
                  <span className="text-[#D99A42]">&rarr;</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

