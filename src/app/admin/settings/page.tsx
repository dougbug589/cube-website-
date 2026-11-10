import React from 'react';
import { Database, Globe, KeyRound } from 'lucide-react';
import { getCMSBackend, STORAGE_BUCKETS } from '@/lib/db/backend';
import { requireAdmin } from '@/lib/auth-guard';
import ChangePasswordForm from './ChangePasswordForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  // Reflects the backend actually in use (service-role key configured).
  const usesSupabase = getCMSBackend() === 'supabase';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold font-display text-[#24272B]">
          CMS &amp; Institutional Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your account security, where the site&apos;s data is stored, and hosting requirements.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-[#24272B] flex items-center mb-3">
            <KeyRound className="w-4 h-4 text-[#070E5C] mr-2" />
            <span>Change Your Password</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Signed in as <span className="font-semibold text-slate-700">{admin.email}</span>.
            Changing the password signs out every other device.
          </p>
          <ChangePasswordForm />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-[#24272B] flex items-center mb-3">
            <Database className="w-4 h-4 text-[#070E5C] mr-2" />
            <span>Data Storage</span>
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Content &amp; admin data:</span>
              <span className="font-bold text-slate-800 text-right">
                {usesSupabase
                  ? 'Supabase PostgreSQL (table cms_store)'
                  : 'JSON file on this server (data-store/cube_cms_store.json)'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Uploaded images / CVs:</span>
              <span className="font-bold text-slate-800 text-right">
                {usesSupabase
                  ? `Supabase Storage (${STORAGE_BUCKETS.uploads}, ${STORAGE_BUCKETS.resumes})`
                  : 'public/uploads/ • data-store/resumes/'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Database access control:</span>
              <span className={`font-bold text-right ${usesSupabase ? 'text-emerald-700' : 'text-slate-800'}`}>
                {usesSupabase
                  ? 'Row Level Security on, no public access (server key only)'
                  : 'Not applicable (file store)'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Public website updates:</span>
              <span className="font-bold text-[#070E5C] text-right">
                Live (within {usesSupabase ? '~3 seconds' : '~1 second'} of saving)
              </span>
            </div>
            <div className="pt-2 text-[11px] text-amber-700 leading-relaxed">
              {usesSupabase ? (
                <>
                  Hosting: works on serverless hosts (e.g. Vercel) and multiple servers. Keep
                  Supabase backups enabled for your project; nothing is deleted from the admin
                  (items are archived).
                </>
              ) : (
                <>
                  Hosting requirement: run on a server with a persistent disk (VPS / VM), not a
                  serverless host, and back up the <code>data-store/</code> and{' '}
                  <code>public/uploads/</code> folders regularly, or configure Supabase (see
                  <code> .env.example</code>). Nothing is deleted from the admin (items are
                  archived), but the disk itself is the only copy of the data.
                </>
              )}
            </div>
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
