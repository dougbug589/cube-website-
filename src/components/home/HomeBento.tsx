'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

/**
 * Life at CUBE · Leadership · Media · Clients — the original site shows these
 * as a block of image tiles; here they are a bento grid of auto-rotating
 * cards. Each tile crossfades on its own clock (offset so they never switch
 * together), springs on press, and pauses on hover, off-screen, hidden tab
 * or reduced motion. Transform / opacity / filter only.
 */

type Person = { name: string; role?: string; image?: string };
type Shot = { image: string; title?: string; date?: string };
type Logo = { name: string; logo: string };

const EASE = [0.16, 1, 0.3, 1] as const;

/** shared visibility state for the whole grid */
function useGridVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const sync = () => setVisible(inView && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    }, { threshold: 0.15 });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);
  return { ref, running: visible && !reduced };
}

/** index that advances every `ms` while running and not hovered */
function useCycle(length: number, ms: number, running: boolean, startDelay = 0) {
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const [started, setStarted] = useState(startDelay === 0);
  useEffect(() => {
    if (started || !running) return;
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [started, running, startDelay]);
  useEffect(() => {
    if (!running || hover || !started || length < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % length), ms);
    return () => clearTimeout(t);
  }, [i, running, hover, started, length, ms]);
  const bind = { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) };
  return [i % Math.max(length, 1), bind] as const;
}

function TileHead({ label }: { label: string }) {
  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
      <span className="chip-photo rounded-full px-3.5 py-1.5 text-[15px] font-extrabold text-white tracking-wide" style={{ background: 'rgba(20, 30, 36, 0.42)' }}>{label}</span>
      <span className="chip-photo grid place-items-center w-9 h-9 rounded-full text-white transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight size={16} strokeWidth={2.25} />
      </span>
    </div>
  );
}

function Crossfade({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={id}
        initial={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        transition={{ duration: 0.9, ease: EASE }}
        className="absolute inset-0 will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function HomeBento({
  life,
  leaders,
  media,
  clients,
}: {
  life: Shot[];
  leaders: Person[];
  media: Shot[];
  clients: Logo[];
}) {
  const { ref, running } = useGridVisible();
  const [li, lifeBind] = useCycle(life.length, 3000, running, 0);
  const [pi, peopleBind] = useCycle(leaders.length, 2600, running, 700);
  const [mi, mediaBind] = useCycle(media.length, 3200, running, 1400);
  const logoPages = Math.max(1, Math.ceil(clients.length / 6));
  const [ci, clientBind] = useCycle(logoPages, 2400, running, 2000);

  const lifeShot = life[li];
  const person = leaders[pi];
  const shot = media[mi];
  const logos = clients.slice(ci * 6, ci * 6 + 6);

  return (
    <div ref={ref} className="grid gap-4 lg:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[300px_300px] 2xl:grid-rows-[340px_340px]">
      {/* Life at CUBE — wide */}
      <Link
        href="/life-at-cube"
        {...lifeBind}
        className="press group relative overflow-hidden rounded-[28px] depth-2 min-h-[300px] md:col-span-2 bg-[#1A1F22]"
      >
        {lifeShot && (
          <Crossfade id={`life-${li}`}>
            <Image src={lifeShot.image} alt="" fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
          </Crossfade>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <TileHead label="Life at CUBE" />
        <div className="absolute left-6 right-6 bottom-6 text-white">
          <p className="font-display text-2xl lg:text-[28px] font-extrabold leading-tight">Engineers, researchers and faculty, one team.</p>
          <p className="mt-1.5 text-[16.5px] text-white/80">Training, site work and campus life at IIT Madras Research Park.</p>
        </div>
      </Link>

      {/* Leadership — tall */}
      <Link
        href="/about/board-members"
        {...peopleBind}
        className="press group relative overflow-hidden rounded-[28px] depth-2 min-h-[420px] lg:min-h-0 lg:row-span-2 bg-[#1A1F22]"
      >
        {person && (
          <Crossfade id={`p-${pi}`}>
            {person.image && <Image src={person.image} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover object-top" />}
          </Crossfade>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
        <TileHead label="Leadership" />
        <AnimatePresence mode="wait" initial={false}>
          {person && (
            <motion.div
              key={`pn-${pi}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="absolute left-6 right-6 bottom-6 text-white"
            >
              <p className="font-display text-[22px] lg:text-2xl font-extrabold leading-tight">{person.name}</p>
              {person.role && <p className="mt-1 text-[16.5px] text-white/80 leading-snug line-clamp-2">{person.role}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Media */}
      <Link
        href="/media"
        {...mediaBind}
        className="press group relative overflow-hidden rounded-[28px] depth-2 min-h-[300px] bg-[#1A1F22]"
      >
        {shot && (
          <Crossfade id={`m-${mi}`}>
            <Image src={shot.image} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
          </Crossfade>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <TileHead label="Media" />
        <AnimatePresence mode="wait" initial={false}>
          {shot?.title && (
            <motion.div
              key={`mt-${mi}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute left-6 right-6 bottom-6 text-white"
            >
              {shot.date && <p className="text-[15px] font-bold text-[#D89F03]">{shot.date}</p>}
              <p className="mt-1 font-display text-lg font-bold leading-snug line-clamp-2">{shot.title}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Clients — logo pages */}
      <Link
        href="/about/clients"
        {...clientBind}
        className="press group relative overflow-hidden rounded-[28px] depth-2 min-h-[300px] liquid-glass is-solid"
      >
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <span className="rounded-full bg-[#D89F03]/15 px-3.5 py-1.5 text-[15px] font-extrabold text-[#F3F5F6] tracking-wide">Clients</span>
          <span className="grid place-items-center w-9 h-9 rounded-full bg-white/[0.06] text-[#F3F5F6] depth-1 transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight size={16} strokeWidth={2.25} />
          </span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={`c-${ci}`}
            initial="hide"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            variants={{ hide: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="absolute inset-x-5 bottom-5 top-[68px] grid grid-cols-3 gap-3"
          >
            {logos.map((c) => (
              <motion.li
                key={c.logo}
                variants={{
                  hide: { opacity: 0, y: 10, scale: 0.92 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 24 } },
                }}
                className="relative rounded-2xl bg-white depth-1 border border-white/[0.07]"
              >
                <Image src={c.logo} alt={c.name} fill sizes="120px" className="object-contain p-3" />
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </Link>
    </div>
  );
}
