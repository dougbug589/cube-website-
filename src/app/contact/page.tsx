'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHeader from '@/components/common/PageHeader';
import { MapPin, Mail, Phone, Send, Check, Copy, ArrowUpRight, Loader2, ArrowLeft } from 'lucide-react';
import { contactInfo } from '@/data/contact';
import { submitEnquiryAction } from '@/app/actions/enquiries';
import { FIELD, LABEL } from '@/components/common/formStyles';
import { SOCIAL } from '@/components/layout/Footer';

// Quick picks for the subject: the four verticals, the laboratory and the
// other pages people write about. Typing a custom subject still works.
const TOPICS = [
  'Building & Construction',
  'Environment & Sustainability',
  'Smart Cities',
  'Urban Planning & Transportation',
  'CEL laboratory',
  'Tenders',
  'Careers',
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Copy-to-clipboard pill with a springy "Copied" confirmation. */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {
          /* clipboard blocked: the link itself still works */
        }
      }}
      aria-label={`Copy ${label}`}
      className="press relative z-10 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white/[0.06] border border-white/10 text-[14px] font-bold text-[#C2CCD1] hover:text-[#F3F5F6] depth-1 transition-colors"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? 'done' : 'copy'}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          className="inline-flex items-center gap-1.5"
        >
          {done ? <Check size={15} strokeWidth={2.5} className="text-[#2F9A5B]" /> : <Copy size={14} strokeWidth={2.25} />}
          {done ? 'Copied' : 'Copy'}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    enquiryCategory: '',
    message: '',
  });
  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((f) => ({ ...f, [k]: e.target.value }));

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
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="Contact"
        title="Contact Us"
        description={`${contactInfo.organization}, IIT Madras Research Park, Chennai.`}
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      {/* 1 · Ways to reach CUBE (labels as on cubeiitm.org) */}
      <section className="shell">
        <div className="grid gap-4 lg:gap-5 md:grid-cols-2 xl:grid-cols-4 reveal-stagger">
          {/* Meet us */}
          <a
            href={contactInfo.googleMapsLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press group glass glass-interactive glass-edge rounded-[28px] p-7 flex flex-col md:col-span-2 xl:col-span-1 xl:row-span-1"
          >
            <span className="grid place-items-center w-14 h-14 rounded-[18px] pill-yellow text-[#0B0D0E] depth-1">
              <MapPin size={24} strokeWidth={2} />
            </span>
            <span className="mt-6 label-mono">Meet us</span>
            <span className="mt-2 text-[16.5px] text-[#F3F5F6] font-semibold leading-relaxed">{contactInfo.address}</span>
            <span className="mt-auto pt-6 inline-flex items-center gap-2 text-[15.5px] font-bold text-[#F3F5F6] group-hover:text-[#F6C22E] transition-colors">
              Open in Google Maps
              <ArrowUpRight size={16} strokeWidth={2.25} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </a>

          {/* Drop a mail */}
          <div className="group relative glass glass-interactive glass-edge rounded-[28px] p-7 flex flex-col">
            <span className="grid place-items-center w-14 h-14 rounded-[18px] pill-yellow text-[#0B0D0E] depth-1">
              <Mail size={24} strokeWidth={2} />
            </span>
            <span className="mt-6 label-mono">Drop a mail</span>
            <span className="mt-2 font-display text-[22px] font-extrabold text-[#F3F5F6] break-all">{contactInfo.email}</span>
            <span className="mt-auto pt-6 flex items-center justify-between gap-3">
              {/* stretched link: the whole card opens the mail app */}
              <a href={`mailto:${contactInfo.email}`} className="inline-flex items-center gap-2 text-[15.5px] font-bold text-[#F3F5F6] group-hover:text-[#F6C22E] transition-colors after:absolute after:inset-0 after:rounded-[28px]">
                Write to us
                <ArrowUpRight size={16} strokeWidth={2.25} />
              </a>
              <CopyButton value={contactInfo.email} label="email address" />
            </span>
          </div>

          {/* Let's talk */}
          <div className="group relative glass glass-interactive glass-edge rounded-[28px] p-7 flex flex-col">
            <span className="grid place-items-center w-14 h-14 rounded-[18px] pill-yellow text-[#0B0D0E] depth-1">
              <Phone size={24} strokeWidth={2} />
            </span>
            <span className="mt-6 label-mono">Let&apos;s talk</span>
            <span className="mt-2 font-display text-[26px] font-extrabold text-[#F3F5F6] tabular-nums">{contactInfo.phone}</span>
            <span className="mt-auto pt-6 flex items-center justify-between gap-3">
              <a href={`tel:${contactInfo.phoneTel}`} className="inline-flex items-center gap-2 text-[15.5px] font-bold text-[#F3F5F6] group-hover:text-[#F6C22E] transition-colors after:absolute after:inset-0 after:rounded-[28px]">
                Call the office
                <ArrowUpRight size={16} strokeWidth={2.25} />
              </a>
              <CopyButton value={contactInfo.phone} label="phone number" />
            </span>
          </div>

          {/* Follow us */}
          <div className="glass glass-edge rounded-[28px] p-7 flex flex-col">
            <span className="label-mono">Follow us</span>
            <ul className="mt-5 space-y-2.5">
              {SOCIAL.map(({ label, href, Icon, bg, glow }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press group flex items-center gap-3.5 rounded-2xl px-2 py-1.5 -mx-2 hover:bg-white/[0.07] transition-colors"
                  >
                    <span
                      style={{ backgroundColor: bg, ['--glow' as string]: glow } as React.CSSProperties}
                      className="social-chip grid place-items-center w-11 h-11 rounded-full text-white shrink-0"
                    >
                      <Icon size={17} />
                    </span>
                    <span className="text-[16px] font-bold text-[#F3F5F6]">{label.replace('CUBE on ', '')}</span>
                    <ArrowUpRight size={15} strokeWidth={2.25} className="ml-auto text-[#F6C22E] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 2 · Enquiry form beside the map */}
      <section className="shell py-12 lg:py-16 pb-24">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-7 glass glass-edge rounded-[30px] p-6 sm:p-9 reveal">
            <p className="label-mono">Let&apos;s get in touch</p>
            <h2 className="mt-3 headline-light text-3xl sm:text-[2.4rem] text-[#F3F5F6]">Send us a message</h2>

            <AnimatePresence mode="wait" initial={false}>
              {submitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className="py-12 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.4, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.05 }}
                    className="grid place-items-center w-20 h-20 mx-auto rounded-full pill-yellow text-[#0B0D0E] depth-2"
                  >
                    <Check size={36} strokeWidth={2.5} />
                  </motion.span>
                  <h3 className="mt-7 font-display text-[28px] font-extrabold text-[#F3F5F6]">Message sent</h3>
                  <p className="mt-3 text-[18.5px] text-[#C2CCD1] max-w-md mx-auto leading-relaxed">
                    Thank you for writing to CUBE. Our team will get back to you at the email address you gave.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="press btn-soft mt-8 h-12 px-6 rounded-full text-[15.5px] font-bold inline-flex items-center gap-2"
                  >
                    <ArrowLeft size={16} strokeWidth={2.25} />
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-5"
                >
                  <AnimatePresence>
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-[15px] font-semibold text-rose-800"
                      >
                        {errorMsg}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="ct-name" className={LABEL}>Name *</label>
                      <input id="ct-name" type="text" required autoComplete="name" value={formData.name} onChange={set('name')} className={FIELD} placeholder="Your full name" />
                    </div>
                    <div>
                      <label htmlFor="ct-email" className={LABEL}>Email *</label>
                      <input id="ct-email" type="email" required autoComplete="email" value={formData.email} onChange={set('email')} className={FIELD} placeholder="name@organisation.in" />
                    </div>
                    <div>
                      <label htmlFor="ct-phone" className={LABEL}>Phone *</label>
                      <input id="ct-phone" type="tel" required autoComplete="tel" value={formData.phone} onChange={set('phone')} className={FIELD} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label htmlFor="ct-org" className={LABEL}>Organisation</label>
                      <input id="ct-org" type="text" autoComplete="organization" value={formData.organization} onChange={set('organization')} className={FIELD} placeholder="Company, department or institution" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ct-subject" className={LABEL}>Subject *</label>
                    <input id="ct-subject" type="text" required value={formData.enquiryCategory} onChange={set('enquiryCategory')} className={FIELD} placeholder="Pick a topic below or type your own" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {TOPICS.map((t) => {
                        const on = formData.enquiryCategory === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData((f) => ({ ...f, enquiryCategory: t }))}
                            className={`press h-9 px-3.5 rounded-full text-[14px] font-bold border transition-colors duration-300 ${
                              on
                                ? 'pill-yellow border-transparent text-[#0B0D0E]'
                                : 'bg-white/[0.07] border-white/10 text-[#C2CCD1] hover:bg-white/[0.06] hover:text-[#F3F5F6]'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ct-msg" className={LABEL}>Message *</label>
                    <textarea
                      id="ct-msg"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={set('message')}
                      className={`${FIELD} h-auto py-3 leading-relaxed resize-y`}
                      placeholder="Tell us about your project, the location and what you need."
                    />
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="press btn-gold gold-shimmer w-full sm:w-auto h-12 px-8 rounded-full text-[15.5px] font-extrabold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send message
                          <Send size={16} strokeWidth={2.25} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Map */}
          <div className="lg:col-span-5 relative rounded-[30px] overflow-hidden depth-2 bg-[#1A1F22] min-h-[420px] reveal">
            <iframe
              title="CUBE at the IIT Madras Research Park"
              src={contactInfo.googleMapsEmbedUrl}
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute left-4 right-4 bottom-4 liquid-glass is-solid rounded-[22px] p-4 flex items-center gap-4">
              <span className="grid place-items-center w-11 h-11 rounded-2xl bg-[#F6C22E]/15 text-[#F6C22E] shrink-0">
                <MapPin size={19} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[16.5px] font-bold text-[#F3F5F6]">IIT Madras Research Park</span>
                <span className="block text-[14px] text-[#A7B2B8] truncate">Kanagam Road, Taramani, Chennai 600 113</span>
              </span>
              <a
                href={contactInfo.googleMapsLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="press btn-soft ml-auto h-10 px-4 rounded-full text-[14.5px] font-bold inline-flex items-center gap-1.5 shrink-0"
              >
                Directions
                <ArrowUpRight size={15} strokeWidth={2.25} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
