'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { 
  Briefcase, Send, CheckCircle2, Mail, MapPin, 
  Upload, FileText, Sparkles, Building2, User, 
  Phone, Globe, Award, ChevronRight, Check
} from 'lucide-react';

interface CareersHubProps {
  initialCareers: any[];
}

export default function CareersHub({ initialCareers }: CareersHubProps) {
  const [activeTab, setActiveTab] = useState<'openings' | 'portal'>('openings');
  const [selectedJob, setSelectedJob] = useState<any | null>(initialCareers[0] || null);

  // Application form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('3-5 Years');
  const [domain, setDomain] = useState('Structural Engineering & PMC');
  const [jobTitle, setJobTitle] = useState(selectedJob ? selectedJob.title : 'General Engineering Talent Pool');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleApplyClick = (job: any) => {
    setSelectedJob(job);
    setJobTitle(job.title);
    setActiveTab('portal');
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('Resume file size cannot exceed 10MB.');
        return;
      }
      setResumeFile(file);
    }
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
      setSubmitError('Network error while uploading resume. Please email careers@cubeiitm.org directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] text-[#24272B] min-h-screen">
      <PageHeader
        badge="Careers & Professional Development"
        title="Engineering Careers & Talent Portal"
        description="Explore marquee state engineering openings or upload your CV to the CUBE Talent Network for direct IIT Madras faculty and project advisory consideration."
        breadcrumbs={[{ label: 'Careers' }]}
      />

      {/* Interactive Hub Navigation Tabs */}
      <section className="py-8 bg-gradient-to-b from-[#FFFFFF] to-[#F6FAFD] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            <div className="inline-flex p-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-[#BDD7E8] shadow-xs">
              <button
                onClick={() => setActiveTab('openings')}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'openings'
                    ? 'bg-[#070E5C] text-white shadow-md'
                    : 'text-[#24272B] hover:text-[#070E5C]'
                }`}
              >
                <Briefcase className="w-4 h-4 text-[#D99A42]" />
                <span>Active Openings ({initialCareers.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('portal')}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'portal'
                    ? 'bg-[#070E5C] text-white shadow-md'
                    : 'text-[#24272B] hover:text-[#070E5C]'
                }`}
              >
                <Upload className="w-4 h-4 text-[#D99A42]" />
                <span>Upload Resume &amp; Talent Network</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#747B83]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Recruitment Liaison: <strong className="text-[#070E5C]">careers@cubeiitm.org</strong></span>
            </div>

          </div>
        </div>
      </section>

      {/* Main Section Content */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#F6FAFD] to-[#FFFFFF] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {activeTab === 'openings' ? (
            <div className="space-y-12">
              
              {/* Job Listings Grid */}
              {initialCareers.length === 0 ? (
                <div className="p-12 sm:p-16 rounded-3xl bg-white/90 backdrop-blur-2xl border border-[#BDD7E8] text-center shadow-sm max-w-3xl mx-auto">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-[#EAF2F8] border border-[#BDD7E8] text-[#070E5C] flex items-center justify-center mb-6">
                    <Briefcase className="w-8 h-8 text-[#D99A42]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#747B83]">Status Notice</span>
                  <h3 className="text-2xl font-bold font-serif text-[#070E5C] mt-2">
                    No Direct Vacancies Advertised Currently
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-[#747B83] max-w-lg mx-auto leading-relaxed">
                    New mandates for structural QA, hydrodynamic modeling, and precast inspection open quarterly. You can submit your CV directly to our Talent Network.
                  </p>
                  <button
                    onClick={() => setActiveTab('portal')}
                    className="mt-6 px-6 py-3 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BDD7E8] text-xs font-bold transition shadow-xs"
                  >
                    Upload Resume for Future Openings &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {initialCareers.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#BDD7E8] p-6 shadow-sm hover:shadow-md hover:border-[#8EBCE0] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]">
                            {job.department || 'Engineering Vertical'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {job.employmentType || 'Full-Time'}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold font-serif text-[#070E5C] leading-snug">
                          {job.title}
                        </h3>

                        <p className="text-xs text-[#747B83] mt-2 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#D99A42]" />
                          <span>{job.location || 'IIT Madras Research Park, Chennai'}</span>
                        </p>

                        <p className="text-xs text-[#24272B]/80 mt-3 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      <div className="pt-5 mt-5 border-t border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-[11px] text-[#747B83]">Exp: {job.experience || '3+ Yrs'}</span>
                        <button
                          onClick={() => handleApplyClick(job)}
                          className="px-4 py-2 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BDD7E8] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3 text-[#D99A42]" />
                          <span>Apply &amp; Upload CV</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Naukri-Style Resume Upload Callout */}
              <div className="rounded-3xl bg-gradient-to-r from-[#EAF2F8] via-white to-[#F6FAFD] border border-[#BDD7E8] p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-white px-3 py-1 rounded-full border border-[#BDD7E8]">
                    Join CUBE Talent Network
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#070E5C]">
                    Didn&apos;t find a matching job role? Drop your resume.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#747B83] leading-relaxed">
                    We maintain an active resume bank for senior civil advisors, environmental chemists, hydrologists, and GIS planners. Whenever state projects launch, our faculty committee reviews matching profiles directly.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('portal')}
                  className="px-8 py-3.5 rounded-full bg-[#070E5C] hover:bg-[#D99A42] text-white font-bold text-xs tracking-wider uppercase transition shadow-md whitespace-nowrap active:scale-95"
                >
                  Upload Your Resume Now &rarr;
                </button>
              </div>

            </div>
          ) : (
            
            /* NAUKRI / MODERN CAREER PORTAL FORM */
            <div className="max-w-4xl mx-auto">
              
              <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#BDD7E8] p-8 sm:p-12 shadow-[0_20px_50px_rgba(7,14,92,0.06)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#BDD7E8] to-transparent opacity-90" />

                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
                    Candidate Application &amp; CV Submission
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-[#070E5C] mt-3">
                    Submit Your Profile to CUBE Engineering
                  </h2>
                  <p className="text-xs sm:text-sm text-[#747B83] mt-2">
                    Applying for: <strong className="text-[#24272B]">{jobTitle}</strong>
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="p-8 sm:p-12 rounded-2xl bg-[#EAF2F8] border border-[#BDD7E8] text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#070E5C]">Application &amp; Resume Received!</h3>
                    <p className="text-xs sm:text-sm text-[#747B83] max-w-md mx-auto leading-relaxed">
                      Thank you for submitting your engineering profile to CUBE. Our recruitment team and faculty committee will review your qualifications against active project requirements.
                    </p>
                    <button
                      onClick={() => { setSubmitSuccess(false); setActiveTab('openings'); }}
                      className="mt-4 px-6 py-2.5 rounded-full bg-[#070E5C] text-white text-xs font-bold hover:bg-[#D99A42] transition"
                    >
                      Return to Careers Overview
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitApplication} className="space-y-6">
                    {submitError && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                        {submitError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Dr. K. Ramesh"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ramesh@example.com"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Total Relevant Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        >
                          <option value="0-2 Years (Graduate / Junior)">0-2 Years (Graduate / Junior)</option>
                          <option value="3-5 Years (Mid-Level Engineer)">3-5 Years (Mid-Level Engineer)</option>
                          <option value="6-10 Years (Senior Engineer / Specialist)">6-10 Years (Senior Engineer / Specialist)</option>
                          <option value="10+ Years (Principal / Project Director)">10+ Years (Principal / Project Director)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Primary Engineering Domain
                        </label>
                        <select
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        >
                          <option value="Structural Engineering & PMC">Building &amp; Structural Engineering (PMC / TPQA)</option>
                          <option value="Water Resources & Hydrology">Environment &amp; Sustainable Hydrology (CEL)</option>
                          <option value="Smart Urban Infrastructure & IoT">Smart Cities &amp; Urban IoT Telemetry</option>
                          <option value="Urban Transport & Master Planning">Urban Planning &amp; Multimodal Mobility</option>
                          <option value="Environmental Laboratory Testing (CEL)">CEL Testing &amp; Chemical Diagnostics</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Target Position / Opening
                        </label>
                        <input
                          type="text"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          placeholder="Position applied for"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        />
                      </div>

                    </div>

                    {/* Resume Upload Box (Naukri Style) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                        Upload Resume / Curriculum Vitae (PDF or DOCX - Max 10MB) *
                      </label>
                      <div className="rounded-2xl border-2 border-dashed border-[#BDD7E8] p-6 text-center hover:bg-[#F6FAFD] transition cursor-pointer relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          required
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-[#D99A42] mb-2" />
                          <p className="text-xs font-bold text-[#070E5C]">
                            {resumeFile ? resumeFile.name : 'Click or Drag & Drop your Resume here'}
                          </p>
                          <p className="text-[10px] text-[#747B83] mt-1">
                            Supported formats: PDF, DOCX (up to 10MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                        Brief Cover Note / Career Summary
                      </label>
                      <textarea
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Highlight your key achievements, state project experience, and software skills (e.g. ETABS, STAAD.Pro, Arc-GIS, HEC-RAS)..."
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveTab('openings')}
                        className="text-xs font-semibold text-[#747B83] hover:text-[#070E5C]"
                      >
                        &larr; Back to Openings
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3.5 rounded-full bg-[#070E5C] hover:bg-[#D99A42] text-white text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? 'Submitting Application...' : 'Submit Profile & Resume'}
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </form>
                )}

              </div>

            </div>

          )}

        </div>
      </section>

      {/* Institutional Career Benefits Showcase */}
      <section className="py-16 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl font-serif font-bold text-[#070E5C]">
              Career Growth &amp; Institutional Mentorship
            </h3>
            <p className="text-xs sm:text-sm text-[#747B83] mt-2">
              Join Tamil Nadu&apos;s apex Centre of Excellence bridging academia and state infrastructure delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#F6FAFD] border border-[#BDD7E8] text-center">
              <Award className="w-8 h-8 text-[#D99A42] mx-auto mb-3" />
              <h4 className="font-serif font-bold text-[#070E5C] text-base">IIT Madras Faculty Direct Access</h4>
              <p className="text-xs text-[#747B83] mt-2 leading-relaxed">
                Work closely with distinguished professors on state proof checking and applied research methodologies.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F6FAFD] border border-[#BDD7E8] text-center">
              <Building2 className="w-8 h-8 text-[#D99A42] mx-auto mb-3" />
              <h4 className="font-serif font-bold text-[#070E5C] text-base">Marquee State Projects</h4>
              <p className="text-xs text-[#747B83] mt-2 leading-relaxed">
                Lead independent TPQA on multi-thousand unit housing, high-speed corridors, and river rejuvenation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F6FAFD] border border-[#BDD7E8] text-center">
              <Globe className="w-8 h-8 text-[#D99A42] mx-auto mb-3" />
              <h4 className="font-serif font-bold text-[#070E5C] text-base">Advanced CEL Laboratories</h4>
              <p className="text-xs text-[#747B83] mt-2 leading-relaxed">
                Access precision ICP-OES, non-destructive concrete diagnostics, and specialized testing at IITM Research Park.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

