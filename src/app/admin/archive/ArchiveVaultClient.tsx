'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Archive,
  ArchiveRestore,
  Users,
  Newspaper,
  FileSpreadsheet,
  FlaskConical,
  ImageIcon,
  Inbox,
  FolderKanban,
  Briefcase,
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';
import {
  deleteTeamMemberAction,
  deleteNewsAction,
  deleteTenderAction,
  deleteCELServiceAction,
  deleteMediaAssetAction,
  archiveProjectAction,
  archiveCareerAction,
} from '@/app/admin/actions/cms';
import { deleteEnquiryAction } from '@/app/actions/enquiries';
import { useRouter } from 'next/navigation';

interface ArchiveVaultProps {
  archivedNews: any[];
  archivedTeam: any[];
  archivedTenders: any[];
  archivedCEL: any[];
  archivedMedia: any[];
  archivedEnquiries: any[];
  archivedProjects?: any[];
  archivedCareers?: any[];
}

export default function ArchiveVaultClient({
  archivedNews: initNews,
  archivedTeam: initTeam,
  archivedTenders: initTenders,
  archivedCEL: initCEL,
  archivedMedia: initMedia,
  archivedEnquiries: initEnquiries,
  archivedProjects: initProjects = [],
  archivedCareers: initCareers = [],
}: ArchiveVaultProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'all' | 'projects' | 'careers' | 'team' | 'news' | 'tenders' | 'cel' | 'media' | 'enquiries'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [teamList, setTeamList] = useState(initTeam);
  const [newsList, setNewsList] = useState(initNews);
  const [tendersList, setTendersList] = useState(initTenders);
  const [celList, setCelList] = useState(initCEL);
  const [mediaList, setMediaList] = useState(initMedia);
  const [enquiriesList, setEnquiriesList] = useState(initEnquiries);
  const [projectsList, setProjectsList] = useState(initProjects);
  const [careersList, setCareersList] = useState(initCareers);

  // Sync with server refreshes so newly archived/restored items appear live.
  useEffect(() => {
    setTeamList(initTeam);
    setNewsList(initNews);
    setTendersList(initTenders);
    setCelList(initCEL);
    setMediaList(initMedia);
    setEnquiriesList(initEnquiries);
    setProjectsList(initProjects);
    setCareersList(initCareers);
  }, [initTeam, initNews, initTenders, initCEL, initMedia, initEnquiries, initProjects, initCareers]);

  // Restore Handlers
  const handleRestoreProject = async (proj: any) => {
    if (!confirm(`Restore project "${proj.title}" to active portfolio?`)) return;
    setLoading(true);
    const res = await archiveProjectAction(proj.id || proj.slug);
    if (res.success) {
      setProjectsList((prev) => prev.filter((p) => (p.id || p.slug) !== (proj.id || proj.slug)));
      router.refresh();
    }
    setLoading(false);
  };

  const handleRestoreCareer = async (job: any) => {
    if (!confirm(`Restore job opening "${job.title}" to active careers?`)) return;
    setLoading(true);
    const res = await archiveCareerAction(job.id);
    if (res.success) {
      setCareersList((prev) => prev.filter((c) => c.id !== job.id));
      router.refresh();
    }
    setLoading(false);
  };

  const handleRestoreTeam = async (member: any) => {
    const idOrName = member.id || member.name;
    if (!confirm(`Restore ${member.name} back to active staff directory?`)) return;
    setLoading(true);
    const res = await deleteTeamMemberAction(idOrName);
    if (res.success) {
      setTeamList((prev) => prev.filter((m) => (m.id || m.name) !== idOrName));
      router.refresh();
    }
    setLoading(false);
  };

  const handleRestoreNews = async (item: any) => {
    if (!confirm(`Restore "${item.title}" to published news?`)) return;
    setLoading(true);
    const res = await deleteNewsAction(item.id);
    if (res.success) {
      setNewsList((prev) => prev.filter((n) => n.id !== item.id));
      router.refresh();
    }
    setLoading(false);
  };

  const handleRestoreTender = async (item: any) => {
    if (!confirm(`Restore tender "${item.title}" to active notices?`)) return;
    setLoading(true);
    const res = await deleteTenderAction(item.id);
    if (res.success) {
      setTendersList((prev) => prev.filter((t) => t.id !== item.id));
      router.refresh();
    }
    setLoading(false);
  };

  const handleRestoreCEL = async (item: any) => {
    if (!confirm(`Restore CEL service "${item.title}" to live testing portfolio?`)) return;
    setLoading(true);
    const res = await deleteCELServiceAction(item.id);
    if (res.success) {
      setCelList((prev) => prev.filter((c) => c.id !== item.id));
      router.refresh();
    }
    setLoading(false);
  };

  const handleRestoreMedia = async (item: any) => {
    if (!confirm(`Restore photo "${item.title}" to active gallery?`)) return;
    setLoading(true);
    const res = await deleteMediaAssetAction(item.id);
    if (res.success) {
      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
      router.refresh();
    }
    setLoading(false);
  };

  const handleRestoreEnquiry = async (item: any) => {
    if (!confirm(`Restore enquiry from ${item.name} to active inbox?`)) return;
    setLoading(true);
    const res = await deleteEnquiryAction(item.id);
    if (res.success) {
      setEnquiriesList((prev) => prev.filter((e) => e.id !== item.id));
      router.refresh();
    }
    setLoading(false);
  };

  const totalArchivedCount =
    projectsList.length +
    careersList.length +
    teamList.length +
    newsList.length +
    tendersList.length +
    celList.length +
    mediaList.length +
    enquiriesList.length;

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return (text || '').toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return 'Not recorded';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const TABS = [
    { id: 'all', label: 'All Archived Items', count: totalArchivedCount, icon: Archive },
    { id: 'projects', label: 'Projects', count: projectsList.length, icon: FolderKanban },
    { id: 'careers', label: 'Careers & Hiring', count: careersList.length, icon: Briefcase },
    { id: 'team', label: 'Team & Personnel', count: teamList.length, icon: Users },
    { id: 'news', label: 'News & Press', count: newsList.length, icon: Newspaper },
    { id: 'tenders', label: 'Tenders & Notices', count: tendersList.length, icon: FileSpreadsheet },
    { id: 'cel', label: 'CEL Lab Services', count: celList.length, icon: FlaskConical },
    { id: 'media', label: 'Media & Photos', count: mediaList.length, icon: ImageIcon },
    { id: 'enquiries', label: 'Enquiries', count: enquiriesList.length, icon: Inbox },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-0.5 rounded border border-[#BBD6EA]">
              Central Archive Vault
            </span>
            <span className="text-xs text-slate-300">&bull;</span>
            <span className="text-xs text-[#6B7280] font-medium">Safe Repository &bull; Audit Trail with Timestamp &amp; Remark</span>
          </div>
          <h1 className="text-2xl font-serif text-[#24272B] mt-1">
            Institutional Archive &amp; Audit Records
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Archived records are completely removed from public pages and active admin desks, but safely preserved here with their exact creation time, archive time, and mandatory administrator audit remark.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>{totalArchivedCount} Total Archived Records</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition ${
                  isSelected
                    ? 'bg-[#070E5C] text-white border-[#070E5C] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search through archived records by title, person name, or archive remark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#070E5C] bg-[#FAFAFA]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {totalArchivedCount === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
          <Archive className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700">The Archive Vault is currently empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When you archive any project, job opening, team member, news article, tender, CEL service, photo, or enquiry, it will immediately appear here with its full audit trail.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Section: Archived Projects */}
          {(activeTab === 'all' || activeTab === 'projects') && projectsList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <FolderKanban className="w-4 h-4 text-[#070E5C]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Archived Projects &amp; Infrastructure ({projectsList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectsList
                  .filter((p) => matchesSearch(p.title + ' ' + (p.client || '') + ' ' + (p.archiveRemark || '')))
                  .map((proj) => (
                    <div
                      key={proj.id || proj.slug}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {proj.category}
                          </span>
                          <h3 className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">{proj.title}</h3>
                          <p className="text-[11px] text-slate-400">Client: {proj.client || 'Government Authority'}</p>
                        </div>

                        <button
                          onClick={() => handleRestoreProject(proj)}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>

                      {/* Audit Details */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                          Archive Reason / Remark:
                        </div>
                        <p className="italic">&quot;{proj.archiveRemark || 'Archived from public portfolio'}&quot;</p>
                        <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4 text-[10px] text-amber-800">
                          <span>Created: {formatDateTime(proj.createdAt)}</span>
                          <span>Archived: {formatDateTime(proj.archivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section: Archived Careers */}
          {(activeTab === 'all' || activeTab === 'careers') && careersList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <Briefcase className="w-4 h-4 text-[#070E5C]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Archived Job Openings ({careersList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {careersList
                  .filter((c) => matchesSearch(c.title + ' ' + (c.department || '') + ' ' + (c.archiveRemark || '')))
                  .map((job) => (
                    <div
                      key={job.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {job.department}
                          </span>
                          <h3 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{job.title}</h3>
                          <p className="text-[11px] text-slate-400">{job.location} &bull; {job.experience}</p>
                        </div>

                        <button
                          onClick={() => handleRestoreCareer(job)}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>

                      {/* Audit Details */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                          Archive Reason / Remark:
                        </div>
                        <p className="italic">&quot;{job.archiveRemark || 'Archived vacancy'}&quot;</p>
                        <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4 text-[10px] text-amber-800">
                          <span>Created: {formatDateTime(job.createdAt)}</span>
                          <span>Archived: {formatDateTime(job.archivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section: Archived Team Members */}
          {(activeTab === 'all' || activeTab === 'team') && teamList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <Users className="w-4 h-4 text-[#070E5C]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Archived Personnel &amp; Team Members ({teamList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamList
                  .filter((m) => matchesSearch(m.name + ' ' + m.designation + ' ' + (m.archiveRemark || '')))
                  .map((member) => (
                    <div
                      key={member.id || member.name}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="relative h-12 w-12 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {member.image ? (
                              <Image src={member.image} alt={member.name} fill className="object-cover grayscale" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                                {member.name[0]}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              {member.department || member.category}
                            </span>
                            <h3 className="text-xs font-bold text-slate-800 truncate mt-1">{member.name}</h3>
                            <p className="text-[11px] text-slate-500 truncate">{member.designation}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRestoreTeam(member)}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition"
                          title="Restore to active directory"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>

                      {/* Audit Details */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                          Archive Reason / Remark:
                        </div>
                        <p className="italic">&quot;{member.archiveRemark || 'Archived by Administrator'}&quot;</p>
                        <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4 text-[10px] text-amber-800">
                          <span>Created: {formatDateTime(member.createdAt)}</span>
                          <span>Archived: {formatDateTime(member.archivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section: Archived News */}
          {(activeTab === 'all' || activeTab === 'news') && newsList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <Newspaper className="w-4 h-4 text-[#070E5C]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Archived News &amp; Articles ({newsList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newsList
                  .filter((n) => matchesSearch(n.title + ' ' + (n.archiveRemark || '')))
                  .map((article) => (
                    <div
                      key={article.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {article.category}
                          </span>
                          <h3 className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">{article.title}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">{article.date}</p>
                        </div>

                        <button
                          onClick={() => handleRestoreNews(article)}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>

                      {/* Audit Details */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                          Archive Reason / Remark:
                        </div>
                        <p className="italic">&quot;{article.archiveRemark || 'Archived from public news'}&quot;</p>
                        <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4 text-[10px] text-amber-800">
                          <span>Created: {formatDateTime(article.createdAt)}</span>
                          <span>Archived: {formatDateTime(article.archivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section: Archived Tenders */}
          {(activeTab === 'all' || activeTab === 'tenders') && tendersList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <FileSpreadsheet className="w-4 h-4 text-[#070E5C]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Archived Tenders &amp; Procurement Notices ({tendersList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tendersList
                  .filter((t) => matchesSearch(t.title + ' ' + (t.referenceNumber || '') + ' ' + (t.archiveRemark || '')))
                  .map((tender) => (
                    <div
                      key={tender.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono font-bold text-[#070E5C] bg-[#EAF2F8] px-2 py-0.5 rounded">
                            {tender.referenceNumber}
                          </span>
                          <h3 className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">{tender.title}</h3>
                        </div>

                        <button
                          onClick={() => handleRestoreTender(tender)}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>

                      {/* Audit Details */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                          Archive Reason / Remark:
                        </div>
                        <p className="italic">&quot;{tender.archiveRemark || 'Concluded tender notice'}&quot;</p>
                        <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4 text-[10px] text-amber-800">
                          <span>Created: {formatDateTime(tender.createdAt)}</span>
                          <span>Archived: {formatDateTime(tender.archivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section: Archived CEL Services */}
          {(activeTab === 'all' || activeTab === 'cel') && celList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <FlaskConical className="w-4 h-4 text-[#070E5C]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Archived CEL Laboratory Testing Services ({celList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {celList
                  .filter((c) => matchesSearch(c.title + ' ' + (c.archiveRemark || '')))
                  .map((service) => (
                    <div
                      key={service.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {service.category}
                          </span>
                          <h3 className="text-xs font-bold text-slate-800 mt-1">{service.title}</h3>
                        </div>

                        <button
                          onClick={() => handleRestoreCEL(service)}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>

                      {/* Audit Details */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                          Archive Reason / Remark:
                        </div>
                        <p className="italic">&quot;{service.archiveRemark || 'Temporarily paused protocol'}&quot;</p>
                        <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4 text-[10px] text-amber-800">
                          <span>Created: {formatDateTime(service.createdAt)}</span>
                          <span>Archived: {formatDateTime(service.archivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section: Archived Media & Photos */}
          {(activeTab === 'all' || activeTab === 'media') && mediaList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <ImageIcon className="w-4 h-4 text-[#070E5C]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Archived Media &amp; Photos ({mediaList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaList
                  .filter((m) => matchesSearch(m.title + ' ' + (m.category || '') + ' ' + (m.archiveRemark || '')))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="relative h-14 w-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.title} fill className="object-cover grayscale" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold text-slate-400">
                                <ImageIcon className="w-6 h-6 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              {item.category || 'Gallery'}
                            </span>
                            <h3 className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{item.title}</h3>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{item.imageUrl}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRestoreMedia(item)}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition"
                          title="Restore to active media gallery"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>

                      {/* Audit Details */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                          Archive Reason / Remark:
                        </div>
                        <p className="italic">&quot;{item.archiveRemark || 'Archived from public media gallery'}&quot;</p>
                        <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4 text-[10px] text-amber-800">
                          <span>Created: {formatDateTime(item.createdAt)}</span>
                          <span>Archived: {formatDateTime(item.archivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section: Archived Enquiries */}
          {(activeTab === 'all' || activeTab === 'enquiries') && enquiriesList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-1">
                <Inbox className="w-4 h-4 text-[#070E5C]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Archived Citizen &amp; Client Inquiries ({enquiriesList.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enquiriesList
                  .filter((e) => matchesSearch(e.name + ' ' + e.message + ' ' + (e.archiveRemark || '')))
                  .map((enquiry) => (
                    <div
                      key={enquiry.id}
                      className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {enquiry.category}
                          </span>
                          <h3 className="text-xs font-bold text-slate-800 mt-1">{enquiry.name}</h3>
                          <p className="text-[11px] text-slate-400">{enquiry.email}</p>
                        </div>

                        <button
                          onClick={() => handleRestoreEnquiry(enquiry)}
                          disabled={loading}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold flex items-center space-x-1 shrink-0 transition"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      </div>

                      {/* Audit Details */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="font-bold text-[10px] uppercase text-amber-800 tracking-wider">
                          Archive Reason / Remark:
                        </div>
                        <p className="italic">&quot;{enquiry.archiveRemark || 'Resolved inquiry'}&quot;</p>
                        <div className="pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4 text-[10px] text-amber-800">
                          <span>Created: {formatDateTime(enquiry.timestamp)}</span>
                          <span>Archived: {formatDateTime(enquiry.archivedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
