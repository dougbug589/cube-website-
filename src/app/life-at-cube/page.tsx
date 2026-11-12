import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { Users, Sparkles, Building2, Award, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Life at CUBE | Workplace Culture & Environment',
  description: 'Experience professional life, team culture, and the collaborative research ecosystem at CUBE IIT Madras Research Park.',
};

export default function LifeAtCubePage() {
  const highlights = [
    {
      title: 'Life at CUBE',
      desc: '',
      image: '/images/life-at-cube/about_life.jpg'
    },
    {
      title: 'Life at CUBE',
      desc: '',
      image: '/images/life-at-cube/about_life1.jpg'
    },
    {
      title: 'Life at CUBE',
      desc: '',
      image: '/images/life-at-cube/about_life2.jpg'
    }
  ];

  return (
    <div>
      <PageHeader
        badge="Workplace & Culture"
        title="Life at CUBE"
        description="A vibrant, mission-driven ecosystem where academic rigor meets impactful public infrastructure engineering."
        breadcrumbs={[{ label: 'Life at CUBE' }]}
      />

      <section className="py-20 bg-transparent border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A7015] bg-[#F7EDD3] px-3 py-1 rounded-full border border-[#E9D6A8]">
              Our Collaborative Culture
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-navy-950 mt-3">
              Where Engineering Innovation Meets Public Purpose
            </h2>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              Situated in the premier innovation ecosystem of IIT Madras Research Park in Chennai, CUBE offers a distinctive work culture blending academic curiosity with rigorous field engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((h, i) => (
              <div key={i} className="rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm hover:shadow-cube transition-all flex flex-col justify-between">
                <div className="relative h-64 w-full bg-slate-900">
                  <Image
                    src={h.image}
                    alt={h.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold font-display text-navy-950 mb-2">
                    {h.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Team CTA */}
      <section className="py-16 bg-transparent text-[#2B3B44] border border-[#B9C5CA] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Interested in Joining the CUBE Team?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300">
            Explore career opportunities in structural design, environmental modeling, GIS planning, and laboratory analysis.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/careers"
              className="px-6 py-3 rounded-xl text-xs font-bold text-navy-950 bg-[#EFD9A6] hover:bg-[#EFD9A6] transition"
            >
              <span>View Career Openings</span>
            </Link>
            <Link
              href="/about/team"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition"
            >
              <span>Meet the Team (80+)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

