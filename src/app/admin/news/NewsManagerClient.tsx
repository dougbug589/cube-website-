'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { imageForUpdate } from '@/lib/image-field';
import { 
  Newspaper, Plus, Search, Filter, CheckCircle2, 
  Clock, Archive, ArchiveRestore, Eye, Edit3, ArrowRight, AlertCircle, Loader2, X
} from 'lucide-react';
import { 
  createNewsAction, 
  updateNewsAction, 
  updateNewsStatusAction, 
  deleteNewsAction 
} from '@/app/admin/actions/cms';
import { useRouter } from 'next/navigation';

export default function AdminNewsManager({ initialNews }: { initialNews: any[] }) {
  const router = useRouter();
  const [newsList, setNewsList] = useState<any[]>(initialNews);
  useEffect(() => { setNewsList(initialNews); }, [initialNews]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Modal State for Quick Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Institutional');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/hero/slides_building-training-team.jpg');
  const [featured, setFeatured] = useState(false);

  // Archive Remark Modal State
  const [archiveModalTarget, setArchiveModalTarget] = useState<any | null>(null);
  const [archiveRemark, setArchiveRemark] = useState('');

  const filteredNews = newsList.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'All' || n.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditingArticle(null);
    setTitle('');
    setCategory('Institutional');
    setExcerpt('');
    setContent('');
    setImageUrl('/images/hero/slides_building-training-team.jpg');
    setFeatured(false);
    setIsModalOpen(true);
  };

  // Deep link from the dashboard's "Create Article" button: /admin/news?new=1
  // opens the new-article form directly (that button used to 404).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === '1') {
      openAddModal();
      params.delete('new');
      const query = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditModal = (article: any) => {
    setEditingArticle(article);
    setTitle(article.title || '');
    setCategory(article.category || 'Institutional');
    setExcerpt(article.excerpt || '');
    setContent(article.content || '');
    setImageUrl(article.image || article.imageUrl || '/images/hero/slides_building-training-team.jpg');
    setFeatured(!!article.featured);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    try {
      if (editingArticle) {
        const res = await updateNewsAction(editingArticle.id, {
          title,
          category,
          excerpt,
          content,
          imageUrl: imageForUpdate(imageUrl),
          featured,
        });

        if (res.success && res.article) {
          setNewsList(newsList.map((n) => (n.id === editingArticle.id ? { ...n, ...res.article } : n)));
          setSuccessMsg('Article updated and synchronized to live public website!');
          setIsModalOpen(false);
          router.refresh();
        } else {
          alert(res.error || 'Failed to update article');
        }
      } else {
        const res = await createNewsAction({
          title,
          category,
          excerpt,
          content,
          imageUrl,
          featured,
          status: 'published',
        });

        if (res.success && res.article) {
          setNewsList([res.article, ...newsList]);
          setSuccessMsg('Article published and synchronized to live public website!');
          setIsModalOpen(false);
          router.refresh();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const res = await updateNewsStatusAction(id, newStatus);
    if (res.success) {
      setNewsList(
        newsList.map((n) => (n.id === id ? { ...n, status: newStatus } : n))
      );
      router.refresh();
    }
  };

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModalTarget) return;
    setLoading(true);
    try {
      const res = await deleteNewsAction(archiveModalTarget.id, archiveRemark);
      if (res.success) {
        setNewsList(
          newsList.map((n) =>
            n.id === archiveModalTarget.id
              ? { ...n, status: 'archived', archiveRemark, archivedAt: new Date().toISOString() }
              : n
          )
        );
        setArchiveModalTarget(null);
        setArchiveRemark('');
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to archive news article');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Restore this article to published status?')) return;
    const res = await deleteNewsAction(id);
    if (res.success) {
      setNewsList(
        newsList.map((n) => (n.id === id ? { ...n, status: 'published', archiveRemark: undefined } : n))
      );
      router.refresh();
    }
  };

  const handleArchiveClick = (article: any) => {
    if (article.status === 'archived') {
      handleRestore(article.id);
    } else {
      setArchiveModalTarget(article);
      setArchiveRemark('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
              Media CMS Desk
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500">Public News, Events &amp; Bulletins</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
            News &amp; Press Releases Desk
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold text-xs flex items-center space-x-2 shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Article</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search news titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-teal-500"
          >
            <option value="All">All Categories</option>
            <option value="Institutional">Institutional</option>
            <option value="Initiative">Initiative</option>
            <option value="Research & Technology">Research &amp; Technology</option>
            <option value="Events">Events</option>
          </select>
        </div>
      </div>

      {/* Table of Articles */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Title &amp; Meta</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredNews.map((article) => {
                const isArchived = article.status === 'archived';
                return (
                  <tr key={article.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 max-w-md line-clamp-1">
                        {article.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {article.excerpt}
                      </div>
                      {article.archiveRemark && ['archived', 'Archive'].includes(article.status) && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                          Remark: {article.archiveRemark}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {article.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{article.author || 'CUBE Editorial'}</td>
                    <td className="py-3 px-4 text-slate-500">{article.date}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(article.id, article.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                          article.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-amber-100 hover:text-amber-800'
                            : isArchived
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                        title="Click to toggle Draft / Published"
                      >
                        {article.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(article)}
                        className="p-1.5 rounded-lg text-[#070E5C] hover:bg-[#EAF2F8] transition inline-block"
                        title="Edit Article Content"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Public view */}
                      <Link
                        href={`/media/news`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#070E5C] hover:bg-[#EAF2F8] inline-block"
                        title="View on Public Site"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {/* Archive Button */}
                      <button
                        onClick={() => handleArchiveClick(article)}
                        className={`p-1.5 rounded-lg inline-block transition ${
                          isArchived
                            ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                            : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                        title={isArchived ? 'Restore to Published' : 'Archive with Remark'}
                      >
                        {isArchived ? (
                          <ArchiveRestore className="w-4 h-4" />
                        ) : (
                          <Archive className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900">
                  {editingArticle ? 'Edit Article & Media' : 'Publish New Institutional News'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Edits are synchronized directly with `/media/news` in real time.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Article Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CUBE Completes Heritage Structural Health Audit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                    <option value="Institutional">Institutional</option>
                    <option value="Initiative">Initiative</option>
                    <option value="Research & Technology">Research &amp; Technology</option>
                    <option value="Events">Events</option>
                  </select>
                </div>

              </div>

              <ImageUploadField
                label="Cover Image"
                value={imageUrl}
                onChange={setImageUrl}
              />

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Summary / Excerpt (Shows on cards) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief summary of the news story..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Article Body / Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Comprehensive write-up, details, quotes and outcomes..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="featured" className="text-slate-700 font-medium">
                  Pin as Featured Article on Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingArticle ? 'Update Article' : 'Publish Live'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Remark Modal */}
      {archiveModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Archive News Article</h3>
                  <p className="text-[11px] text-slate-400">Save audit remark before archiving</p>
                </div>
              </div>
              <button
                onClick={() => setArchiveModalTarget(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleArchiveSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="font-semibold line-clamp-1">{archiveModalTarget.title}</span> will be safely removed from the live website feed without deletion.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Remark for Archiving <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Outdated event notification / Replaced with post-event proceeding summary."
                  value={archiveRemark}
                  onChange={(e) => setArchiveRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-200 outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setArchiveModalTarget(null)}
                  className="px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition"
                >
                  {loading ? 'Archiving...' : 'Save Remark & Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
