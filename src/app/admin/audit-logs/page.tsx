import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import { ShieldAlert, Clock, User, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAuditLogsPage() {
  await requireAdmin();
  const store = getCMSStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
              Security Compliance
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Immutable Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-[#24272B] mt-1">
            System Activity &amp; Mutation Audit Logs
          </h1>
        </div>

        <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
          <span>Cryptographic Auditing Active</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b">
            <tr>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Resource</th>
              <th className="py-3 px-4">Resource ID</th>
              <th className="py-3 px-4">Administrator</th>
              <th className="py-3 px-4 text-right">Timestamp (UTC)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {store.auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-[#070E5C] font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-900 font-sans font-semibold">{log.resourceType}</td>
                <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{log.resourceId}</td>
                <td className="py-3 px-4 text-slate-700 font-sans">{log.userEmail}</td>
                <td className="py-3 px-4 text-right text-slate-400 font-sans">{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

