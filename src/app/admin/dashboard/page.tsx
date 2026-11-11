import React from 'react';
import Link from 'next/link';
import { 
  FolderKanban, Newspaper, Briefcase, FileSpreadsheet, 
  FlaskConical, Users, Bell, ArrowRight, ShieldCheck, 
  Plus, CheckCircle2, AlertCircle, Clock, Inbox, RefreshCw
} from 'lucide-react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardOverviewPage() {
  await requireAdmin();
  const store = await getCMSStore();

  const totalProjects = store.projects.length;
  const publishedProjects = store.projects.filter((p) => p.status === 'published').length;
  const draftProjects = store.projects.filter((p) => p.status === 'draft').length;

  const totalNews = store.news.length;
  const publishedNews = store.news.filter((n) => n.status === 'published').length;

  const activeCareers = store.careers.filter((c) => c.status === 'published' && c.isActive).length;
  const activeTenders = store.tenders.filter((t) => t.status === 'Active').length;
  const activeAnnouncements = store.announcements.filter((a) => a.isActive).length;

  const totalEnquiries = store.enquiries?.length || 0;
  const unreadEnquiries = store.enquiries?.filter((e) => !e.isRead).length || 0;

  const recentLogs = store.auditLogs.slice(0, 8);

  const statsCards = [
    {
      title: 'Realtime Enquiries & CEL',
      count: totalEnquiries,
      subtext: `${unreadEnquiries} pending unread messages`,
      icon: Inbox,
      href: '/admin/enquiries',
      color: 'border-[#BBD6EA] text-[#070E5C] bg-[#EAF2F8]',
    },
    {
      title: 'Published Projects',
      count: publishedProjects,
      subtext: `${draftProjects} in draft mode`,
      icon: FolderKanban,
      href: '/admin/projects',
      color: 'border-blue-200 text-blue-700 bg-blue-50',
    },
    {
      title: 'News & Press',
      count: publishedNews,
      subtext: `${totalNews} total articles in system`,
      icon: Newspaper,
      href: '/admin/news',
      color: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    },
    {
      title: 'Active Job Openings',
      count: activeCareers,
      subtext: 'Publicly accepting applications',
      icon: Briefcase,
      href: '/admin/careers',
      color: 'border-amber-200 text-amber-700 bg-amber-50',
    },
    {
      title: 'Active Tenders',
      count: activeTenders,
      subtext: `${store.tenders.length} total procurement notices`,
      icon: FileSpreadsheet,
      href: '/admin/tenders',
      color: 'border-[#BBD6EA] text-[#070E5C] bg-[#EAF2F8]',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome panel: light blue & white. The CUBE artwork is shown only in
          the page background (FloatingCubeBackground), not inside this panel. */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-white/95 to-[#EAF2F8] backdrop-blur-md text-[#24272B] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm border border-[#D6E6F2] relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#D6E9F7]/70 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] px-3 py-1 rounded-full border border-[#BBD6EA]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D99A42]" />
            <span>Authenticated Institutional Console &bull; Realtime Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#24272B] font-normal tracking-tight">
            CUBE Content Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed">
            Manage projects, publish breaking news, configure public hiring popups, and review citizen enquiries in real-time. Changes sync immediately to the public portal without redeployment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Link
            href="/admin/news?new=1"
            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] flex items-center space-x-1.5 transition shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </Link>
          <Link
            href="/admin/announcements"
            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white hover:bg-[#F7F7F4] text-[#24272B] border border-[#E5E7EB] flex items-center space-x-1.5 transition shadow-2xs"
          >
            <Bell className="w-4 h-4 text-[#D99A42]" />
            <span>Manage Hiring Popup</span>
          </Link>
        </div>
      </div>

      {/* Real Statistics Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#D6E6F2] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#4A5568] uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl sm:text-3xl font-bold text-[#24272B]">
                  {card.count}
                </div>
                <div className="text-xs text-[#6B7280] mt-1 flex items-center justify-between">
                  <span>{card.subtext}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D99A42] group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Split Section: Quick Controls & Cryptographic Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Publishing Modules (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#D6E6F2] p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#24272B] flex items-center font-serif">
                <Newspaper className="w-4 h-4 text-[#D99A42] mr-2" />
                <span>Recent News &amp; Press Releases</span>
              </h2>
              <Link
                href="/admin/news"
                className="text-xs font-semibold text-[#070E5C] hover:text-[#D99A42] flex items-center"
              >
                <span>View All ({totalNews})</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {store.news.slice(0, 4).map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA]">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#24272B] mt-1 truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                      {item.date} &bull; {item.author}
                    </p>
                  </div>

                  <Link
                    href={`/admin/news`}
                    className="px-3 py-1.5 rounded-full bg-[#F7F7F4] hover:bg-[#EAF2F8] text-[#24272B] hover:text-[#070E5C] border border-[#E5E7EB] text-xs font-medium flex-shrink-0 transition"
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Universal Hiring Announcement Status Card */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#D6E6F2] p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#24272B] flex items-center font-serif">
                <Bell className="w-4 h-4 text-[#D99A42] mr-2" />
                <span>Universal Hiring Popup Banner</span>
              </h2>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                activeAnnouncements > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-[#F7F7F4] text-[#6B7280] border border-[#E5E7EB]'
              }`}>
                {activeAnnouncements > 0 ? 'STATUS: ACTIVE' : 'STATUS: DISABLED'}
              </span>
            </div>

            {store.announcements.length > 0 && (
              <div className="p-4 rounded-xl bg-[#F7F7F4] border border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#24272B]">
                    {store.announcements[0].title}
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-0.5">
                    Frequency: <span className="font-semibold text-[#24272B]">{store.announcements[0].frequency}</span> &bull; CTA: {store.announcements[0].ctaText}
                  </div>
                </div>

                <Link
                  href="/admin/announcements"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] hover:bg-[#D99A42] hover:text-white border border-[#BBD6EA] transition shadow-2xs flex-shrink-0"
                >
                  Configure Popup Settings
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Immutable Audit Trail (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#D6E6F2] p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E7EB]">
              <h2 className="text-sm font-bold text-[#24272B] flex items-center font-serif">
                <Clock className="w-4 h-4 text-[#D99A42] mr-1.5" />
                <span>Real-Time Audit Trail</span>
              </h2>
              <span className="text-[10px] font-bold text-[#070E5C] bg-[#EAF2F8] px-2 py-0.5 rounded-md border border-[#BBD6EA]">
                Secured
              </span>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-[#F7F7F4] border border-[#E5E7EB] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#070E5C] bg-[#EAF2F8] px-1.5 py-0.5 rounded border border-[#BBD6EA]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[#24272B] font-medium mt-1 truncate">
                    {log.resourceType}: {log.resourceId}
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5 truncate">
                    By: {log.userEmail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
