import React from 'react';
import { Database, Globe } from 'lucide-react';
import { getCMSBackend } from '@/lib/db/backend';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdmin();
  // Reflects the backend actually in use (service-role key configured).
  const usesSupabase = getCMSBackend() === 'supabase';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold font-display text-[#24272B]">
          CMS &amp; Institutional Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          System environments, Supabase connection status, and security keys.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-[#24272B] flex items-center mb-3">
            <Database className="w-4 h-4 text-[#070E5C] mr-2" />
            <span>PostgreSQL &amp; Supabase Connection</span>
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Storage Mode:</span>
              <span className="font-bold text-slate-800">
                {usesSupabase
                  ? 'Supabase (PostgreSQL)'
                  : 'Local JSON file (data-store/cube_cms_store.json)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Database Access Control:</span>
              <span className={`font-bold ${usesSupabase ? 'text-emerald-700' : 'text-amber-700'}`}>
                {usesSupabase
                  ? 'Enabled (Row Level Security Active)'
                  : 'Not applicable (file store)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Public Cache Revalidation:</span>
              <span className="font-bold text-[#070E5C]">Instant On-Demand (Next.js Server Actions)</span>
            </div>
            {!usesSupabase && (
              <div className="pt-2 text-[11px] text-amber-700">
                Note: the local JSON store requires a persistent disk. Configure Supabase
                before deploying to a serverless/ephemeral environment.
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-[#24272B] flex items-center mb-3">
            <Globe className="w-4 h-4 text-blue-600 mr-2" />
            <span>Public Identity Sync</span>
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Organization:</span>
              <span className="font-bold text-slate-800">Centre for Urbanization, Buildings &amp; Environment</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Joint Initiative:</span>
              <span className="font-bold text-slate-800">IIT Madras &bull; Government of Tamil Nadu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

