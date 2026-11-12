'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Leaf, Cpu, Compass, MapPin, 
  Mail, Phone, Clock, ArrowUpRight, ShieldCheck,
  Linkedin, Twitter, Facebook
} from 'lucide-react';
import { contactInfo } from '@/data/contact';
import { verticals } from '@/data/verticals';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#243239] text-[#C9BCA6] border-t border-[#C4921B]/25">
      {/* Top Pre-Footer Minimal Institutional Banner */}
      <div className="bg-[#2B3B44]/80 border-b border-[#C9BCA6]/12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#33454E] rounded-2xl border border-[#C4921B]/25 shadow-sm shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#E9B215]" />
              </div>
              <div>
                <h4 className="font-display text-base font-semibold text-[#F5EFE4]">Centre of Excellence</h4>
                <p className="text-xs text-[#A89476] mt-0.5 leading-relaxed">
                  Established jointly by the Government of Tamil Nadu &amp; Indian Institute of Technology Madras.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#33454E] rounded-2xl border border-[#C4921B]/25 shadow-sm shrink-0">
                <Building2 className="w-5 h-5 text-[#E9B215]" />
              </div>
              <div>
                <h4 className="font-display text-base font-semibold text-[#F5EFE4]">Engineering Consultancy</h4>
                <p className="text-xs text-[#A89476] mt-0.5 leading-relaxed">
                  Independent Third Party Quality Assurance (TPQA) &amp; structural proof checking for 40+ schemes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[#33454E] rounded-2xl border border-[#C4921B]/25 shadow-sm shrink-0">
                <Leaf className="w-5 h-5 text-[#E9B215]" />
              </div>
              <div>
                <h4 className="font-display text-base font-semibold text-[#F5EFE4]">CUBE Environmental Lab (CEL)</h4>
                <p className="text-xs text-[#A89476] mt-0.5 leading-relaxed">
                  Advanced water, wastewater, soil, and building materials testing facility at IITM Research Park.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Slate Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          
          {/* Col 1: Identity & Official Emblem (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative h-14 w-64 rounded-xl bg-[#F5EFE4]/95 p-2 shadow-[0_2px_12px_rgba(15,25,32,0.4)]">
                <Image
                  src="/images/branding/cube-live-logo.png"
                  alt="CUBE - Centre for Urbanization, Buildings & Environment"
                  fill
                  className="object-contain object-left p-2"
                />
              </div>
            </Link>

            <p className="text-xs text-[#A89476] leading-relaxed max-w-sm">
              An autonomous Centre of Excellence translating cutting-edge academic research from IIT Madras into resilient public infrastructure, sustainable water systems, and smart urban environments.
            </p>

            <div className="pt-2">
              <div className="text-[11px] uppercase tracking-[0.25em] font-bold text-[#E9B215] mb-3">
                Connect With CUBE
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#33454E] hover:bg-[#C4921B] text-[#C9BCA6] hover:text-[#2B3B44] transition-colors border border-[#C9BCA6]/20"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#33454E] hover:bg-[#C4921B] text-[#C9BCA6] hover:text-[#2B3B44] transition-colors border border-[#C9BCA6]/20"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#33454E] hover:bg-[#C4921B] text-[#C9BCA6] hover:text-[#2B3B44] transition-colors border border-[#C9BCA6]/20"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Core Verticals (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-base font-semibold text-[#F5EFE4]">
              Core Verticals
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A89476]">
              <li>
                <Link href="/verticals/building-construction" className="hover:text-[#E9B215] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C4921B]">&rsaquo;</span> Building &amp; Construction
                </Link>
              </li>
              <li>
                <Link href="/verticals/environment-sustainability" className="hover:text-[#E9B215] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C4921B]">&rsaquo;</span> Environment &amp; Sustainability
                </Link>
              </li>
              <li>
                <Link href="/verticals/smart-cities" className="hover:text-[#E9B215] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C4921B]">&rsaquo;</span> Smart Cities &amp; IoT
                </Link>
              </li>
              <li>
                <Link href="/verticals/urban-planning-transportation" className="hover:text-[#E9B215] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C4921B]">&rsaquo;</span> Urban Planning &amp; Transportation
                </Link>
              </li>
              <li>
                <Link href="/cel" className="hover:text-[#E9B215] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C4921B]">&rsaquo;</span> CEL Laboratory Testing
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: About & Governance (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display text-base font-semibold text-[#F5EFE4]">
              Governance
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A89476]">
              <li>
                <Link href="/about" className="hover:text-[#E9B215] transition-colors">
                  About Overview
                </Link>
              </li>
              <li>
                <Link href="/about/vision-mission" className="hover:text-[#E9B215] transition-colors">
                  Vision &amp; Mission
                </Link>
              </li>
              <li>
                <Link href="/about/chairman-message" className="hover:text-[#E9B215] transition-colors">
                  Chairman Message
                </Link>
              </li>
              <li>
                <Link href="/about#governing-board" className="hover:text-[#E9B215] transition-colors">
                  Governing Board
                </Link>
              </li>
              <li>
                <Link href="/about/advisory-panel" className="hover:text-[#E9B215] transition-colors">
                  IIT Advisory Panel
                </Link>
              </li>
              <li>
                <Link href="/about/team" className="hover:text-[#E9B215] transition-colors">
                  Our Team (80+)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-display text-base font-semibold text-[#F5EFE4]">
              Institutional Office
            </h4>
            
            <div className="space-y-3 text-xs text-[#A89476]">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#C4921B] shrink-0 mt-0.5" />
                <span>
                  First Floor, IIT Madras Research Park, Kanagam Road, Taramani, Chennai, Tamil Nadu 600113, India
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#C4921B] shrink-0" />
                <a href="mailto:contact@cubeiitm.org" className="text-[#C9BCA6] font-medium hover:text-[#E9B215] transition-colors">
                  contact@cubeiitm.org
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#C4921B] shrink-0" />
                <a href="tel:+914466469800" className="text-[#C9BCA6] font-medium hover:text-[#E9B215] transition-colors">
                  +91 44 6646 9800
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-[#C4921B] shrink-0" />
                <span>Monday &ndash; Friday: 9:00 AM &ndash; 5:30 PM (IST)</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#C4921B] text-[#2B3B44] hover:bg-[#E9B215] text-xs font-semibold transition-all shadow-[0_4px_16px_rgba(196,146,27,0.3)] gold-shimmer"
              >
                <span>Submit Technical Query</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Footer Legal & Attribution */}
      <div className="border-t border-[#C9BCA6]/12 bg-[#2B3B44]/80 py-6 text-xs text-[#A89476]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            &copy; {currentYear} Centre for Urbanization, Buildings &amp; Environment (CUBE). All rights reserved.
            <span className="block sm:inline sm:ml-2 text-[11px] text-[#A89476]/70">
              Autonomous Centre of Excellence &bull; Govt of Tamil Nadu &amp; IIT Madras.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/tenders" className="hover:text-[#E9B215] transition-colors">
              Tenders
            </Link>
            <span>&bull;</span>
            <Link href="/careers" className="hover:text-[#E9B215] transition-colors">
              Careers
            </Link>
            <span>&bull;</span>
            <Link href="/media" className="hover:text-[#E9B215] transition-colors">
              Media Center
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-[#E9B215] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
