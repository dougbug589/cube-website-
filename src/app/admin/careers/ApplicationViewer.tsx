'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Mail, Phone, Download, ExternalLink, FileText, Briefcase, Clock, Calendar, Layers,
} from 'lucide-react';

/** Full-detail view of one job application, with an in-page CV preview. */
export default function ApplicationViewer({ app, onClose }: { app: any | null; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setPreviewFailed(false), [app?.id]);

  useEffect(() => {
    if (!app) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [app, onClose]);

  if (!mounted || !app) return null;

  const resumeUrl: string = app.resumeUrl || '';
  const ext = resumeUrl.split('?')[0].split('.').pop()?.toLowerCase() || '';
  const isPdf = ext === 'pdf';
  const viewUrl = isPdf ? `${resumeUrl}?view=1` : '';
  const applied = app.appliedAt ? new Date(app.appliedAt) : null;

  const detail = (icon: React.ReactNode, label: string, value: React.ReactNode) => (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
      <span className="mt-0.5 text-[#070E5C]">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-xs font-semibold text-slate-800 break-words">{value}</div>
      </div>
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-viewer-title"
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="application-viewer-title" className="text-lg font-bold text-[#24272B]">
                {app.fullName}
              </h2>
              {app.domain && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]">
                  {app.domain}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Applied for <strong className="text-slate-700">{app.jobTitle || 'Talent Pool'}</strong>
              {applied && <> &bull; {applied.toLocaleString()}</>}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close application"
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-[320px_1fr]">
          {/* Applicant details */}
          <div className="p-5 space-y-3 border-b lg:border-b-0 lg:border-r border-slate-100">
            {detail(<Mail className="w-3.5 h-3.5" />, 'Email',
              <a href={`mailto:${app.email}`} className="text-teal-700 hover:underline">{app.email}</a>)}
            {detail(<Phone className="w-3.5 h-3.5" />, 'Phone',
              app.phone ? <a href={`tel:${app.phone}`} className="hover:underline">{app.phone}</a> : 'Not provided')}
            {detail(<Clock className="w-3.5 h-3.5" />, 'Experience', app.experience || 'Not specified')}
            {detail(<Layers className="w-3.5 h-3.5" />, 'Engineering domain', app.domain || 'Not specified')}
            {detail(<Briefcase className="w-3.5 h-3.5" />, 'Position', app.jobTitle || 'Talent Pool')}
            {detail(<Calendar className="w-3.5 h-3.5" />, 'Applied on', applied ? applied.toLocaleString() : '—')}

            <div className="pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Cover note</div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                {app.coverLetter || <span className="italic text-slate-400">No cover note provided.</span>}
              </p>
            </div>
          </div>

          {/* CV preview */}
          <div className="p-5 flex flex-col min-h-[60vh] bg-slate-50/40">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Curriculum vitae</div>
            {!resumeUrl ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-500 rounded-2xl border-2 border-dashed border-slate-200 p-8">
                <FileText className="w-10 h-10 text-slate-300 mb-2" />
                No CV was attached to this application.
              </div>
            ) : isPdf && !previewFailed ? (
              <iframe
                src={viewUrl}
                title={`CV of ${app.fullName}`}
                onError={() => setPreviewFailed(true)}
                className="flex-1 w-full min-h-[60vh] rounded-2xl border border-slate-200 bg-white"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-500 rounded-2xl border-2 border-dashed border-slate-200 p-8">
                <FileText className="w-10 h-10 text-[#D99A42] mb-2" />
                <p className="font-semibold text-slate-700">
                  {ext ? `${ext.toUpperCase()} file` : 'This file'} can&apos;t be previewed in the browser.
                </p>
                <p className="mt-1">Download it to open in Word or another document viewer.</p>
                <a
                  href={resumeUrl}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#070E5C] hover:bg-[#D99A42] text-white font-bold flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download CV
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
          <a
            href={`mailto:${app.email}?subject=${encodeURIComponent(`Your application: ${app.jobTitle || 'CUBE'}`)}`}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" /> Email candidate
          </a>
          {isPdf && (
            <a
              href={viewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
            </a>
          )}
          {resumeUrl && (
            <a
              href={resumeUrl}
              className="px-3.5 py-2 rounded-lg bg-[#EAF2F8] text-[#070E5C] hover:bg-[#D99A42] hover:text-white border border-[#BDD7E8] font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download CV
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
