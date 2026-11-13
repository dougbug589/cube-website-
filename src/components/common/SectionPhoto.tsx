import React from 'react';
import Image from 'next/image';

/**
 * A photo behind a whole section. It fades out at the top and bottom (mask),
 * so it melts into the page gradient with no seam, and sits under a dark
 * wash so text and glass cards on top stay readable. Its own wrapper clips
 * the image, so the section itself needs no overflow-hidden (sticky children
 * keep working). Put it first inside a `relative` section and give the
 * content after it `relative`.
 */
export default function SectionPhoto({
  src,
  wash = 'bg-[#0B0D0E]/55',
  position = 'object-center',
}: {
  src: string;
  /** Tailwind classes for the dark overlay (solid or gradient) */
  wash?: string;
  position?: string;
}) {
  const mask = 'linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)';
  return (
    <div aria-hidden data-section-photo className="absolute inset-0 overflow-hidden pointer-events-none" style={{ WebkitMaskImage: mask, maskImage: mask }}>
      <Image src={src} alt="" fill sizes="100vw" quality={75} className={`object-cover ${position} scale-[1.04] blur-[2px]`} />
      <div className={`absolute inset-0 ${wash}`} />
      {/* left margin, where the section guide sits on very wide screens */}
      <div className="absolute inset-y-0 left-0 w-[230px] bg-gradient-to-r from-[#0B0D0E] via-[#0B0D0E]/80 to-transparent hidden min-[1900px]:block" />
    </div>
  );
}
