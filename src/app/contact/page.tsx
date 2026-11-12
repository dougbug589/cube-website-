'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { 
  MapPin, Mail, Phone, Clock, Send, 
  CheckCircle2, ExternalLink, Loader2, Sparkles, Building2 
} from 'lucide-react';
import { contactInfo } from '@/data/contact';
import { submitEnquiryAction } from '@/app/actions/enquiries';
import { GlassPanel } from '@/components/common/AppleLiquidGlass';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    enquiryCategory: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await submitEnquiryAction({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      category: formData.enquiryCategory,
      message: formData.message,
      sourcePage: '/contact',
    });

    if (res.success) {
      setSubmitted(true);
      setLoading(false);
    } else {
      setErrorMsg(res.error || 'Failed to submit enquiry.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] text-[#24272B] min-h-screen">
      <PageHeader
        badge="Direct Communications"
        title="Contact & Technical Liaison"
        description="Connect with CUBE engineering specialists, schedule project consultations, or submit scopes for third-party structural assurance and environmental diagnostics."
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#FFFFFF] via-[#FAF8F4] to-[#F5EFE4] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left 5 Cols: Contact Coordinates & Google Map in Apple Liquid Glass */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2B3B44] bg-[#F5EFE4] border border-[#D8CDB8] px-3 py-1 rounded-full shadow-2xs">
                  Institutional Secretariat
                </span>
                <h2 className="font-serif text-3xl font-light text-[#24272B] tracking-tight mt-3">
                  Visit CUBE Headquarters
                </h2>
                <p className="text-xs sm:text-sm text-[#747B83] mt-2 leading-relaxed">
                  Located within the premier innovation ecosystem of IIT Madras Research Park in Chennai.
                </p>
              </div>

              {/* Coordinates List in Glass Panel */}
              <GlassPanel variant="card" className="p-6 sm:p-7 space-y-5 text-xs text-[#747B83]">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-[#C4921B] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#24272B] block mb-0.5">Physical Address:</span>
                    <p className="leading-relaxed">{contactInfo.address}</p>
                    <a
                      href={contactInfo.googleMapsLiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-[#2B3B44] hover:text-[#C4921B] mt-2 underline"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start pt-3 border-t border-[#E5E7EB]">
                  <Mail className="w-5 h-5 text-[#C4921B] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#24272B] block mb-0.5">Email Communications:</span>
                    <a href={`mailto:${contactInfo.email}`} className="text-[#2B3B44] hover:text-[#C4921B] font-semibold underline">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start pt-3 border-t border-[#E5E7EB]">
                  <Phone className="w-5 h-5 text-[#C4921B] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#24272B] block mb-0.5">Telephone Enquiries:</span>
                    <a href={`tel:${contactInfo.phone}`} className="text-[#2B3B44] hover:text-[#C4921B] font-semibold underline">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start pt-3 border-t border-[#E5E7EB]">
                  <Clock className="w-5 h-5 text-[#C4921B] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#24272B] block mb-0.5">Working Hours:</span>
                    <p>{contactInfo.workingHours}</p>
                  </div>
                </div>
              </GlassPanel>

              {/* Google Maps Embed with Frosted Frame */}
              <div className="rounded-3xl overflow-hidden border border-[#D8CDB8] shadow-sm h-72 relative">
                <iframe
                  title="CUBE IIT Madras Research Park Location"
                  src={contactInfo.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={contactInfo.googleMapsLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#2B3B44] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-[#D8CDB8] flex items-center hover:bg-[#F5EFE4] transition"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-[#C4921B]" />
                </a>
              </div>
            </div>

            {/* Right 7 Cols: Real-Time Technical Enquiry Form in Apple Liquid Glass */}
            <div className="lg:col-span-7">
              <GlassPanel variant="panel" className="p-8 sm:p-10 border border-[#D8CDB8]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2B3B44] bg-[#F5EFE4] border border-[#D8CDB8] px-3 py-1 rounded-full shadow-2xs">
                  Real-Time Enquiry Dispatch
                </span>
                <h2 className="font-serif text-3xl font-light text-[#24272B] tracking-tight mt-3 mb-2">
                  Send a Technical Enquiry
                </h2>
                <p className="text-xs sm:text-sm text-[#747B83] mb-8 leading-relaxed">
                  Submit project scopes for structural assurance, hydrological assessment, transit planning, or laboratory characterization. Real-time logging connects directly to the administrative console and institutional mailbox.
                </p>

                {submitted ? (
                  <div className="p-8 rounded-3xl bg-white border border-[#D8CDB8] text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                    <h3 className="text-xl font-bold font-serif text-[#24272B]">
                      Enquiry Successfully Transmitted
                    </h3>
                    <p className="text-xs sm:text-sm text-[#747B83] leading-relaxed max-w-md mx-auto">
                      Thank you. Your scope has been registered in the CUBE Technical Secretariat database. Our engineering division will reach out within 24-48 business hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#F5EFE4] text-[#2B3B44] border border-[#D8CDB8]"
                    >
                      Submit Another Enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {errorMsg && (
                      <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
                        {errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D8CDB8] text-xs text-[#24272B] focus:outline-none focus:border-[#2B3B44] shadow-2xs"
                          placeholder="Prof. / Er. / Mr. / Ms."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                          Official Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D8CDB8] text-xs text-[#24272B] focus:outline-none focus:border-[#2B3B44] shadow-2xs"
                          placeholder="name@organization.gov.in"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                          Phone / Mobile *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D8CDB8] text-xs text-[#24272B] focus:outline-none focus:border-[#2B3B44] shadow-2xs"
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                          Organization / Department
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D8CDB8] text-xs text-[#24272B] focus:outline-none focus:border-[#2B3B44] shadow-2xs"
                          placeholder="e.g. TNUHDB, CMDA, CPCL, IITM"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                        Technical Discipline Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.enquiryCategory}
                        onChange={(e) => setFormData({ ...formData, enquiryCategory: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D8CDB8] text-xs text-[#24272B] focus:outline-none focus:border-[#2B3B44] shadow-2xs"
                        placeholder="Type discipline manually (e.g. Building & Construction, Environment, Smart Cities, Testing...)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                        Project Scope Description *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#D8CDB8] text-xs text-[#24272B] focus:outline-none focus:border-[#2B3B44] shadow-2xs"
                        placeholder="Detail site location, building footprint, sample volume, testing parameters, or desired consultancy engagement..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-full text-xs font-semibold text-white bg-[#2B3B44] hover:bg-[#C4921B] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Transmitting to CUBE Secretariat...</span>
                        </>
                      ) : (
                        <>
                          <span>Transmit Technical Enquiry</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </GlassPanel>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
