'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { XIcon, LinkedInIcon, FacebookIcon } from '@/components/common/BrandIcons';
import { contactInfo } from '@/data/contact';
import { verticals } from '@/data/verticals';

/**
 * Footer — light-brown band that closes the warm canvas.
 * Four columns (identity, verticals, the Centre, office) and a quiet legal row.
 */

const CENTRE_LINKS = [
  { label: 'About CUBE', href: '/about' },
  { label: 'Vision & Mission', href: '/about/vision-mission' },
  { label: 'Board Members', href: '/about/board-members' },
  { label: 'IIT Advisory Panel', href: '/about/advisory-panel' },
  { label: 'Our Team', href: '/about/team' },
  { label: 'Our Clients', href: '/about/clients' },
];

// CUBE's real profiles (same as the original site), from the contact data
// Brand colours: LinkedIn blue, X black, Facebook blue (white marks on top).
export const SOCIAL = [
  { label: 'CUBE on LinkedIn', href: contactInfo.socialLinks.linkedin, Icon: LinkedInIcon, bg: '#0A66C2', glow: 'rgba(10,102,194,0.45)' },
  { label: 'CUBE on X', href: contactInfo.socialLinks.x, Icon: XIcon, bg: '#0F1419', glow: 'rgba(15,20,25,0.4)' },
  { label: 'CUBE on Facebook', href: contactInfo.socialLinks.facebook, Icon: FacebookIcon, bg: '#1877F2', glow: 'rgba(24,119,242,0.45)' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 text-[#3B4B53]">
      <div aria-hidden className="absolute inset-0 bg-[#EEF2F4]" />
      <div aria-hidden className="absolute top-0 inset-x-0 hairline" />

      <div className="relative shell pt-16 lg:pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Identity */}
          <div className="lg:col-span-4">
            {/* logo on its own (no white chip), large enough to read the emblems */}
            <Link href="/" className="inline-flex items-center gap-4" aria-label="CUBE home">
              <Image
                src="/images/branding/cube-live-logo.png"
                alt=""
                width={234}
                height={96}
                sizes="234px"
                quality={90}
                className="h-20 sm:h-24 w-auto object-contain"
              />
              <span aria-hidden className="hidden sm:block h-14 w-px bg-[#33454E]/15" />
              <span className="hidden sm:flex flex-col leading-none whitespace-nowrap">
                <span className="font-display text-[24px] font-extrabold tracking-[0.08em] text-[#243239]">CUBE</span>
                <span className="mt-1.5 text-[12.5px] font-bold uppercase tracking-[0.14em] text-[#3B4B53]">Centre of Excellence</span>
              </span>
            </Link>
            <p className="mt-5 text-[16.5px] leading-relaxed max-w-sm">
              Centre for Urbanization, Buildings &amp; Environment. A Centre of Excellence of the Government of Tamil Nadu and IIT Madras.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL.map(({ label, href, Icon, bg, glow }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  style={{ backgroundColor: bg, ['--glow' as string]: glow } as React.CSSProperties}
                  className="social-chip press jiggle grid place-items-center w-11 h-11 rounded-full text-white"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Verticals */}
          <nav aria-label="Verticals" className="lg:col-span-3">
            <p className="label-mono">Verticals</p>
            <ul className="mt-4 space-y-2.5 text-[16.5px]">
              {verticals.map((v) => (
                <li key={v.slug}>
                  <Link href={`/verticals/${v.slug}`} className="hover:text-[#243239] transition-colors">
                    {v.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cel" className="hover:text-[#243239] transition-colors">CEL laboratory</Link>
              </li>
            </ul>
          </nav>

          {/* The Centre */}
          <nav aria-label="The Centre" className="lg:col-span-2">
            <p className="label-mono">The Centre</p>
            <ul className="mt-4 space-y-2.5 text-[16.5px]">
              {CENTRE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-[#243239] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Office */}
          <div className="lg:col-span-3">
            <p className="label-mono">Office</p>
            <ul className="mt-4 space-y-3.5 text-[16.5px]">
              <li className="flex gap-3">
                <MapPin size={17} strokeWidth={1.75} className="text-[#C4921B] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{contactInfo.address}</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={17} strokeWidth={1.75} className="text-[#C4921B] shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="font-semibold text-[#243239] hover:text-[#9A7015] transition-colors">{contactInfo.email}</a>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={17} strokeWidth={1.75} className="text-[#C4921B] shrink-0" />
                <a href={`tel:${contactInfo.phoneTel}`} className="font-semibold text-[#243239] hover:text-[#9A7015] transition-colors">{contactInfo.phone}</a>
              </li>
            </ul>
            <Link
              href="/contact"
              className="gold-shimmer mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16.5px] font-bold btn-gold"
            >
              Send an enquiry <ArrowUpRight size={16} strokeWidth={2.25} />
            </Link>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[#33454E]/15 flex flex-col md:flex-row gap-4 md:items-center justify-between text-[15.5px] text-[#4B5A61]">
          <p>© {year} Centre for Urbanization, Buildings &amp; Environment (CUBE). All rights reserved.</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/tenders" className="hover:text-[#243239] transition-colors">Tenders</Link>
            <Link href="/careers" className="hover:text-[#243239] transition-colors">Careers</Link>
            <Link href="/media" className="hover:text-[#243239] transition-colors">Media</Link>
            <Link href="/contact" className="hover:text-[#243239] transition-colors">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
