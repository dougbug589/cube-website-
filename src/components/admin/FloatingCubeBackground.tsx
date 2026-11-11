'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ADMIN_BANNER_SRC } from '@/lib/branding';

/**
 * Admin workspace background (dashboard + login).
 *
 * Shows the CUBE banner (logo, isometric cubes, Chennai heritage skyline) from
 * ADMIN_BG_SRC as a full-cover background with a soft overlay so panels stay
 * readable. If that file is missing, it falls back to the emblem watermark.
 */
export const ADMIN_BG_SRC = ADMIN_BANNER_SRC;

export default function FloatingCubeBackground({
  besideSidebar = false,
}: {
  /** Admin console: on desktop, start the banner at the sidebar's right edge
   *  (sidebar is w-64) so the CUBE logo is not hidden underneath it. */
  besideSidebar?: boolean;
}) {
  const [bannerAvailable, setBannerAvailable] = useState(true);

  return (
    <div
      className={`fixed inset-0 ${besideSidebar ? 'md:left-64' : ''} pointer-events-none z-0 overflow-hidden select-none`}
    >
      {bannerAvailable ? (
        <>
          <Image
            src={ADMIN_BG_SRC}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover object-left-bottom"
            onError={() => setBannerAvailable(false)}
          />
          {/* Light blue & white veil: the banner stays visible in the background
              while the admin keeps its light blue / white look. */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/65 via-[#F3F8FC]/50 to-[#EAF2F8]/45" />
        </>
      ) : (
        <>
          {/* Fallback: soft ambient lighting + emblem watermark */}
          <div className="absolute top-1/4 left-1/3 w-[60vw] max-w-[600px] aspect-square bg-[#EAF2F8]/60 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[50vw] max-w-[500px] aspect-square bg-[#FAF4E6]/50 rounded-full blur-3xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[80vw] max-w-[800px] aspect-square opacity-[0.06]">
              <Image
                src="/images/branding/cube-3d-isometric-logo.png"
                alt=""
                aria-hidden
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#070E5C_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        </>
      )}
    </div>
  );
}
