import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Section heading used across inner pages: small gold label, bold soft
 * headline, optional lead and an optional link on the right. Same look as the
 * home page sections.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  center = false,
  className = '',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  action?: { href: string; label: string };
  center?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`reveal flex flex-col gap-6 mb-10 lg:mb-14 ${
        center ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
      } ${className}`}
    >
      <div className={center ? 'max-w-2xl' : 'max-w-3xl'}>
        {eyebrow && <p className="label-mono">{eyebrow}</p>}
        <h2 className="headline-light text-3xl sm:text-4xl lg:text-[2.6rem] text-[#F3F5F6] mt-3">{title}</h2>
        {lead && <p className="mt-4 text-[19px] text-[#C2CCD1] leading-relaxed">{lead}</p>}
      </div>
      {/* fills the gap between the title and its link (wide screens) */}
      {!center && <span aria-hidden className="heading-rule hidden md:block flex-1 min-w-12 self-end mb-3 mx-2" />}
      {action && (
        <Link
          href={action.href}
          className="group self-start md:self-auto inline-flex items-center gap-2 text-[16px] font-bold text-[#F3F5F6] shrink-0 border-b-2 border-[#F6C22E] pb-1 hover:text-[#F6C22E] transition-colors"
        >
          {action.label}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
