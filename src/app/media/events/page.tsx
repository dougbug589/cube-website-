import React from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { cubeEvents } from '@/data/media';

export const metadata = {
  title: 'Events | CUBE IIT Madras',
  description: 'Meetings, project milestones and events at CUBE.',
};

export default function EventsPage() {
  const events = cubeEvents;

  return (
    <div>
      <PageHeader
        badge="Events"
        title="Events & Milestones"
        description="Meetings, project milestones and events at CUBE."
        breadcrumbs={[
          { label: 'Media', href: '/media' },
          { label: 'Events' },
        ]}
      />

      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm hover:shadow-cube transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-[#F0C468]">
                  <Image
                    src={evt.image}
                    alt={evt.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[13.5px] font-bold px-3 py-1 rounded-full bg-white/90 text-[#2B3B44] text-[#2B3B44] backdrop-blur-md border border-[#D3DDE1]">
                      {evt.category}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    {evt.date && (
                      <div className="flex items-center text-[#9A7015] font-semibold">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        <span>{evt.date}</span>
                      </div>
                    )}
                    {evt.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                        <span>{evt.location}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-display text-navy-950 leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {evt.description}
                  </p>

                  {evt.highlights && evt.highlights.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Key Highlights:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evt.highlights.map((h, i) => (
                        <span key={i} className="text-xs px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 font-medium">
                          &bull; {h}
                        </span>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

