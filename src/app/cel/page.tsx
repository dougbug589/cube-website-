'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { 
  FlaskConical, CheckCircle2, Waves, ArrowRight, ArrowUpRight,
  Send, Phone, Mail, MapPin, Microscope, Sparkles, Loader2
} from 'lucide-react';
import { celOverview } from '@/data/cel';
import { contactInfo } from '@/data/contact';
import { submitEnquiryAction } from '@/app/actions/enquiries';
import { useLiveList } from '@/lib/live';

export default function CELPage() {
  // Live CMS data: updates instantly when an admin edits/archives a service.
  const testingServices = useLiveList<any>('/api/public/cel', celOverview.testingServices);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    matrix: '',
    sampleCount: '',
    parametersNeeded: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const message = `CEL Laboratory Testing Request:
Matrix: ${formData.matrix}
Estimated Samples: ${formData.sampleCount}
Parameters / Notes: ${formData.parametersNeeded || 'Standard Matrix Parameters'}`;

    const res = await submitEnquiryAction({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      category: 'CEL Laboratory Testing',
      subject: `CEL Sample Testing: ${formData.matrix} from ${formData.name}`,
      message,
      sourcePage: '/cel',
    });

    if (res.success) {
      setFormSubmitted(true);
      setLoading(false);
    } else {
      setErrorMsg(res.error || 'Failed to submit laboratory enquiry.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-transparent min-h-screen">
      <PageHeader
        badge="Laboratory"
        title={celOverview.title}
        description={celOverview.description}
        breadcrumbs={[{ label: 'CEL Laboratory' }]}
      />

      {/* Overview: only what cubeiitm.org states about CEL */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-5 reveal">
            <p className="text-[19px] sm:text-xl text-[#243239] leading-relaxed">{celOverview.subtitle}</p>
            <p className="text-[17px] text-[#46565E] leading-relaxed">{celOverview.location}</p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={celOverview.website}
                target="_blank"
                rel="noopener noreferrer"
                className="press btn-gold gold-shimmer inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold"
              >
                Visit the CEL website <ArrowUpRight size={16} strokeWidth={2.25} />
              </a>
              <a href={`mailto:${contactInfo.email}`} className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold">
                <Mail size={16} /> {contactInfo.email}
              </a>
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 reveal">
            {['/images/cel/about_cel.jpg', '/images/cel/about_cel1.jpg', '/images/cel/about_cel2.jpg'].map((src, i) => (
              <div key={src} className={`relative rounded-[24px] overflow-hidden depth-2 bg-[#DCE4E8] ${i === 0 ? 'col-span-2 h-64 sm:h-72' : 'h-44 sm:h-52'}`}>
                <Image src={src} alt="CUBE Environmental Laboratory" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" priority={i === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testing domains */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="label-mono reveal">Testing domains</p>
          <div className="mt-5 grid md:grid-cols-3 gap-5 reveal-stagger">
            {testingServices.map((service: any) => (
              <div key={service.id || service.title} className="glass glass-interactive glass-edge rounded-[26px] p-7">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#F7EDD3] text-[#9A7015] depth-1">
                  <FlaskConical size={22} strokeWidth={2} />
                </span>
                <h2 className="mt-5 font-display text-2xl font-extrabold text-[#243239]">{service.title}</h2>
                {service.description && <p className="mt-2 text-[16.5px] text-[#46565E] leading-relaxed">{service.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Laboratory Real-Time Booking Form */}
      <section id="enquiry" className="py-20 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F6F8F9] border border-[#C4CAD8] shadow-cube">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2B3B44] bg-[#F0C468] px-3 py-1 rounded-full shadow-sm">
                Real-Time Sample Submission
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#2B3B44] mt-2">
                Laboratory Test Enquiry &amp; Booking
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Submit sample details for commercial testing, baseline environmental audits, or university research support. Directly synced with the CUBE administrative registry.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-white border border-[#C4921B] text-center space-y-3 shadow-md">
                <CheckCircle2 className="w-12 h-12 text-[#C4921B] mx-auto" />
                <h3 className="text-lg font-bold text-[#2B3B44] font-display">
                  CEL Testing Enquiry Received in Real-Time
                </h3>
                <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. A laboratory coordinator from CUBE Environmental Laboratory will review your testing scope for <strong>{formData.matrix}</strong> and contact you at <strong>{formData.email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      organization: '',
                      matrix: 'Water Quality Testing',
                      sampleCount: '1-5',
                      parametersNeeded: '',
                    });
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F2F5F6] text-[#2B3B44] border border-[#B9C5CA] hover:bg-[#F6DA86] hover:text-[#2B3B44] transition shadow-md"
                >
                  Submit Another Sample Scope
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-100 text-red-800 text-xs rounded-xl font-medium border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-[#2B3B44] block mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#C4921B] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2B3B44] block mb-1">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#C4921B] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2B3B44] block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 Contact Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#C4921B] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2B3B44] block mb-1">
                      Organization / University
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TNPCB / Industry / IITM"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#C4921B] transition shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-[#2B3B44] block mb-1">
                      Sample Matrix / Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.matrix}
                      onChange={(e) => setFormData({ ...formData, matrix: e.target.value })}
                      placeholder="e.g. Water, Wastewater or Solid Waste"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#C4921B] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2B3B44] block mb-1">
                      Estimated Sample Volume *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sampleCount}
                      onChange={(e) => setFormData({ ...formData, sampleCount: e.target.value })}
                      placeholder="Type volume manually (e.g. 5 Samples, 20 Samples, 50 Litres...)"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#C4921B] transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2B3B44] block mb-1">
                    Specific Parameters / Project Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="List specific testing parameters (BOD, COD, Heavy metals, Pathogens, etc.) and project location..."
                    value={formData.parametersNeeded}
                    onChange={(e) => setFormData({ ...formData, parametersNeeded: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#C4921B] transition shadow-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-[#2B3B44] bg-[#F0C468] hover:bg-[#B07F14] transition shadow-cube-glow flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Logging Laboratory Scope...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        <span>Dispatch Laboratory Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
