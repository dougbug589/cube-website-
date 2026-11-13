import React from 'react';
import Image from 'next/image';

/**
 * Person card used for the board, the IIT advisory panel and the team.
 * Photo on top (square, framed on the face), then name, role and
 * organisation in legible sizes. People without a photo get a monogram
 * of their initials instead of a stock image.
 */

const initials = (name: string) =>
  name
    .replace(/^(prof|dr|mr|mrs|ms|thiru|tmt|er|major general|maj\.? gen\.?)\.?\s+/i, '')
    .split(/[\s.]+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

export function Monogram({ name, className = '' }: { name: string; className?: string }) {
  return (
    <div className={`grid place-items-center bg-gradient-to-br from-[#EEF2F4] to-[#DCE4E8] ${className}`}>
      <span className="font-display text-[34px] font-extrabold text-[#4B5A61]/80 tracking-wide">{initials(name) || '·'}</span>
    </div>
  );
}

export default function PersonCard({
  name,
  role,
  organization,
  image,
  compact = false,
}: {
  name: string;
  role?: string;
  organization?: string;
  image?: string;
  compact?: boolean;
}) {
  return (
    <article className="glass glass-interactive glass-edge rounded-[24px] overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square bg-[#DCE4E8]">
        {image ? (
          <Image src={image} alt={name} fill sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 17vw" className="object-cover object-[50%_20%]" />
        ) : (
          <Monogram name={name} className="absolute inset-0" />
        )}
      </div>
      <div className={compact ? 'p-4' : 'p-5'}>
        <h3 className="font-display text-[18px] lg:text-[19px] font-bold text-[#243239] leading-snug">{name}</h3>
        {role && <p className="mt-1 text-[15.5px] font-semibold text-[#9A7015] leading-snug">{role}</p>}
        {organization && <p className="mt-1 text-[17px] text-[#3B4B53] leading-snug">{organization}</p>}
      </div>
    </article>
  );
}
