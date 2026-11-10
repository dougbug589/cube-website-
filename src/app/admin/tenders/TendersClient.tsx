'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, Plus, Download, Calendar, 
  Archive, ArchiveRestore, X, CheckCircle2, RefreshCw, Edit3, Loader2 
} from 'lucide-react';
import { 
  createTenderAction, 
  updateTenderAction, 
  deleteTenderAction 
} from '@/app/admin/actions/cms';
import { useRouter } from 'next/navigation';

interface Tender {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  documentUrl?: string;
  publishedDate?: string;
  closingDate: string;
  status: string;
  archiveRemark?: string;
  archivedAt?: string;
}

interface TendersClientProps {
  initialTenders: Tender[];
}

export default function TendersClient({ initialTenders }: TendersClientProps) {
  const router = useRouter();
  const [tenders, setTenders] = useState<Tender[]>(initialTenders);
  useEffect(() => { setTenders(initialTenders); }, [initialTenders]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTender, setEditingTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [referenceNumber, setReferenceNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [status, setStatus] = useState('Active');

  // Archive Remark Modal State
  const [archiveModalTarget, setArchiveModalTarget] = useState<Tender | null>(null);
  const [archiveRemark, setArchiveRemark] = useState('');

  const openAddModal = () => {
    setEditingTender(null);
    setReferenceNumber(`CUBE/PROC/2026/${Math.floor(100 + Math.random() * 900)}`);
    setTitle('');
    setDescription('');
    setDocumentUrl('');
    setClosingDate('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (tender: Tender) => {
    setEditingTender(tender);
    setReferenceNumber(tender.referenceNumber || '');
    setTitle(tender.title || '');
    setDescription(tender.description || '');
    setDocumentUrl(tender.documentUrl || '');
    setClosingDate(tender.closingDate || '');
    setStatus(tender.status || 'Active');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber || !title || !closingDate) {
      alert('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      if (editingTender) {
        const res = await updateTenderAction(editingTender.id, {
          referenceNumber,
          title,
          description,
          documentUrl: documentUrl || '#',
          closingDate,
          status,
        });

        if (res.success && res.tender) {
          setTenders(
            tenders.map((t) => (t.id === editingTender.id ? { ...t, ...res.tender } : t))
          );
          setIsModalOpen(false);
          router.refresh();
        } else {
          alert(res.error || 'Failed to update tender');
        }
      } else {
        const res = await createTenderAction({
          referenceNumber,
          title,
          description,
          documentUrl: documentUrl || '#',
          closingDate,
          status,
        });

        if (res.success && res.tender) {
          setTenders([res.tender, ...tenders]);
          setIsModalOpen(false);
          router.refresh();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModalTarget) return;
    setLoading(true);
    try {
      const res = await deleteTenderAction(archiveModalTarget.id, archiveRemark);
      if (res.success) {
        setTenders(
          tenders.map((t) =>
            t.id === archiveModalTarget.id
              ? { ...t, status: 'Archive', archiveRemark, archivedAt: new Date().toISOString() }
              : t
          )
        );
        setArchiveModalTarget(null);
        setArchiveRemark('');
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to archive tender');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Restore this tender notice to active status?')) return;
    setLoading(true);
    try {
      const res = await deleteTenderAction(id);
      if (res.success) {
        setTenders(
          tenders.map((t) => (t.id === id ? { ...t, status: 'Active', archiveRemark: undefined } : t))
        );
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClick = (tender: Tender) => {
    if (tender.status === 'Archive' || tender.status === 'archived') {
      handleRestore(tender.id);
    } else {
      setArchiveModalTarget(tender);
      setArchiveRemark('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-0.5 rounded border border-[#BBD6EA]">
              Procurement Desk
            </span>
            <span className="text-xs text-slate-300">&bull;</span>
            <span className="text-xs text-[#6B7280] font-medium">IIT Madras &amp; Govt of TN Standards</span>
          </div>
          <h1 className="text-2xl font-serif text-[#24272B] mt-1">
            Tenders &amp; Procurement Notices
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold text-xs flex items-center space-x-2 shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Tender / EOI</span>
        </button>
      </div>

      {/* Tenders Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4A5568]">
            <thead className="bg-[#EAF2F8]/50 text-[11px] uppercase tracking-wider text-[#070E5C] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Ref Number</th>
                <th className="py-3.5 px-4 font-bold">Tender Details</th>
                <th className="py-3.5 px-4 font-bold">Closing Date</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-medium">
              {tenders.map((tender) => {
                const isArchived = tender.status === 'Archive' || tender.status === 'archived';
                return (
                  <tr key={tender.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#070E5C] whitespace-nowrap">
                      {tender.referenceNumber}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-serif font-bold text-[#24272B]">{tender.title}</div>
                      <div className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">{tender.description}</div>
                      {tender.archiveRemark && ['archived', 'Archive'].includes(tender.status) && (
                        <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                          Archive Remark: {tender.archiveRemark}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B7280] whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-[#070E5C]" />
                        <span>{tender.closingDate}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isArchived 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {isArchived ? 'Archived' : tender.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(tender)}
                        className="p-1.5 rounded-lg text-[#070E5C] hover:bg-[#EAF2F8] transition inline-block"
                        title="Edit Tender Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Document link */}
                      {tender.documentUrl && (
                        <a
                          href={tender.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#070E5C] hover:bg-slate-50 transition inline-block"
                          title="Download Tender Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Archive Button */}
                      <button
                        onClick={() => handleArchiveClick(tender)}
                        className={`p-1.5 rounded-lg transition inline-block ${
                          isArchived
                            ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                            : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                        title={isArchived ? 'Restore Tender' : 'Archive with Remark'}
                      >
                        {isArchived ? (
                          <ArchiveRestore className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
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

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-serif text-[#24272B]">
                  {editingTender ? 'Edit Tender Notice' : 'Publish New Tender / Notice'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronizes with public procurement page in real time.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Ref Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] font-mono text-xs focus:ring-2 focus:ring-[#BBD6EA] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Closing Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tender Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supply and Installation of High Precision ICP-MS Spectrometer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Scope &amp; Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Technical scope, eligibility criteria, and submission instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tender Document URL or File Path
                </label>
                <input
                  type="text"
                  placeholder="/documents/tenders/... or https://..."
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] font-mono text-[11px] focus:ring-2 focus:ring-[#BBD6EA] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] text-[#4A5568] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTender ? 'Update Tender' : 'Publish Notice'}</span>
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
                  <h3 className="text-sm font-bold text-slate-800">Archive Tender Notice</h3>
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
                <span className="font-semibold line-clamp-1">{archiveModalTarget.title}</span> will be safely removed from active procurement listings.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Remark for Archiving <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Tender bid closing period elapsed / Contract successfully awarded."
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
