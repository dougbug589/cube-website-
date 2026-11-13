'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Check, Droplets, Loader2, Mail, MapPin, Phone, Recycle, Send, Waves } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { celOverview } from '@/data/cel';
import { contactInfo } from '@/data/contact';
import { submitEnquiryAction } from '@/app/actions/enquiries';
import { useLiveList } from '@/lib/live';
import { FIELD, LABEL } from '@/components/common/formStyles';

const PHOTOS = ['/images/cel/about_cel.jpg', '/images/cel/about_cel1.jpg', '/images/cel/about_cel2.jpg'];
const ICON: Record<string, React.ElementType> = { water: Droplets, wastewater: Waves, 'solid-waste': Recycle };

export default function CELPage() {
  // Live CMS data: updates instantly when an admin edits/archives a service.
  const testingServices = useLiveList<any>('/api/public/cel', celOverview.testingServices);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', organization: '', matrix: '', sampleCount: '', parametersNeeded: '' });
  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((f) => ({ ...f, [k]: e.target.value }));
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
    if (res.success) setFormSubmitted(true);
    else setErrorMsg(res.error || 'Failed to submit laboratory enquiry.');
    setLoading(false);
  };

  return (
    <div className="text-[#243239] min-h-screen">
      <PageHeader badge="Laboratory" title={celOverview.title} description={celOverview.description} breadcrumbs={[{ label: 'CEL Laboratory' }]} />

      {/* overview: what cubeiitm.org states about CEL, beside a photo mosaic */}
      <section className="shell">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-5 liquid-glass rounded-[32px] depth-2 p-8 sm:p-10 flex flex-col reveal">
            <p className="font-display text-[23px] sm:text-[26px] font-bold leading-[1.45] text-[#243239]">{celOverview.subtitle}</p>
            <p className="mt-5 text-[18px] text-[#46565E] leading-relaxed">{celOverview.location}</p>
            <div className="mt-auto pt-8 flex flex-wrap gap-3">
              <a href={celOverview.website} target="_blank" rel="noopener noreferrer" className="press btn-gold gold-shimmer inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-extrabold">
                Visit the CEL website <ArrowUpRight size={16} strokeWidth={2.25} />
              </a>
              <a href="#enquiry" className="press btn-soft inline-flex items-center gap-2 h-12 px-6 rounded-full text-[16px] font-bold">
                Testing enquiry
              </a>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 grid-rows-2 gap-4 min-h-[420px] lg:min-h-[520px] reveal-stagger">
            {PHOTOS.map((src, i) => (
              <div key={src} className={`relative rounded-[26px] overflow-hidden depth-1 bg-[#DCE4E8] ${i === 0 ? 'row-span-2' : ''}`}>
                <Image src={src} alt="CUBE Environmental Laboratory" fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover" priority={i === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* testing domains */}
      <section className="shell py-16 lg:py-20">
        <p className="label-mono reveal">Testing domains</p>
        <div className="mt-5 grid md:grid-cols-3 gap-5 reveal-stagger">
          {testingServices.map((service: any) => {
            const Icon = ICON[service.id] || Droplets;
            return (
              <div key={service.id || service.title} className="glass glass-interactive glass-edge rounded-[28px] p-8">
                <span className="grid place-items-center w-14 h-14 rounded-[18px] bg-gradient-to-b from-[#F8E3A3] to-[#F0C468] text-[#243239] depth-1">
                  <Icon size={24} strokeWidth={2} />
                </span>
                <h2 className="mt-6 font-display text-[28px] font-extrabold text-[#243239]">{service.title}</h2>
                {service.description && <p className="mt-2 text-[17.5px] text-[#46565E] leading-relaxed">{service.description}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* testing enquiry */}
      <section id="enquiry" className="scroll-mt-32 shell pb-24">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <aside className="lg:col-span-4 space-y-4 reveal-stagger">
            <div className="glass glass-edge rounded-[26px] p-7">
              <p className="label-mono">Where</p>
              <p className="mt-3 flex items-start gap-3 text-[17px] text-[#243239] leading-relaxed">
                <MapPin size={19} className="text-[#C4921B] mt-1 shrink-0" />
                {contactInfo.address}
              </p>
            </div>
            <div className="glass glass-edge rounded-[26px] p-7 space-y-3">
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 text-[17px] font-bold text-[#243239] hover:text-[#9A7015] transition-colors">
                <Mail size={19} className="text-[#C4921B]" /> {contactInfo.email}
              </a>
              <a href={`tel:${contactInfo.phoneTel}`} className="flex items-center gap-3 text-[17px] font-bold text-[#243239] hover:text-[#9A7015] transition-colors">
                <Phone size={19} className="text-[#C4921B]" /> {contactInfo.phone}
              </a>
            </div>
          </aside>

          <div className="lg:col-span-8 glass glass-edge rounded-[30px] p-6 sm:p-9 reveal">
            <p className="label-mono">Testing enquiry</p>
            <h2 className="mt-3 headline-light text-3xl sm:text-[2.4rem] text-[#243239]">Send sample details</h2>

            <AnimatePresence mode="wait" initial={false}>
              {formSubmitted ? (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} className="py-12 text-center">
                  <motion.span
                    initial={{ scale: 0.4, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.05 }}
                    className="grid place-items-center w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-[#F8E3A3] to-[#F0C468] text-[#243239] depth-2"
                  >
                    <Check size={36} strokeWidth={2.5} />
                  </motion.span>
                  <h3 className="mt-7 font-display text-[28px] font-extrabold text-[#243239]">Enquiry sent</h3>
                  <p className="mt-3 text-[16.5px] text-[#5B6A71] max-w-md mx-auto leading-relaxed">Thank you. The team will get back to you at the email address you gave.</p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', organization: '', matrix: '', sampleCount: '', parametersNeeded: '' });
                    }}
                    className="press btn-soft mt-8 h-12 px-6 rounded-full text-[15.5px] font-bold inline-flex items-center gap-2"
                  >
                    <ArrowLeft size={16} strokeWidth={2.25} /> Send another enquiry
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleEnquirySubmit} className="mt-8 space-y-5">
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-[15px] font-semibold text-rose-800">
                        {errorMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="cel-name" className={LABEL}>Name *</label>
                      <input id="cel-name" type="text" required autoComplete="name" value={formData.name} onChange={set('name')} className={FIELD} placeholder="Your full name" />
                    </div>
                    <div>
                      <label htmlFor="cel-email" className={LABEL}>Email *</label>
                      <input id="cel-email" type="email" required autoComplete="email" value={formData.email} onChange={set('email')} className={FIELD} placeholder="name@organisation.in" />
                    </div>
                    <div>
                      <label htmlFor="cel-phone" className={LABEL}>Phone *</label>
                      <input id="cel-phone" type="tel" required autoComplete="tel" value={formData.phone} onChange={set('phone')} className={FIELD} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label htmlFor="cel-org" className={LABEL}>Organisation</label>
                      <input id="cel-org" type="text" autoComplete="organization" value={formData.organization} onChange={set('organization')} className={FIELD} placeholder="Company, department or institution" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cel-matrix" className={LABEL}>Sample type *</label>
                    <input id="cel-matrix" type="text" required value={formData.matrix} onChange={set('matrix')} className={FIELD} placeholder="Water, wastewater or solid waste" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {testingServices.map((s: any) => {
                        const on = formData.matrix === s.title;
                        return (
                          <button
                            key={s.title}
                            type="button"
                            onClick={() => setFormData((f) => ({ ...f, matrix: s.title }))}
                            className={`press h-9 px-3.5 rounded-full text-[14px] font-bold border transition-colors duration-300 ${
                              on ? 'bg-gradient-to-b from-[#F8E3A3] to-[#F0C468] border-[#C4921B]/30 text-[#243239]' : 'bg-white/70 border-[#33454E]/10 text-[#46565E] hover:bg-white hover:text-[#243239]'
                            }`}
                          >
                            {s.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cel-count" className={LABEL}>Number of samples *</label>
                    <input id="cel-count" type="text" required value={formData.sampleCount} onChange={set('sampleCount')} className={FIELD} placeholder="For example, 5 samples" />
                  </div>
                  <div>
                    <label htmlFor="cel-notes" className={LABEL}>Parameters and notes</label>
                    <textarea id="cel-notes" rows={4} value={formData.parametersNeeded} onChange={set('parametersNeeded')} className={`${FIELD} h-auto py-3 leading-relaxed resize-y`} placeholder="Parameters you need tested and where the samples are from" />
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button type="submit" disabled={loading} className="press btn-gold gold-shimmer w-full sm:w-auto h-12 px-8 rounded-full text-[15.5px] font-extrabold inline-flex items-center justify-center gap-2 disabled:opacity-60">
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          Send enquiry <Send size={16} strokeWidth={2.25} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
