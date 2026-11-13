'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  badge: string;
  title: string;
  description: string;
  breadcrumbs: { label: string; href?: string }[];
  backHref?: string;
}

/**
 * Inner-page header, slate glass v2.
 * Quiet: mono eyebrow, light display headline, one hairline. No cards, no badges.
 */
export default function PageHeader({ badge, title, description, breadcrumbs, backHref }: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    const cameFromThisSite =
      typeof document !== 'undefined' &&
      document.referrer.startsWith(window.location.origin) &&
      window.history.length > 1;
    if (cameFromThisSite) {
      router.back();
      return;
    }
    const parent = [...(breadcrumbs || [])].reverse().find((crumb) => crumb.href)?.href;
    router.push(parent || '/');
  };

  return (
    <header className="relative pt-32 sm:pt-36 xl:pt-40 pb-12 sm:pb-16 overflow-hidden">
      {/* faint constellation + soft gold wash, both static */}
      <div aria-hidden className="absolute inset-0 constellation opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div aria-hidden className="absolute -top-40 right-0 w-[520px] h-[520px] rounded-full bg-[#F6C22E]/10 blur-[120px] pointer-events-none" />

      <div className="relative shell w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <button
            type="button"
            onClick={handleBack}
            className="press inline-flex items-center gap-2 h-9 px-3.5 rounded-full glass glass-blur text-[16px] text-[#C2CCD1] hover:text-[#F3F5F6] hover:border-[#F6C22E]/40 transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            Back
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[15px] text-[#8E9AA0]">
            <Link href="/" className="hover:text-[#F3F5F6] transition-colors">Home</Link>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={`${crumb.label}-${i}`}>
                <ChevronRight size={12} strokeWidth={1.5} className="opacity-60" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#F3F5F6] transition-colors">{crumb.label}</Link>
                ) : (
                  <span className="text-[#C2CCD1]" aria-current="page">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="max-w-4xl reveal-stagger revealed">
          <p className="label-mono">{badge}</p>
          {/* long official titles (project pages) step down so they stay readable */}
          <h1
            className={`headline-light text-[#F3F5F6] mt-3 ${
              title.length > 90
                ? 'text-[1.75rem] sm:text-3xl lg:text-[2.4rem] leading-tight'
                : title.length > 50
                  ? 'text-3xl sm:text-4xl lg:text-[2.9rem]'
                  : 'text-4xl sm:text-5xl lg:text-[3.5rem]'
            }`}
          >
            {title}
          </h1>
          <p className="mt-5 text-[19.5px] sm:text-[19px] text-[#DDE3E6] leading-relaxed max-w-3xl">{description}</p>
        </div>
      </div>

      <div aria-hidden className="absolute bottom-0 inset-x-0 hairline" />
    </header>
  );
}
