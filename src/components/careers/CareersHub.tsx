'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageHeader from '@/components/common/PageHeader';
import SectionHeading from '@/components/common/SectionHeading';
import ComboSelect from '@/components/admin/ComboSelect';
import { FIELD, LABEL } from '@/components/common/formStyles';
import {
  Briefcase, Send, CheckCircle2, Mail, MapPin,
  Upload, FileText, Sparkles, Building2, Users,
  Globe, Award, Check, X, CalendarDays, Clock,
  GraduationCap, FlaskConical, ArrowUpRight, ArrowLeft,
} from 'lucide-react';
import {
  CareersPageContent, CareerBenefitIcon, DEFAULT_CAREERS_PAGE,
} from '@/lib/careers-page';

const BENEFIT_ICONS: Record<CareerBenefitIcon, React.ElementType> = {
  award: Award,
  building: Building2,
  globe: Globe,
  briefcase: Briefcase,
  sparkles: Sparkles,
  users: Users,
  graduation: GraduationCap,
  flask: FlaskConical,
};

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.8 };
const EASE = [0.22, 1, 0.36, 1] as const;

interface CareersHubProps {
  initialCareers: any[];
  content?: CareersPageContent;
}

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const qualificationList = (job: any): string[] => {
  const q = job?.qualifications;
  if (Array.isArray(q)) return q.filter((x) => typeof x === 'string' && x.trim());
  if (typeof q === 'string') return q.split('\n').map((x) => x.trim()).filter(Boolean);
  return [];
};

export default function CareersHub({ initialCareers, content = DEFAULT_CAREERS_PAGE }: CareersHubProps) {
  const c = content;
  const form = c.applicationForm;

  const [activeTab, setActiveTab] = useState<'openings' | 'portal'>('openings');
  const hubRef = useRef<HTMLDivElement>(null);

  // Application form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState(form.experienceOptions[0] || '');
  const [domain, setDomain] = useState(form.domainOptions[0] || '');
  const [jobTitle, setJobTitle] = useState(form.defaultJobTitle);
  // Dropdown choices: the general talent pool + every live opening (newest first,
  // as published by admin). ComboSelect removes duplicates and allows typing.
  const positionOptions = [
    form.defaultJobTitle,
    ...initialCareers.map((job) => job?.title).filter((t): t is string => typeof t === 'string' && t.trim() !== ''),
  ];
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Job detail modal
  const [detailJob, setDetailJob] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!detailJob) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailJob(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [detailJob]);

  // Bring the tab bar into view (below the sticky top bar) after switching.
  const scrollToHub = () => {
    requestAnimationFrame(() => hubRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const handleApplyClick = (job: any) => {
    setDetailJob(null);
    setJobTitle(job.title);
    setSubmitSuccess(false);
    setActiveTab('portal');
    scrollToHub();
  };

  const openPortal = () => {
    setJobTitle(form.defaultJobTitle);
    setActiveTab('portal');
    scrollToHub();
  };

  const acceptFile = (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Resume file size cannot exceed 10MB.');
      return;
    }
    setResumeFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFile(e.target.files?.[0]);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setSubmitError('Please fill in your full name and email address.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append('fullName', fullName);
      fd.append('email', email);
      fd.append('phone', phone);
      fd.append('experience', experience);
      fd.append('domain', domain);
      fd.append('jobTitle', jobTitle);
      fd.append('coverLetter', coverLetter);
      if (resumeFile) {
        fd.append('resume', resumeFile);
      }

      const res = await fetch('/api/public/careers/apply', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setFullName('');
        setEmail('');
        setPhone('');
        setCoverLetter('');
        setResumeFile(null);
      } else {
        setSubmitError(data.error || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      setSubmitError(`Network error while uploading resume. Please email ${c.contactEmail} directly.`);
    } finally {
      setSubmitting(false);
    }
  };

  const detailEmail = detailJob?.applicationEmail || c.contactEmail;
  const detailQualifications = detailJob ? qualificationList(detailJob) : [];
  const selectedJob = initialCareers.find((j) => j?.title === jobTitle);

  const TABS = [
    { id: 'openings' as const, label: c.tabs.openingsLabel, count: initialCareers.length, Icon: Briefcase },
    { id: 'portal' as const, label: c.tabs.portalLabel, Icon: Upload },
  ];

  /* ─────────────────────────── job detail sheet ─────────────────────────── */
  const modal = (
    <AnimatePresence>
      {detailJob && (
        <motion.div
          key="job-detail-overlay"
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#243239]/35 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setDetailJob(null)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-detail-title"
            className="liquid-glass is-solid relative w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-[30px] sm:rounded-[30px] overflow-hidden depth-3"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative shrink-0 px-6 sm:px-9 pt-8 pb-6 border-b border-white/10">
              <button
                onClick={() => setDetailJob(null)}
                aria-label="Close job details"
                className="press jiggle absolute top-5 right-5 h-10 w-10 rounded-full bg-white/[0.06] border border-white/10 text-[#F3F5F6] depth-1 grid place-items-center hover:bg-[#F6C22E] hover:text-[#0B0D0E] hover:border-[#F6C22E] transition-colors"
              >
                <X size={18} strokeWidth={2.25} />
              </button>

              <div className="flex flex-wrap items-center gap-2 pr-12">
                {detailJob.department && (
                  <span className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1 text-[13.5px] font-bold text-[#C2CCD1]">
                    {detailJob.department}
                  </span>
                )}
                {detailJob.employmentType && (
                  <span className="rounded-full pill-yellow border px-3 py-1 text-[13.5px] font-bold text-[#0B0D0E]">
                    {detailJob.employmentType}
                  </span>
                )}
              </div>

              <h2 id="job-detail-title" className="mt-3 font-display text-[26px] sm:text-[30px] font-extrabold text-[#F3F5F6] leading-tight pr-12">
                {detailJob.title}
              </h2>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#C2CCD1] font-semibold">
                {detailJob.location && (
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#F6C22E]" />
                    {detailJob.location}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-[#F6C22E]" />
                  {detailJob.closingDate ? `Apply by ${formatDate(detailJob.closingDate)}` : 'Open until filled'}
                </span>
              </div>
            </div>

            {/* Body (scrolls) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-9 py-7 space-y-7 bg-white/[0.05]">
              {detailJob.experience && (
                <div className="flex items-start gap-3 rounded-2xl bg-white/[0.06] border border-white/10 p-4">
                  <Clock size={18} className="text-[#F6C22E] mt-0.5 shrink-0" />
                  <p className="text-[16px] text-[#F3F5F6] leading-relaxed">{detailJob.experience}</p>
                </div>
              )}

              {detailJob.description && (
                <div>
                  <p className="label-mono">Role</p>
                  <p className="mt-3 text-[19px] text-[#DDE3E6] leading-relaxed whitespace-pre-line">{detailJob.description}</p>
                </div>
              )}

              {detailQualifications.length > 0 && (
                <div>
                  <p className="label-mono">Skills &amp; requirements</p>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-2.5">
                    {detailQualifications.map((q, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-2xl bg-white/[0.08] border border-white/[0.09] px-4 py-3 text-[15.5px] text-[#F3F5F6] leading-snug">
                        <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#F6C22E]" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.jobDetail.howToApplySteps.length > 0 && (
                <div className="rounded-[22px] glass border border-[#F6C22E]/40 p-5 sm:p-6">
                  <p className="font-display text-[17px] font-bold text-[#F3F5F6]">{c.jobDetail.howToApplyTitle}</p>
                  <ol className="mt-3 space-y-2.5">
                    {c.jobDetail.howToApplySteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-[18px] text-[#DDE3E6] leading-relaxed">
                        <span className="grid place-items-center w-6 h-6 rounded-full pill-yellow text-[13.5px] font-extrabold text-[#0B0D0E] shrink-0 mt-0.5">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 text-[17px] text-[#C2CCD1]">
                    Questions? Write to{' '}
                    <a href={`mailto:${detailEmail}`} className="font-bold text-[#F3F5F6] hover:text-[#F6C22E] underline underline-offset-4 decoration-[#F6C22E]/50">
                      {detailEmail}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions (always visible) */}
            <div className="shrink-0 px-6 sm:px-9 py-5 border-t border-white/10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <a
                href={`mailto:${detailEmail}?subject=${encodeURIComponent(`Application: ${detailJob.title}`)}`}
                className="press btn-soft h-12 px-6 rounded-full text-[15.5px] font-bold inline-flex items-center justify-center gap-2"
              >
                <Mail size={16} className="text-[#F6C22E]" />
                Email application
              </a>
              <button
                onClick={() => handleApplyClick(detailJob)}
                className="press btn-gold gold-shimmer h-12 px-7 rounded-full text-[15.5px] font-extrabold inline-flex items-center justify-center gap-2"
              >
                Apply &amp; upload CV
                <ArrowUpRight size={16} strokeWidth={2.25} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ────────────────────────────── page ────────────────────────────── */
  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge={c.header.badge}
        title={c.header.title}
        description={c.header.description}
        breadcrumbs={[{ label: 'Careers' }]}
      />

      {/* Tab bar: liquid-glass capsule with a springing gold pill, contact on the right */}
      <div ref={hubRef} className="scroll-mt-28 shell">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div role="tablist" aria-label="Careers" className="liquid-glass is-solid w-full sm:w-auto self-start rounded-[26px] sm:rounded-full p-1 flex items-stretch gap-0.5">
            {TABS.map(({ id, label, count, Icon }) => {
              const on = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => (id === 'portal' ? openPortal() : setActiveTab('openings'))}
                  className={`press relative flex-1 sm:flex-none min-h-11 py-2 px-4 sm:px-5 rounded-[22px] sm:rounded-full text-[15px] leading-tight text-left sm:whitespace-nowrap flex items-center gap-2 transition-colors duration-300 ${
                    on ? 'text-[#0B0D0E] font-bold' : 'text-[#C2CCD1] font-semibold hover:text-[#F3F5F6]'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="careers-tab-pill"
                      transition={SPRING}
                      className="absolute inset-0 rounded-[22px] sm:rounded-full pill-yellow"
                    />
                  )}
                  <Icon size={16} strokeWidth={2.25} className={`relative shrink-0 ${on ? 'text-[#0B0D0E]' : 'text-[#F6C22E]'}`} />
                  <span className="relative">{label}</span>
                  {typeof count === 'number' && (
                    <span className={`relative shrink-0 grid place-items-center min-w-6 h-6 px-1.5 rounded-full text-[13.5px] font-extrabold tabular-nums ${on ? 'bg-black/10' : 'bg-white/[0.08]'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {c.contactEmail && (
            <a
              href={`mailto:${c.contactEmail}`}
              className="group self-start md:self-auto inline-flex items-center gap-3 rounded-full glass glass-edge pl-2 pr-5 h-12 text-[15px]"
            >
              <span className="grid place-items-center w-9 h-9 rounded-full pill-yellow text-[#0B0D0E]">
                <Mail size={16} strokeWidth={2.25} />
              </span>
              <span className="text-[#A7B2B8] font-semibold hidden sm:inline">{c.contactLabel}</span>
              <span className="font-bold text-[#F3F5F6] group-hover:text-[#F6C22E] transition-colors">{c.contactEmail}</span>
            </a>
          )}
        </div>
      </div>

      <section className="py-12 lg:py-16">
        <div className="shell">
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'openings' ? (
              <motion.div
                key="openings"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="space-y-6"
              >
                {initialCareers.length === 0 ? (
                  <div className="liquid-glass rounded-[30px] p-10 sm:p-14 text-center max-w-3xl mx-auto">
                    <span className="grid place-items-center w-16 h-16 mx-auto rounded-[20px] pill-yellow text-[#0B0D0E] depth-1">
                      <Briefcase size={28} strokeWidth={2} />
                    </span>
                    <h3 className="mt-6 font-display text-[26px] font-extrabold text-[#F3F5F6]">{c.emptyState.title}</h3>
                    <p className="mt-3 text-[18.5px] text-[#C2CCD1] max-w-lg mx-auto leading-relaxed">{c.emptyState.description}</p>
                    <button
                      onClick={openPortal}
                      className="press btn-gold gold-shimmer mt-7 h-12 px-7 rounded-full text-[15.5px] font-extrabold inline-flex items-center gap-2"
                    >
                      {c.emptyState.buttonLabel}
                      <ArrowUpRight size={16} strokeWidth={2.25} />
                    </button>
                  </div>
                ) : (
                  <div className={`grid gap-5 ${initialCareers.length > 1 ? 'lg:grid-cols-2' : ''}`}>
                    {initialCareers.map((job) => {
                      const quals = qualificationList(job);
                      const single = initialCareers.length === 1;
                      return (
                        <article
                          key={job.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`View details for ${job.title}`}
                          onClick={() => setDetailJob(job)}
                          onKeyDown={(e) => {
                            if (e.target !== e.currentTarget) return;
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setDetailJob(job);
                            }
                          }}
                          className={`press group cursor-pointer glass glass-interactive glass-edge rounded-[30px] p-7 sm:p-9 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C22E]/50 ${
                            single ? 'grid lg:grid-cols-12 gap-8 lg:gap-12' : 'flex flex-col'
                          }`}
                        >
                          <div className={single ? 'lg:col-span-7 flex flex-col' : 'flex flex-col flex-1'}>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F9A5B]/15 border border-[#2F9A5B]/35 px-3 py-1 text-[13.5px] font-bold text-[#8FE0AE]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2F9A5B]" />
                                Open
                              </span>
                              {job.department && (
                                <span className="rounded-full bg-white/[0.08] border border-white/10 px-3 py-1 text-[13.5px] font-bold text-[#C2CCD1]">{job.department}</span>
                              )}
                              {job.employmentType && (
                                <span className="rounded-full pill-yellow border px-3 py-1 text-[13.5px] font-bold text-[#0B0D0E]">{job.employmentType}</span>
                              )}
                            </div>

                            <h3 className="mt-4 font-display text-[26px] sm:text-[32px] font-extrabold text-[#F3F5F6] leading-tight">{job.title}</h3>

                            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold text-[#C2CCD1]">
                              {job.location && (
                                <span className="flex items-center gap-2">
                                  <MapPin size={16} className="text-[#F6C22E]" />
                                  {job.location}
                                </span>
                              )}
                              {job.closingDate && (
                                <span className="flex items-center gap-2">
                                  <CalendarDays size={16} className="text-[#F6C22E]" />
                                  Apply by {formatDate(job.closingDate)}
                                </span>
                              )}
                            </div>

                            {job.experience && (
                              <p className="mt-5 flex items-start gap-2.5 text-[16px] text-[#F3F5F6] leading-relaxed">
                                <Clock size={17} className="text-[#F6C22E] mt-1 shrink-0" />
                                <span>{job.experience}</span>
                              </p>
                            )}
                            <p className="mt-3 text-[18px] text-[#C2CCD1] leading-relaxed line-clamp-3">{job.description}</p>

                            <div className="mt-auto pt-7 flex flex-wrap items-center gap-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApplyClick(job); }}
                                className="press btn-gold gold-shimmer h-12 px-6 rounded-full text-[15.5px] font-extrabold inline-flex items-center gap-2"
                              >
                                Apply &amp; upload CV
                                <ArrowUpRight size={16} strokeWidth={2.25} />
                              </button>
                              <span className="h-12 px-5 rounded-full inline-flex items-center gap-2 text-[15.5px] font-bold text-[#F3F5F6] group-hover:text-[#F6C22E] transition-colors">
                                View full details
                                <ArrowUpRight size={16} strokeWidth={2.25} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </span>
                            </div>
                          </div>

                          {quals.length > 0 && (
                            <div className={single ? 'lg:col-span-5 rounded-[24px] bg-white/[0.07] border border-white/[0.09] p-6' : 'mt-6 pt-6 border-t border-white/10'}>
                              <p className="label-mono">Skills &amp; requirements</p>
                              <ul className="mt-4 flex flex-wrap gap-2">
                                {(single ? quals : quals.slice(0, 4)).map((q) => (
                                  <li key={q} className="rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5 text-[14px] font-semibold text-[#C2CCD1] leading-snug">
                                    {q}
                                  </li>
                                ))}
                                {!single && quals.length > 4 && (
                                  <li className="rounded-full pill-yellow px-3 py-1.5 text-[14px] font-bold text-[#0B0D0E]">+{quals.length - 4} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Talent network callout */}
                <div className="rounded-[30px] liquid-glass border border-[#F6C22E]/40 depth-1 p-7 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-7">
                  <div className="flex items-start gap-5 max-w-3xl">
                    <span className="hidden sm:grid place-items-center w-14 h-14 rounded-[18px] bg-white/[0.08] text-[#F6C22E] depth-1 shrink-0">
                      <Users size={24} strokeWidth={2} />
                    </span>
                    <div>
                      <p className="label-mono">{c.talentCallout.badge}</p>
                      <h3 className="mt-2 font-display text-[24px] sm:text-[28px] font-extrabold text-[#F3F5F6] leading-tight">{c.talentCallout.heading}</h3>
                      <p className="mt-2 text-[19px] text-[#DDE3E6] leading-relaxed">{c.talentCallout.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={openPortal}
                    className="press btn-soft self-start lg:self-auto h-12 px-7 rounded-full text-[15.5px] font-extrabold inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    {c.talentCallout.buttonLabel}
                    <ArrowUpRight size={16} strokeWidth={2.25} />
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ───────────── application form ───────────── */
              <motion.div
                key="portal"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start"
              >
                {/* Summary rail */}
                <aside className="lg:col-span-4 lg:sticky lg:top-[calc(var(--nav-offset,93px)+1.5rem)] space-y-4">
                  <div className="liquid-glass rounded-[28px] p-7">
                    <p className="label-mono">{form.badge}</p>
                    <h2 className="mt-3 font-display text-[26px] font-extrabold text-[#F3F5F6] leading-tight">{form.heading}</h2>
                    <div className="mt-6 rounded-[20px] bg-white/[0.08] border border-white/10 p-5">
                      <p className="text-[14px] font-bold text-[#A7B2B8]">Applying for</p>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                          key={jobTitle}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="mt-1 font-display text-[19px] font-bold text-[#F3F5F6] leading-snug"
                        >
                          {jobTitle || form.defaultJobTitle}
                        </motion.p>
                      </AnimatePresence>
                      {selectedJob?.location && (
                        <p className="mt-2 flex items-center gap-2 text-[17px] font-semibold text-[#DDE3E6]">
                          <MapPin size={15} className="text-[#F6C22E]" />
                          {selectedJob.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {c.jobDetail.howToApplySteps.length > 0 && (
                    <div className="hidden lg:block glass glass-edge rounded-[24px] p-6">
                      <p className="font-display text-[17px] font-bold text-[#F3F5F6]">{c.jobDetail.howToApplyTitle}</p>
                      <ol className="mt-4 space-y-3">
                        {c.jobDetail.howToApplySteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-3 text-[17.5px] text-[#DDE3E6] leading-relaxed">
                            <span className="grid place-items-center w-6 h-6 rounded-full pill-yellow text-[13.5px] font-extrabold text-[#0B0D0E] shrink-0 mt-0.5">{i + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      {c.contactEmail && (
                        <a href={`mailto:${c.contactEmail}`} className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2.5 text-[15px] font-bold text-[#F3F5F6] hover:text-[#F6C22E] transition-colors">
                          <Mail size={16} className="text-[#F6C22E]" />
                          {c.contactEmail}
                        </a>
                      )}
                    </div>
                  )}
                </aside>

                {/* Form card */}
                <div className="lg:col-span-8 glass glass-edge rounded-[30px] p-6 sm:p-9">
                  <AnimatePresence mode="wait" initial={false}>
                    {submitSuccess ? (
                      <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        className="py-10 sm:py-14 text-center"
                      >
                        <motion.span
                          initial={{ scale: 0.4, rotate: -12 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.05 }}
                          className="grid place-items-center w-20 h-20 mx-auto rounded-full pill-yellow text-[#0B0D0E] depth-2"
                        >
                          <Check size={36} strokeWidth={2.5} />
                        </motion.span>
                        <h3 className="mt-7 font-display text-[28px] font-extrabold text-[#F3F5F6]">{form.successTitle}</h3>
                        <p className="mt-3 text-[18.5px] text-[#C2CCD1] max-w-md mx-auto leading-relaxed">{form.successMessage}</p>
                        <button
                          onClick={() => { setSubmitSuccess(false); setActiveTab('openings'); }}
                          className="press btn-soft mt-8 h-12 px-6 rounded-full text-[15.5px] font-bold inline-flex items-center gap-2"
                        >
                          <ArrowLeft size={16} strokeWidth={2.25} />
                          Back to openings
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmitApplication}
                        className="space-y-6"
                      >
                        <AnimatePresence>
                          {submitError && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-[15px] font-semibold text-rose-800"
                            >
                              {submitError}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label htmlFor="cf-name" className={LABEL}>Full name *</label>
                            <input id="cf-name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Dr. K. Ramesh" autoComplete="name" className={FIELD} />
                          </div>
                          <div>
                            <label htmlFor="cf-email" className={LABEL}>Email address *</label>
                            <input id="cf-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ramesh@example.com" autoComplete="email" className={FIELD} />
                          </div>
                          <div>
                            <label htmlFor="cf-phone" className={LABEL}>Phone number *</label>
                            <input id="cf-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" className={FIELD} />
                          </div>
                          <div>
                            <label htmlFor="cf-exp" className={LABEL}>Total relevant experience</label>
                            <select id="cf-exp" value={experience} onChange={(e) => setExperience(e.target.value)} className={FIELD}>
                              {form.experienceOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="cf-domain" className={LABEL}>Primary domain</label>
                            <select id="cf-domain" value={domain} onChange={(e) => setDomain(e.target.value)} className={FIELD}>
                              {form.domainOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <span className={LABEL}>Position</span>
                            {/* All live openings (plus the general pool); candidates can also type their own. */}
                            <ComboSelect
                              value={jobTitle}
                              onChange={setJobTitle}
                              options={positionOptions}
                              placeholder="Select or type the position"
                              inputClassName={`${FIELD} pr-10 cursor-pointer`}
                            />
                          </div>
                        </div>

                        {/* Resume drop zone */}
                        <div>
                          <span className={LABEL}>Resume / CV (PDF or DOCX, max 10 MB) *</span>
                          <label
                            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]); }}
                            className={`relative block rounded-[22px] border-2 border-dashed p-7 text-center cursor-pointer transition-[background-color,border-color,transform] duration-300 ${
                              dragging
                                ? 'border-[#F6C22E] bg-white/[0.08] scale-[1.01]'
                                : resumeFile
                                  ? 'border-[#F6C22E]/50 bg-white/[0.06]'
                                  : 'border-white/20 bg-white/[0.06] hover:bg-white/[0.06] hover:border-[#F6C22E]/40'
                            }`}
                          >
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              required={!resumeFile}
                              onChange={handleFileChange}
                              className="sr-only"
                            />
                            <span className={`grid place-items-center w-12 h-12 mx-auto rounded-2xl depth-1 ${resumeFile ? 'pill-yellow text-[#0B0D0E]' : 'pill-yellow text-[#0B0D0E]'}`}>
                              {resumeFile ? <FileText size={22} strokeWidth={2} /> : <Upload size={22} strokeWidth={2} />}
                            </span>
                            <span className="mt-3 block text-[16px] font-bold text-[#F3F5F6] break-all">
                              {resumeFile ? resumeFile.name : 'Drop your resume here, or click to browse'}
                            </span>
                            <span className="mt-1 block text-[14px] text-[#A7B2B8]">
                              {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB · click to replace` : 'PDF or DOCX, up to 10 MB'}
                            </span>
                          </label>
                        </div>

                        <div>
                          <label htmlFor="cf-note" className={LABEL}>Cover note</label>
                          <textarea
                            id="cf-note"
                            rows={5}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder={form.coverNotePlaceholder}
                            className={`${FIELD} h-auto py-3 leading-relaxed resize-y`}
                          />
                        </div>

                        <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => setActiveTab('openings')}
                            className="inline-flex items-center gap-2 text-[15.5px] font-bold text-[#A7B2B8] hover:text-[#F3F5F6] transition-colors"
                          >
                            <ArrowLeft size={16} strokeWidth={2.25} />
                            Back to openings
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="press btn-gold gold-shimmer h-12 px-8 rounded-full text-[15.5px] font-extrabold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {submitting ? 'Submitting…' : form.submitLabel}
                            <Send size={16} strokeWidth={2.25} />
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Benefits */}
      {c.benefits.items.length > 0 && (
        <section className="pb-24">
          <div className="shell">
            <SectionHeading eyebrow="Working at CUBE" title={c.benefits.heading} lead={c.benefits.subheading} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger">
              {c.benefits.items.map((item, i) => {
                const Icon = BENEFIT_ICONS[item.icon] || Award;
                return (
                  <div key={i} className="glass glass-interactive glass-edge rounded-[26px] p-7">
                    <span className="grid place-items-center w-14 h-14 rounded-[18px] pill-yellow text-[#0B0D0E] depth-1">
                      <Icon size={24} strokeWidth={2} />
                    </span>
                    <h4 className="mt-6 font-display text-[20px] font-extrabold text-[#F3F5F6] leading-snug">{item.title}</h4>
                    <p className="mt-2 text-[18px] text-[#C2CCD1] leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Rendered into <body> so no transformed ancestor can offset it */}
      {mounted && createPortal(modal, document.body)}
    </div>
  );
}
