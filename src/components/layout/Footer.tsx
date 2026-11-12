'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Mail, Phone, Clock, ArrowUpRight, Linkedin, Twitter, Facebook } from 'lucide-react';
import { contactInfo } from '@/data/contact';
import { verticals } from '@/data/verticals';

/**
 * Footer — light-brown band that closes the warm canvas.
 * Four columns (identity, verticals, the Centre, office) and a quiet legal row.
 */

const CENTRE_LINKS = [
  { label: 'About CUBE', href: '/about' },
  { label: 'Vision & mission', href: '/about/vision-mission' },
  { label: 'Governing board', href: '/about#governing-board' },
  { label: 'IIT advisory panel', href: '/about/advisory-panel' },
  { label: 'Our team', href: '/about/team' },
  { label: 'Media centre', href: '/media' },
];

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://linkedin.com', Icon: Linkedin },
  { label: 'Twitter', href: 'https://twitter.com', Icon: Twitter },
  { label: 'Facebook', href: 'https://facebook.com', Icon: Facebook },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 text-[#46565E]">
      <div aria-hidden className="absolute inset-0 bg-[#EEF2F4]" />
      <div aria-hidden className="absolute top-0 inset-x-0 hairline" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 lg:pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Identity */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block" aria-label="CUBE home">
              <span className="relative block h-14 w-60 rounded-2xl bg-white border border-[#33454E]/15 shadow-sm">
                <Image src="/images/branding/cube-live-logo.png" alt="" fill sizes="240px" className="object-contain object-left p-2.5" />
              </span>
            </Link>
            <p className="mt-5 text-[15px] leading-relaxed max-w-sm">
              Centre for Urbanization, Buildings &amp; Environment. A Centre of Excellence of the Government of Tamil Nadu and IIT Madras.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="press jiggle grid place-items-center w-10 h-10 rounded-full bg-white/70 border border-[#33454E]/15 text-[#46565E] hover:bg-[#F6DA86] hover:border-[#C4921B] hover:text-[#1B262C] transition-colors"
                >
                  <Icon size={16} strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          {/* Verticals */}
          <nav aria-label="Verticals" className="lg:col-span-3">
            <p className="label-mono">Verticals</p>
            <ul className="mt-4 space-y-2.5 text-[15px]">
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
            <ul className="mt-4 space-y-2.5 text-[15px]">
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
            <ul className="mt-4 space-y-3.5 text-[15px]">
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
                <a href={`tel:${String(contactInfo.phone).replace(/\s+/g, '')}`} className="font-semibold text-[#243239] hover:text-[#9A7015] transition-colors">{contactInfo.phone}</a>
              </li>
              <li className="flex gap-3 items-center">
                <Clock size={17} strokeWidth={1.75} className="text-[#C4921B] shrink-0" />
                <span>Mon to Fri, 9:00 to 17:30 IST</span>
              </li>
            </ul>
            <Link
              href="/contact"
              className="gold-shimmer mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full text-[15px] font-bold btn-gold"
            >
              Send an enquiry <ArrowUpRight size={16} strokeWidth={2.25} />
            </Link>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[#33454E]/15 flex flex-col md:flex-row gap-4 md:items-center justify-between text-[13.5px] text-[#5B6A71]">
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
