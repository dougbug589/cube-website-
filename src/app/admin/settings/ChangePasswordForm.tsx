'use client';

import React, { useState } from 'react';
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { changePasswordAction } from '@/app/admin/actions/auth';

export default function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setResult(null);
    try {
      const res = await changePasswordAction(new FormData(form));
      if (res.success) {
        form.reset();
        setResult({ ok: true, message: 'Password changed. All other devices have been signed out.' });
      } else {
        setResult({ ok: false, message: res.error || 'Could not change the password.' });
      }
    } catch {
      setResult({ ok: false, message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#BBD6EA] focus:border-[#5B9BD5]';

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <label className="block text-xs font-semibold text-slate-600">
        Current password
        <input name="currentPassword" type="password" autoComplete="current-password" required className={`${inputClass} mt-1`} />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        New password <span className="font-normal text-slate-400">(at least 12 characters)</span>
        <input name="newPassword" type="password" autoComplete="new-password" minLength={12} required className={`${inputClass} mt-1`} />
      </label>
      <label className="block text-xs font-semibold text-slate-600">
        Confirm new password
        <input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} required className={`${inputClass} mt-1`} />
      </label>

      {result && (
        <div
          role="status"
          className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
            result.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{result.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 rounded-full bg-[#070E5C] hover:bg-[#D99A42] text-white text-xs font-semibold flex items-center gap-2 transition disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
        <span>{loading ? 'Changing…' : 'Change password'}</span>
      </button>
    </form>
  );
}
