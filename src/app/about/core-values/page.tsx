import React from 'react';
import { ShieldCheck, Award, HeartHandshake, Mountain, Lightbulb, Target, Quote } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Core Values | CUBE IIT Madras',
  description: 'Core values of CUBE – Leadership, Excellence, Harmony, Intrepid, Innovation and Decisive.',
};

const ICONS = [ShieldCheck, Award, HeartHandshake, Mountain, Lightbulb, Target];

// "“quote” — Author" -> { quote, author }
const split = (d: string) => {
  const m = d.match(/^\s*[“"]?([\s\S]*?)[”"]?\s*[—–-]\s*([^—–-]+)$/);
  return m ? { quote: m[1].trim(), author: m[2].trim() } : { quote: d, author: '' };
};

export default function CoreValuesPage() {
  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="About"
        title="Core Values"
        description={aboutContent.coreValues.map((v) => v.title).join(' · ')}
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'Core Values' }]}
      />

      <section className="shell pb-24">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 reveal-stagger">
          {aboutContent.coreValues.map((val, i) => {
            const Icon = ICONS[i % ICONS.length];
            const { quote, author } = split(val.description);
            return (
              <article key={val.title} className="glass glass-interactive glass-edge rounded-[28px] p-7 lg:p-8 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="grid place-items-center w-14 h-14 rounded-[18px] bg-gradient-to-b from-[#F6C22E]/35 to-[#F6C22E]/20 text-[#F3F5F6] depth-1">
                    <Icon size={24} strokeWidth={2} />
                  </span>
                  <span className="font-display text-[15px] font-extrabold text-[#F6C22E] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h2 className="mt-6 font-display text-[28px] font-extrabold text-[#F3F5F6] leading-tight">{val.title}</h2>
                <blockquote className="mt-4 flex-1">
                  <Quote size={18} className="text-[#F6C22E]/70" />
                  <p className="mt-2 text-[19.5px] leading-relaxed text-[#DDE3E6]">{quote}</p>
                </blockquote>
                {author && <p className="mt-5 pt-4 border-t border-white/10 text-[15.5px] font-bold text-[#F3F5F6]">— {author}</p>}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
