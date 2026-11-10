import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { FileText, AlertCircle, Mail, Bell, ShieldCheck, Download, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tenders & Procurement | CUBE IIT Madras',
  description: 'Official procurement and tender notices for Centre for Urbanization, Buildings & Environment (CUBE).',
};

export default async function TendersPage() {
  const store = await getCMSStore();
  const activeTenders = (store.tenders || []).filter(
    (t: any) => t.status !== 'archived' && t.status !== 'Archive'
  );

  return (
    <div>
      <PageHeader
        badge="Official Procurement"
        title="Tenders &amp; Expressions of Interest"
        description="Public procurement notices, expressions of interest (EOI), and requests for proposals (RFP) for CUBE institutional operations."
        breadcrumbs={[{ label: 'Tenders' }]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTenders.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold font-display text-navy-950">
                    Active Procurement Notices ({activeTenders.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    IIT Madras &amp; Government of Tamil Nadu sanctioned EOIs and Tenders
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {activeTenders.map((tender: any) => (
                  <div
                    key={tender.id}
                    className="p-6 rounded-2xl bg-[#F7F7F4] border border-[#E5E7EB] hover:shadow-md transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA]">
                          REF: {tender.referenceNumber}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          {tender.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-[#070E5C]" />
                        <span>Closing: <strong className="text-slate-800">{tender.closingDate}</strong></span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#24272B] font-display">
                        {tender.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {tender.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Published: {tender.publishedDate || tender.createdAt?.split('T')[0] || 'Official CUBE Portal'}
                      </span>
                      {tender.documentUrl && tender.documentUrl !== '#' ? (
                        <a
                          href={tender.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-1.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BDD7E8] text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Tender Document</span>
                        </a>
                      ) : (
                        <a
                          href="mailto:contact@cubeiitm.org"
                          className="px-4 py-1.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Request Document via Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Verified Empty State Per Institutional Requirement */
            <div className="p-10 sm:p-14 rounded-3xl bg-slate-50 border border-slate-200 text-center shadow-sm">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-6">
                <FileText className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Procurement Notice
              </span>

              <h2 className="text-2xl font-bold font-display text-navy-950 mt-2">
                No Active Tenders Currently Published
              </h2>

              <p className="mt-3 text-xs sm:sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                There are currently no active public tenders or Expressions of Interest (EOI) open for submission. All future procurement notifications, equipment acquisition tenders, and consulting invitations will be published here in compliance with official Government of Tamil Nadu and IIT Madras procurement guidelines.
              </p>

              <div className="mt-8 pt-8 border-t border-slate-200 max-w-md mx-auto text-xs text-slate-500 space-y-3">
                <div className="flex items-center justify-center space-x-2 text-teal-700 font-semibold">
                  <Bell className="w-4 h-4" />
                  <span>Procurement Notifications:</span>
                </div>
                <p>
                  Vendors and suppliers may direct procurement queries to{' '}
                  <a href="mailto:contact@cubeiitm.org" className="text-teal-700 font-semibold hover:underline">
                    contact@cubeiitm.org
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
