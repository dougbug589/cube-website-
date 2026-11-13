'use client';

import React, { useEffect, useState } from 'react';
import SectionRail from '@/components/common/SectionRail';

/**
 * Section guide for the long home page: the shared left-margin SectionRail
 * (screens 1900px and wider), visible between the hero and the footer. Scroll work is rAF-throttled and only sets state when the
 * active section actually changes.
 */
export default function SectionSpine({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      let current: string | null = null;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      const first = document.getElementById(sections[0]?.id);
      const footer = document.querySelector('footer');
      const pastHero = first ? first.getBoundingClientRect().top < window.innerHeight * 0.75 : false;
      const beforeFooter = footer ? footer.getBoundingClientRect().top > window.innerHeight * 0.6 : true;
      setVisible(pastHero && beforeFooter);
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sections]);

  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // fades with opacity only (the rail has no backdrop-filter, so no blur
  // problem); hidden over the full-bleed hero and once the footer arrives
  return (
    <div className={`transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-hidden={!visible}>
      <SectionRail sections={sections} active={active} onJump={jump} />
    </div>
  );
}
