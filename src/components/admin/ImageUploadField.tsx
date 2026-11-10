'use client';

import React, { useId, useRef, useState } from 'react';
import { ImageIcon, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,image/avif';

interface ImageUploadFieldProps {
  label: string;
  /** Current image path (e.g. /uploads/123_photo.jpg or /images/...). */
  value: string;
  onChange: (url: string) => void;
  /** Called after a successful upload with the chosen file (e.g. to auto-fill a title). */
  onUploaded?: (file: File, url: string) => void;
  /** Show a "Delete" button for the current image (default true). */
  allowRemove?: boolean;
  required?: boolean;
  hint?: string;
  /** Preview box height, Tailwind class. */
  previewClassName?: string;
  labelClassName?: string;
  /** Lets the parent form disable its Save button while uploading. */
  onUploadingChange?: (uploading: boolean) => void;
}

/**
 * Upload-only image picker used across the admin panel. Images are chosen
 * from the computer and stored through /api/admin/upload (local disk or
 * Supabase Storage); admins no longer type image paths/URLs by hand.
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  onUploaded,
  allowRemove = true,
  required = false,
  hint = 'JPG, PNG, WEBP, GIF or AVIF — up to 10 MB.',
  previewClassName = 'h-40',
  labelClassName = 'block text-slate-700 font-semibold mb-1',
  onUploadingChange,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploadingState] = useState(false);
  const setUploading = (v: boolean) => {
    setUploadingState(v);
    onUploadingChange?.(v);
  };
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    setError(null);
    if (file.size > MAX_BYTES) {
      setError(`This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Please choose an image under 10 MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.url) {
        setBroken(false);
        onChange(data.url);
        onUploaded?.(file, data.url);
      } else {
        setError(data.error || 'Upload failed. Please try again.');
      }
    } catch (err: any) {
      setError(`Upload failed: ${err?.message || 'network error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className={labelClassName}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 space-y-2.5">
        {/* Preview */}
        <div
          className={`relative w-full ${previewClassName} rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center`}
        >
          {value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={`${label} preview`}
              className="w-full h-full object-cover"
              onError={() => setBroken(true)}
              onLoad={() => setBroken(false)}
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400 text-[11px]">
              <ImageIcon className="w-7 h-7 mb-1" />
              {value ? 'Image could not be loaded — please upload it again.' : 'No image uploaded yet'}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[#070E5C] text-xs font-semibold gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            onChange={handleFile}
            disabled={uploading}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-3.5 py-2 rounded-lg bg-[#070E5C] hover:bg-[#D99A42] text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {value ? <RefreshCw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
            {value ? 'Replace image' : 'Upload image'}
          </button>
          {allowRemove && value && !uploading && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setBroken(false);
                setError(null);
              }}
              className="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
          <span className="text-[10px] text-slate-500">{hint}</span>
        </div>

        {!value && required && (
          <p className="text-[11px] text-amber-700">An image is required — upload one before saving.</p>
        )}

        {error && (
          <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">{error}</p>
        )}
      </div>
    </div>
  );
}
