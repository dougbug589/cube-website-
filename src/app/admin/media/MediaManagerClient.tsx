'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { 
  Upload, Search, Plus, Archive, ArchiveRestore, Edit3, X, Image as ImageIcon,
  CheckCircle2, Folder, ExternalLink, RefreshCw 
} from 'lucide-react';
import { 
  addMediaAssetAction, 
  updateMediaAssetAction, 
  deleteMediaAssetAction 
} from '@/app/admin/actions/cms';
import { useRouter } from 'next/navigation';

interface MediaItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  status?: string;
  createdAt?: string;
}

interface MediaManagerProps {
  initialGallery: MediaItem[];
}

export default function MediaManagerClient({ initialGallery }: MediaManagerProps) {
  const router = useRouter();
  const [gallery, setGallery] = useState<MediaItem[]>(initialGallery);
  useEffect(() => { setGallery(initialGallery); }, [initialGallery]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Projects');
  const [imageUrl, setImageUrl] = useState('');

  const categories = [
    'ALL',
    'Showcase & Hero',
    'Laboratory & CEL',
    'Projects',
    'Institutional & About',
    'Leadership & Team',
    'Infrastructure',
    'General',
  ];

  const filtered = gallery.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Projects');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setImageUrl(item.imageUrl);
    setIsModalOpen(true);
  };

  // Auto-fill the title from the uploaded file's name when it is still empty.
  const handleUploaded = (file: File) => {
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert('Please provide a title and upload an image.');
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        const res = await updateMediaAssetAction(editingItem.id, {
          title,
          category,
          imageUrl,
        });
        if (res.success && res.asset) {
          setGallery((prev) =>
            prev.map((g) => (g.id === editingItem.id ? res.asset : g))
          );
        }
      } else {
        const res = await addMediaAssetAction({
          title,
          category,
          imageUrl,
        });
        if (res.success && res.asset) {
          setGallery((prev) => [res.asset, ...prev]);
        }
      }
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const [archiveModalTarget, setArchiveModalTarget] = useState<MediaItem | null>(null);
  const [archiveRemark, setArchiveRemark] = useState('');

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModalTarget) return;
    setLoading(true);
    try {
      const res = await deleteMediaAssetAction(archiveModalTarget.id, archiveRemark);
      if (res.success) {
        setGallery((prev) =>
          prev.map((g) =>
            g.id === archiveModalTarget.id
              ? { ...g, status: 'archived', archiveRemark, archivedAt: new Date().toISOString() }
              : g
          )
        );
        setArchiveModalTarget(null);
        setArchiveRemark('');
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to archive media asset');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Restore this photo to published gallery?')) return;
    setLoading(true);
    try {
      const res = await deleteMediaAssetAction(id);
      if (res.success) {
        setGallery((prev) =>
          prev.map((g) => (g.id === id ? { ...g, status: 'published', archiveRemark: undefined } : g))
        );
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClick = (item: MediaItem) => {
    if (item.status === 'archived') {
      handleRestore(item.id);
    } else {
      setArchiveModalTarget(item);
      setArchiveRemark('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-0.5 rounded-full border border-[#BBD6EA]">
              Photo &amp; Media Vault
            </span>
            <span className="text-xs text-slate-300">&bull;</span>
            <span className="text-xs text-[#6B7280] font-medium">Real-Time Photo Control</span>
          </div>
          <h1 className="text-2xl font-serif text-[#24272B] mt-1">
            Media Library &amp; Asset Access Control
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Manage and organize official CUBE imagery. Upload new photos, archive obsolete assets, or update public gallery imagery across all pages in real-time.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold text-xs flex items-center space-x-2 shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Photo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search images by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:ring-2 focus:ring-[#BBD6EA] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                categoryFilter === cat
                  ? 'bg-[#EAF2F8] text-[#070E5C] border-[#BBD6EA] font-semibold'
                  : 'bg-[#F7F7F4] text-[#4A5568] border-[#E5E7EB] hover:bg-white'
              }`}
            >
              {cat === 'ALL' ? 'All Photos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Photo Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-[#E5E7EB] text-center text-[#6B7280] text-sm">
          No photo assets found. Click &quot;Add New Photo&quot; to upload your first image.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
            >
              <div className="relative h-48 w-full bg-[#F7F7F4] overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-[#070E5C] border border-[#BBD6EA]">
                  {item.category}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#24272B] line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#6B7280] font-mono truncate mt-1">
                    {item.imageUrl}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] transition text-xs"
                      title="Update image details or photo"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchiveClick(item)}
                      className={`p-1.5 rounded-lg border transition text-xs ${
                        item.status === 'archived'
                          ? 'bg-teal-50 hover:bg-teal-500 hover:text-white text-teal-600 border-teal-200'
                          : 'bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 border-amber-200'
                      }`}
                      title={item.status === 'archived' ? 'Restore to gallery' : 'Archive with Remark'}
                    >
                      {item.status === 'archived' ? (
                        <ArchiveRestore className="w-3.5 h-3.5" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#070E5C] hover:bg-[#EAF2F8] transition"
                    title="Open original image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Update Photo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-serif text-[#24272B]">
                {editingItem ? 'Update Photo Asset' : 'Add New Photo Asset'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Photo Title / Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Testing Facility Inspection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white"
                >
                  <option value="Projects">Projects</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Team">Team</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="General">General</option>
                </select>
              </div>

              <ImageUploadField
                label="Photo"
                required
                value={imageUrl}
                onChange={setImageUrl}
                onUploaded={handleUploaded}
                onUploadingChange={setUploading}
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] text-[#4A5568] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-5 py-2 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold transition shadow-2xs disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingItem ? 'Save Updates' : 'Add Photo Asset'}
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
                  <h3 className="text-sm font-bold text-slate-800">Archive Photo Asset</h3>
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
                <span className="font-semibold line-clamp-1">{archiveModalTarget.title}</span> will be safely preserved in media archives without data deletion.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Remark for Archiving <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Replaced with higher resolution event photography / event concluded."
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

