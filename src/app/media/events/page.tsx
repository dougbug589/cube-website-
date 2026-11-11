import React from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Events & Workshops | CUBE IIT Madras',
  description: 'Technical seminars, capacity building programs, and conferences organized by CUBE.',
};

export default function EventsPage() {
  const events = [
    {
      title: 'Statewide Municipal Engineers Capacity Building Program',
      date: 'May 18 - 20, 2024',
      location: 'IIT Madras Research Park Auditorium, Chennai',
      category: 'Capacity Building',
      image: '/images/hero/slides_building-training-team.jpg',
      description: '3-day residential workshop focused on modern concrete durability, non-destructive testing (NDT), and precast quality assurance for over 120 executive engineers from Tamil Nadu urban local bodies.',
      attendees: '120+ Executive Engineers',
      highlights: ['NDT Demonstrations (UPV & Rebound Hammer)', 'High-Performance Concrete Mixes', 'Seismic Detailing Verification']
    },
    {
      title: 'Workshop on Innovative Precast Housing & Light House Projects',
      date: 'January 24, 2024',
      location: 'Civil Engineering Department, IIT Madras',
      category: 'Technical Seminar',
      image: '/images/hero/slides_07-cat.jpg',
      description: 'Dissemination seminar presenting structural monitoring findings and construction speed benchmarks from the Light House Project (LHP) Chennai under GHTC-India.',
      attendees: '85+ Industry & State Delegates',
      highlights: ['Precast Joint Integrity Analysis', 'Thermal Comfort & Energy Modeling', 'Techno-Commercial Benchmarks']
    },
    {
      title: 'Urban Water Resilience & Flood Mitigation Symposium',
      date: 'November 12, 2023',
      location: 'IC&SR Hall, IIT Madras',
      category: 'Symposium',
      image: '/images/projects/environment-sustainability/about_environment.jpg',
      description: 'Technical session bringing together hydrologists, CMDA planners, and IIT Madras civil engineering faculty to deliberate 2D hydrodynamic modeling for coastal Chennai catchments.',
      attendees: '150+ Urban Planners & Engineers',
      highlights: ['Extreme Rainfall Runoff Modeling', 'Stormwater Micro-Drainage Design', 'Sustainable Retention Ponds']
    }
  ];

  return (
    <div>
      <PageHeader
        badge="Knowledge Transfer"
        title="Events & Capacity Building"
        description="Technical workshops, executive engineering seminars, and capacity-building programs mentoring state department engineers."
        breadcrumbs={[
          { label: 'Media', href: '/media' },
          { label: 'Events' },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm hover:shadow-cube transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-5 relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-900">
                  <Image
                    src={evt.image}
                    alt={evt.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/90 text-[#070E5C] text-[#070E5C] backdrop-blur-md border border-[#BDD7E8]">
                      {evt.category}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center text-teal-700 font-semibold">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5 text-slate-400" />
                      <span>{evt.location}</span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold font-display text-navy-950 leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {evt.description}
                  </p>

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
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

