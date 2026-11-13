import React from 'react';
import Image from 'next/image';

/**
 * The right side of inner-page headers: a quiet, static frosted-glass card
 * with CUBE's established facts, like an institutional letterhead. Facts come
 * from the site's own content (established May 2017; IIT Madras Research
 * Park address). Wide screens only, where the space exists.
 */
export default function HeaderFacts() {
  return (
    <aside
      aria-label="About the Centre"
      className="hidden min-[1400px]:block absolute right-0 top-0 w-[380px] liquid-glass rounded-[24px] px-6 py-5"
    >
      <div className="flex items-center gap-4">
        <span className="relative w-12 h-12 shrink-0">
          <Image src="/images/branding/cube-primary-logo.png" alt="" fill sizes="48px" className="object-contain" />
        </span>
        <span>
          <span className="block label-mono">Centre of Excellence</span>
          <span className="mt-1 block text-[16px] font-bold text-[#F3F5F6] leading-snug">IIT Madras · Government of Tamil Nadu</span>
        </span>
      </div>
      <dl className="mt-4 pt-4 border-t border-white/10 grid grid-cols-[auto_1fr] gap-x-8 gap-y-1 text-[15px]">
        <div>
          <dt className="text-[#8E9AA0] font-semibold">Established</dt>
          <dd className="mt-0.5 font-bold text-[#F3F5F6]">May 2017</dd>
        </div>
        <div>
          <dt className="text-[#8E9AA0] font-semibold">Based at</dt>
          <dd className="mt-0.5 font-bold text-[#F3F5F6] leading-snug">IIT Madras Research Park, Chennai</dd>
        </div>
      </dl>
    </aside>
  );
}
