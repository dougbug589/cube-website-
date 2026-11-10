'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function IntroAnimation() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if shown in this session
    const hasLoaded = sessionStorage.getItem('cube_intro_viewed');
    if (hasLoaded) {
      setVisible(false);
      return;
    }

    const timer1 = setTimeout(() => {
      setFading(true);
    }, 1100);

    const timer2 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('cube_intro_viewed', 'true');
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-950 transition-opacity duration-500 ease-out ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center animate-fade-in text-center px-4">
        {/* Official CUBE Logo */}
        <div className="relative h-24 w-24 sm:h-28 sm:w-28 bg-white p-2 rounded-2xl shadow-cube-glow mb-5">
          <Image
            src="/images/branding/cube-primary-logo.png"
            alt="CUBE Institutional Emblem"
            fill
            className="object-contain p-1"
            priority
          />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-wider">
            CUBE
          </h2>
          <p className="text-xs sm:text-sm text-teal-400 font-medium">
            Centre for Urbanization, Buildings &amp; Environment
          </p>
          <p className="text-[11px] text-slate-400">
            Centre of Excellence | IIT Madras &bull; Government of Tamil Nadu
          </p>
        </div>

        {/* Subtle Loading Pulse Bar */}
        <div className="mt-6 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-teal-400 rounded-full animate-pulse-subtle" />
        </div>
      </div>
    </div>
  );
}

