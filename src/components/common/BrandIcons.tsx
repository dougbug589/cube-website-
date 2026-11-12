import React from 'react';

/**
 * Brand marks for social links (solid glyphs, drawn for a white-on-brand
 * circle). The icon library only has outline marks and the old Twitter
 * bird, so these are inline SVG. Paths adapted from Simple Icons (CC0).
 */

type IconProps = { size?: number; className?: string };

export function XIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden className={className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452z" />
    </svg>
  );
}

export function FacebookIcon({ size = 16, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden className={className}>
      <path d="M13.5 24V13.1h3.6l.55-4.25H13.5V6.14c0-1.23.34-2.07 2.11-2.07h2.25V.27A30.2 30.2 0 0 0 14.58.1c-3.25 0-5.47 1.98-5.47 5.62v3.13H5.44v4.25h3.67V24h4.39Z" />
    </svg>
  );
}
