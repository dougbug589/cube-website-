'use client';

import React from 'react';

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'nav' | 'card' | 'panel' | 'modal' | 'pill' | 'subtle';
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({
  variant = 'panel',
  interactive = false,
  children,
  className = '',
  ...props
}: GlassProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'nav':
        return 'bg-[#33454E]/75 backdrop-blur-[28px] saturate-[150%] border border-[#B9C5CA]/25 shadow-[0_8px_32px_rgba(15,25,32,0.5),inset_0_1px_1px_rgba(242, 245, 246,0.1)]';
      case 'card':
        return 'bg-gradient-to-br from-[#3A4C56]/95 via-[#33454E]/90 to-[#243239]/90 backdrop-blur-[24px] saturate-[150%] border border-[#B9C5CA]/20 shadow-[0_12px_36px_rgba(15,25,32,0.55),inset_0_1px_1.5px_rgba(242, 245, 246,0.1)] rounded-3xl';
      case 'modal':
        return 'bg-[#33454E]/95 backdrop-blur-[32px] saturate-[160%] border border-[#B9C5CA]/30 shadow-[0_24px_64px_rgba(15,25,32,0.65),inset_0_1px_2px_rgba(242, 245, 246,0.12)] rounded-3xl';
      case 'pill':
        return 'bg-[#33454E]/80 backdrop-blur-[20px] saturate-[150%] border border-[#B9C5CA]/25 shadow-[0_4px_16px_rgba(15,25,32,0.45),inset_0_1px_1px_rgba(242, 245, 246,0.08)] rounded-full';
      case 'subtle':
        return 'bg-[#33454E]/50 backdrop-blur-[16px] border border-[#B9C5CA]/15 shadow-[0_4px_20px_rgba(15,25,32,0.4)] rounded-2xl';
      case 'panel':
      default:
        return 'bg-[#33454E]/80 backdrop-blur-[24px] saturate-[150%] border border-[#B9C5CA]/20 shadow-[0_16px_40px_rgba(15,25,32,0.5),inset_0_1px_1.5px_rgba(242, 245, 246,0.08)] rounded-3xl';
    }
  };

  const interactiveStyles = interactive
    ? 'transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,25,32,0.6)] hover:border-[#C4921B]/45 active:scale-[0.99]'
    : '';

  return (
    <div
      className={`relative overflow-hidden ${getVariantStyles()} ${interactiveStyles} ${className}`}
      {...props}
    >
      {/* Gold Specular Edge Highlight Sheen */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4921B]/50 to-transparent opacity-80 pointer-events-none" />
      {children}
    </div>
  );
}

export function GlassButton({
  children,
  variant = 'solid',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline' | 'pill' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-xs sm:text-sm',
    lg: 'px-7 py-3.5 text-sm sm:text-base font-medium',
  }[size];

  const variantStyles = {
    solid:
      'bg-[#F0C468] text-[#2B3B44] border border-[#C4921B] hover:bg-[#E9B215] hover:shadow-[0_6px_20px_rgba(196,146,27,0.35)] hover:border-[#E9B215]',
    outline:
      'bg-transparent text-[#B9C5CA] border border-[#B9C5CA]/30 hover:bg-[#33454E]/80 hover:text-[#F2F5F6] hover:border-[#C4921B]/50',
    pill:
      'bg-[#33454E]/85 text-[#E9B215] border border-[#C4921B]/35 hover:bg-[#F6DA86] hover:text-[#2B3B44] hover:border-transparent',
    ghost:
      'bg-transparent text-[#8C9AA0] hover:text-[#F2F5F6] hover:bg-white/[0.06] border border-transparent',
  }[variant];

  return (
    <button
      className={`relative inline-flex items-center justify-center font-medium rounded-full backdrop-blur-xl shadow-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] select-none ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GlassStat({
  label,
  value,
  subtext,
  icon: Icon,
  className = '',
}: {
  label: string;
  value: string;
  subtext?: string;
  icon?: any;
  className?: string;
}) {
  return (
    <GlassPanel variant="card" interactive className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13.5px] uppercase tracking-widest text-[#8C9AA0] font-bold">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-[#E9B215]" />}
      </div>
      <div className="font-display text-3xl sm:text-4xl font-semibold text-[#F2F5F6] tracking-tight">
        {value}
      </div>
      {subtext && (
        <p className="text-xs text-[#8C9AA0] mt-1.5 leading-relaxed">
          {subtext}
        </p>
      )}
    </GlassPanel>
  );
}

