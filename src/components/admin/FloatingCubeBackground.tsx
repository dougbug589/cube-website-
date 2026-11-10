'use client';

import React from 'react';
import Image from 'next/image';

export default function FloatingCubeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Soft Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[#EAF2F8]/60 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#FAF4E6]/50 rounded-full blur-3xl" />

      {/* Stable Full-Cover Architectural Watermark - Fixed Position, No Disorienting Shift */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] lg:w-[800px] lg:h-[800px] opacity-[0.06]">
          <Image
            src="/images/branding/cube-3d-isometric-logo.png"
            alt="CUBE Institutional Emblem"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Clean Subtle Architectural Dot Grid across whole workspace */}
      <div 
        className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#070E5C_1.5px,transparent_1.5px)] [background-size:24px_24px]" 
      />
    </div>
  );
}
