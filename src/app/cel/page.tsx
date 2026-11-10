'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import CELCard from '@/components/cards/CELCard';
import { 
  FlaskConical, CheckCircle2, Waves, ArrowRight, 
  Send, Phone, Mail, MapPin, Microscope, Sparkles, Loader2
} from 'lucide-react';
import { celOverview } from '@/data/cel';
import { contactInfo } from '@/data/contact';
import { submitEnquiryAction } from '@/app/actions/enquiries';

export default function CELPage() {
  const [testingServices, setTestingServices] = useState<any[]>(celOverview.testingServices);

  useEffect(() => {
    let active = true;

    const loadServices = () => {
      fetch('/api/public/cel', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (active && Array.isArray(data) && data.length > 0) {
            setTestingServices(data);
          }
        })
        .catch((err) => console.error('Failed to load CEL services', err));
    };

    loadServices();
    const interval = setInterval(loadServices, 30000);
    const onFocus = () => loadServices();
    window.addEventListener('focus', onFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    matrix: 'Water Quality Testing',
    sampleCount: '1-5',
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
    <div className="bg-[#F4F5F8] min-h-screen">
      <PageHeader
        badge="State-of-the-Art Analytical Facility"
        title="CUBE Environmental Laboratory (CEL)"
        description="Comprehensive physical, chemical, microbiological, and trace elemental characterization across water, wastewater, solid waste, and soil matrices under ISO-standard testing protocols."
        breadcrumbs={[{ label: 'CEL Laboratory' }]}
      />

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-[#C4CAD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#D7A00F] px-3 py-1 rounded-full shadow-sm">
                IIT Madras Research Park Facility
              </span>
              <h2 className="text-3xl font-display font-extrabold text-[#070E5C]">
                Precision Analytical Diagnostics for Environmental Engineering
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {celOverview.description}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D7A00F]">
                  Laboratory Capabilities &amp; Clean Room Facilities:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {celOverview.facilities.map((fac, i) => (
                    <div key={i} className="flex items-center text-xs font-semibold text-slate-800 bg-[#F4F5F8] p-2.5 rounded-xl border border-[#C4CAD8]">
                      <CheckCircle2 className="w-4 h-4 text-[#D7A00F] mr-2 flex-shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-96 rounded-3xl overflow-hidden shadow-cube border border-[#C4CAD8]">
              <Image
                src="/images/cel/about_cel.jpg"
                alt="CUBE Environmental Laboratory Interior"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testing Services Cards */}
      <section className="py-20 bg-[#F4F5F8] border-b border-[#C4CAD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#D7A00F] px-3 py-1 rounded-full shadow-sm">
              Testing Parameters
            </span>
            <h2 className="text-3xl font-display font-extrabold text-[#070E5C] mt-3">
              CEL Testing Services &amp; Matrices
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Hover or tap each 3D card to view testing parameters, analytical equipment, and compliance scopes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testingServices.map((service) => (
              <CELCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Laboratory Real-Time Booking Form */}
      <section id="enquiry" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F4F5F8] border border-[#C4CAD8] shadow-cube">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#D7A00F] px-3 py-1 rounded-full shadow-sm">
                Real-Time Sample Submission
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#070E5C] mt-2">
                Laboratory Test Enquiry &amp; Booking
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Submit sample details for commercial testing, baseline environmental audits, or university research support. Directly synced with the CUBE administrative registry.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-white border border-[#D7A00F] text-center space-y-3 shadow-md">
                <CheckCircle2 className="w-12 h-12 text-[#D7A00F] mx-auto" />
                <h3 className="text-lg font-bold text-[#070E5C] font-display">
                  CEL Testing Enquiry Received in Real-Time
                </h3>
                <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. A laboratory coordinator from CUBE Environmental Laboratory will review your testing scope for <strong>{formData.matrix}</strong> and contact you at <strong>{formData.email}</strong> within one working day.
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
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA] hover:bg-[#D7A00F] hover:text-[#070E5C] transition shadow-md"
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
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 Contact Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Organization / University
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TNPCB / Industry / IITM"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Sample Matrix / Category *
                    </label>
                    <select
                      value={formData.matrix}
                      onChange={(e) => setFormData({ ...formData, matrix: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    >
                      <option value="Water Quality Testing (IS 10500)">Water Quality Testing (IS 10500)</option>
                      <option value="Wastewater / STP Effluent (CPCB Norms)">Wastewater / STP Effluent (CPCB Norms)</option>
                      <option value="Solid Waste & Sludge Characterization">Solid Waste &amp; Sludge Characterization</option>
                      <option value="Heavy Metals / Trace Analysis (ICP-MS)">Heavy Metals / Trace Analysis (ICP-MS)</option>
                      <option value="Environmental Impact / Baseline Audit">Environmental Impact / Baseline Audit</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Estimated Sample Volume
                    </label>
                    <select
                      value={formData.sampleCount}
                      onChange={(e) => setFormData({ ...formData, sampleCount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    >
                      <option value="1-5 Samples">1 - 5 Samples</option>
                      <option value="6-20 Samples">6 - 20 Samples</option>
                      <option value="20+ Samples">20+ Samples</option>
                      <option value="Recurring Monthly Retainer">Recurring Monthly Retainer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#070E5C] block mb-1">
                    Specific Parameters / Project Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="List specific testing parameters (BOD, COD, Heavy metals, Pathogens, etc.) and project location..."
                    value={formData.parametersNeeded}
                    onChange={(e) => setFormData({ ...formData, parametersNeeded: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-[#070E5C] bg-[#D7A00F] hover:bg-[#BF8C0B] transition shadow-cube-glow flex items-center justify-center disabled:opacity-50"
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
