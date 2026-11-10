'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
import { ClientPartner } from '@/types';

interface Interactive3DClientsProps {
  clients: ClientPartner[];
}

export default function Interactive3DClients({ clients }: Interactive3DClientsProps) {
  // Use verified clients list
  const displayClients = clients && clients.length > 0 ? clients : [];
  // Duplicate for seamless 2-row opposite marquee
  const row1 = [...displayClients, ...displayClients];
  const row2 = [...displayClients.slice().reverse(), ...displayClients.slice().reverse()];

  return (
    <section className="py-20 sm:py-24 bg-gradient-to-b from-[#FFFFFF] via-[#F4F9FD] to-[#EAF2F8] border-b border-[#E5E7EB] relative overflow-hidden select-none">
      
      {/* Dynamic Ambient Optical Glows */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[350px] bg-[#5B9BD5]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[300px] bg-[#D99A42]/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#BDD7E8] text-[#070E5C] text-xs font-bold uppercase tracking-widest shadow-xs mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D99A42]" />
          <span>Trusted Institutional Ecosystem</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight">
          Government Departments &amp; Industry Partners
        </h2>
        <p className="text-xs sm:text-sm text-[#747B83] mt-3 max-w-2xl mx-auto leading-relaxed">
          Powering state infrastructure, third-party quality assurance, precast engineering, and environmental stewardship across India.
        </p>
      </div>

      {/* Row 1: Leftward Infinite Marquee */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Apple Glass Frosted Vignette Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-[#EAF2F8] via-[#EAF2F8]/80 to-transparent z-20 pointer-events-none" />

        <div className="flex w-max items-center gap-6 animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
          {row1.map((client, idx) => (
            <div
              key={`row1-${client.name}-${idx}`}
              className="w-52 sm:w-60 h-28 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_8px_24px_rgba(7,14,92,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] p-4 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:border-[#5B9BD5] hover:shadow-[0_16px_36px_rgba(7,14,92,0.12)] group cursor-pointer"
            >
              <div className="relative h-14 w-full flex items-center justify-center">
                <Image
                  src={client.logo || '/images/clients/tnuhdb.png'}
                  alt={client.name}
                  fill
                  className="object-contain filter grayscale opacity-85 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-xs"
                />
              </div>
              <span className="text-[11px] text-[#24272B] group-hover:text-[#070E5C] font-bold mt-2 truncate max-w-full">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Rightward Reverse Marquee */}
      <div className="relative w-full overflow-hidden py-3 mt-3">
        {/* Vignette Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-[#EAF2F8] via-[#EAF2F8]/80 to-transparent z-20 pointer-events-none" />

        <div className="flex w-max items-center gap-6 animate-[marquee_50s_linear_infinite_reverse] hover:[animation-play-state:paused]">
          {row2.map((client, idx) => (
            <div
              key={`row2-${client.name}-${idx}`}
              className="w-52 sm:w-60 h-28 rounded-2xl bg-white/90 backdrop-blur-2xl border border-white/90 shadow-[0_8px_24px_rgba(7,14,92,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.95)] p-4 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:border-[#5B9BD5] hover:shadow-[0_16px_36px_rgba(7,14,92,0.12)] group cursor-pointer"
            >
              <div className="relative h-14 w-full flex items-center justify-center">
                <Image
                  src={client.logo || '/images/clients/tnuhdb.png'}
                  alt={client.name}
                  fill
                  className="object-contain filter grayscale opacity-85 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-xs"
                />
              </div>
              <span className="text-[11px] text-[#24272B] group-hover:text-[#070E5C] font-bold mt-2 truncate max-w-full">
                {client.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA to Clients Directory */}
      <div className="mt-10 text-center relative z-10">
        <Link
          href="/about#clients-partners"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-white border border-[#BDD7E8] hover:bg-[#EAF2F8] shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 active:scale-95"
        >
          <span>View All Government &amp; Corporate Clients</span>
          <ArrowUpRight className="w-4 h-4 text-[#D99A42]" />
        </Link>
      </div>

    </section>
  );
}
