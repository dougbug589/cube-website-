'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { loginAdminAction } from '@/app/admin/actions/auth';
import FloatingCubeBackground from '@/components/admin/FloatingCubeBackground';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Opened over plain http from another device (not localhost): warn instead
  // of letting a failed sign-in look like nothing happened.
  const [insecureConnection, setInsecureConnection] = useState(false);
  useEffect(() => {
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    setInsecureConnection(window.location.protocol === 'http:' && !local);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdminAction(formData);

    if (result.success) {
      const redirectParam = new URLSearchParams(window.location.search).get('redirect');
      const destination =
        redirectParam && redirectParam.startsWith('/admin') && !redirectParam.startsWith('/admin/login')
          ? redirectParam
          : '/admin/dashboard';
      router.push(destination);
      router.refresh();
    } else {
      setError(result.error || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col justify-center items-center px-4 relative select-none overflow-hidden">
      {/* 3D Floating CUBE Background */}
      <FloatingCubeBackground />

      <div className="max-w-md w-full relative z-10">
        
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="relative h-14 w-64 mx-auto mb-3">
            <Image
              src="/images/branding/cube-clean-transparent.png"
              alt="CUBE Institutional Emblem"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-serif text-[#24272B] tracking-tight">
            Institutional CMS Control Panel
          </h1>
          <p className="text-xs text-[#6B7280] mt-1.5 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#070E5C] mr-1" />
            Centre of Excellence | IIT Madras &amp; Govt of Tamil Nadu
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-serif text-[#24272B]">Administrator Sign In</h2>
            <p className="text-xs text-[#6B7280] mt-1">
              Authorized personnel only. Sign-ins and content changes are recorded in the audit log.
            </p>
          </div>

          {insecureConnection && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                This connection is not secure (http). That is fine for testing on your local
                network, but the live website must be served over HTTPS.
              </span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue="admin@cubeiitm.org"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#24272B] text-sm focus:outline-none focus:ring-2 focus:ring-[#BBD6EA] transition"
                  placeholder="admin@cubeiitm.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] text-[#24272B] text-sm focus:outline-none focus:ring-2 focus:ring-[#BBD6EA] transition"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-full text-xs font-semibold text-[#070E5C] hover:text-white bg-[#EAF2F8] hover:bg-[#D99A42] border border-[#BBD6EA] transition-all flex items-center justify-center space-x-2 shadow-2xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate &amp; Open Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E5E7EB] text-center text-[11px] text-[#6B7280]">
            Protected by signed sessions, rate-limited sign-in &amp; audit logging
          </div>
        </div>

      </div>
    </div>
  );
}
