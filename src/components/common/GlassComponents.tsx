'use client';

import React from 'react';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'subtle' | 'card' | 'elevated' | 'island';
  borderGlow?: boolean;
}

export function GlassCard({
  children,
  className = '',
  variant = 'card',
  borderGlow = false,
  ...props
}: GlassProps) {
  let baseStyles = '';

  switch (variant) {
    case 'subtle':
      baseStyles = 'bg-white/60 backdrop-blur-md border border-white/70 shadow-[0_4px_24px_rgba(7,14,92,0.04)]';
      break;
    case 'elevated':
      baseStyles = 'bg-white/85 backdrop-blur-2xl border border-white/90 shadow-[0_20px_50px_rgba(7,14,92,0.08),0_1px_3px_rgba(0,0,0,0.04)]';
      break;
    case 'island':
      baseStyles = 'bg-[#181A20]/90 text-white backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.35)]';
      break;
    case 'card':
    default:
      baseStyles = 'bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_12px_40px_rgba(7,14,92,0.05),0_1px_2px_rgba(0,0,0,0.03)]';
      break;
  }

  return (
    <div
      className={`rounded-3xl transition-all duration-300 relative overflow-hidden ${baseStyles} ${
        borderGlow ? 'before:absolute before:inset-0 before:rounded-3xl before:p-[1px] before:bg-gradient-to-b before:from-white/80 before:to-transparent before:pointer-events-none' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassButton({
  children,
  className = '',
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'glass' | 'gold' }) {
  let btnStyles = '';

  if (variant === 'gold') {
    btnStyles = 'bg-[#C4921B] hover:bg-[#C77B60] text-white shadow-[0_4px_20px_rgba(217,154,66,0.3)] hover:shadow-[0_6px_25px_rgba(217,154,66,0.4)]';
  } else if (variant === 'primary') {
    btnStyles = 'bg-[#2B3B44] hover:bg-[#0A1682] text-white shadow-[0_4px_20px_rgba(7,14,92,0.2)] hover:shadow-[0_8px_30px_rgba(7,14,92,0.3)]';
  } else {
    btnStyles = 'bg-white/70 hover:bg-white/95 text-[#24272B] hover:text-[#2B3B44] backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)]';
  }

  return (
    <button
      className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${btnStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

