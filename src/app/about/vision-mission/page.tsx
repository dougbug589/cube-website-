import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Target, Compass, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Vision & Mission | CUBE IIT Madras',
  description: 'Vision and mission of CUBE – Centre for Urbanization, Buildings & Environment (IIT Madras & Govt of Tamil Nadu).',
};

export default function VisionMissionPage() {
  return (
    <div className="bg-[#FFFFFF]">
      <PageHeader
        badge="Strategic Direction"
        title="Vision & Mission"
        description="Our institutional roadmap for pioneering sustainable urbanization, resilient public infrastructure, and environmental stewardship."
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'Vision & Mission' },
        ]}
      />

      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Vision Card (Architectural Light Palette) */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white text-[#243239] shadow-sm hover:shadow-xl border border-[#DCE4E7] transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-[#F2F5F6] text-[#2B3B44] rounded-2xl w-fit mb-6 border border-[#B9C5CA]">
                  <Compass className="w-8 h-8 text-[#C4921B]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C4921B]">
                  Our Institutional Vision
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#243239] mt-2">
                  World-Class Applied Urban Excellence
                </h2>
                <p className="mt-6 text-sm sm:text-base text-[#5B6A71] leading-relaxed font-sans font-normal">
                  &ldquo;{aboutContent.vision}&rdquo;
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#DCE4E7] text-xs text-[#5B6A71]">
                Endorsed by the Governing Board &bull; IIT Madras &bull; Government of Tamil Nadu
              </div>
            </div>

            {/* Mission Card (Architectural Light Sky Palette) */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white text-[#243239] border border-[#DCE4E7] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-[#F2F5F6] text-[#2B3B44] rounded-2xl w-fit mb-6 border border-[#B9C5CA]">
                  <Target className="w-8 h-8 text-[#C4921B]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#C4921B]">
                  Our Execution Mission
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#243239] mt-2">
                  Applied Engineering for Public Good
                </h2>
                <p className="mt-6 text-sm sm:text-base text-[#5B6A71] leading-relaxed font-sans font-normal">
                  &ldquo;{aboutContent.mission}&rdquo;
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#DCE4E7]">
                <Link
                  href="/about/objectives"
                  className="inline-flex items-center text-xs font-semibold text-[#2B3B44] hover:text-[#C4921B] transition-colors"
                >
                  <span>Explore 10 Institutional Objectives</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
