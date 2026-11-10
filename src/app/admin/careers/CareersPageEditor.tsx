'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, CheckCircle2, Loader2,
} from 'lucide-react';
import { updateCareersPageAction } from '@/app/admin/actions/cms';
import {
  CareersPageContent, CareerBenefitIcon, CAREER_BENEFIT_ICONS, DEFAULT_CAREERS_PAGE,
} from '@/lib/careers-page';

const ICON_LABELS: Record<CareerBenefitIcon, string> = {
  award: 'Award',
  building: 'Building',
  globe: 'Globe',
  briefcase: 'Briefcase',
  sparkles: 'Sparkles',
  users: 'People',
  graduation: 'Graduation cap',
  flask: 'Lab flask',
};

const inputCls =
  'w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#070E5C]';

function Field({
  label, value, onChange, multiline = false, rows = 3, hint, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{label}</label>
      {multiline ? (
        <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      )}
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

/** Edits a list of strings as one-per-line text. */
function LinesField({
  label, value, onChange, hint, rows = 4,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  hint?: string;
  rows?: number;
}) {
  // Local text keeps blank lines while typing; parent re-mounts this (via key) when content is replaced.
  const [text, setText] = useState(value.join('\n'));
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">{label}</label>
      <textarea
        rows={rows}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(e.target.value.split('\n').map((l) => l.trim()).filter(Boolean));
        }}
        className={inputCls}
      />
      <p className="text-[10px] text-slate-400 mt-1">{hint || 'One item per line.'}</p>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-[#070E5C]">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function CareersPageEditor({ initialContent }: { initialContent: CareersPageContent }) {
  const router = useRouter();
  const [content, setContent] = useState<CareersPageContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [formKey, setFormKey] = useState(0);

  // Immutable nested update helper: update('header', { title: 'x' })
  const update = <K extends keyof CareersPageContent>(key: K, patch: Partial<CareersPageContent[K]> | CareersPageContent[K]) => {
    setContent((prev) => {
      const current = prev[key];
      const next =
        current && typeof current === 'object' && !Array.isArray(current)
          ? { ...(current as object), ...(patch as object) }
          : patch;
      return { ...prev, [key]: next } as CareersPageContent;
    });
    setDirty(true);
    setMessage(null);
  };

  const benefits = content.benefits.items;
  const setBenefits = (items: CareersPageContent['benefits']['items']) => update('benefits', { items });

  const moveBenefit = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= benefits.length) return;
    const copy = [...benefits];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setBenefits(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await updateCareersPageAction(content);
      if (res.success) {
        setContent(res.content);
        setFormKey((k) => k + 1);
        setDirty(false);
        setMessage({ type: 'ok', text: 'Saved. The public careers page now shows these changes.' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: 'Could not save changes.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Could not save changes.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (!confirm('Replace all careers page text with the original default content? (Not saved until you click Save.)')) return;
    setContent(DEFAULT_CAREERS_PAGE);
    setFormKey((k) => k + 1);
    setDirty(true);
    setMessage(null);
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Sticky action bar */}
      <div className="sticky top-2 z-20 bg-white/95 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#24272B]">Careers Page Content</h2>
          <p className="text-slate-500">
            Every heading, label and section on the public careers page. Job openings are managed in the Openings tab.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View page
          </a>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-4 py-2 rounded-xl bg-[#070E5C] hover:bg-[#D99A42] text-white font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>
        {message && (
          <div
            className={`w-full p-2.5 rounded-xl border flex items-center gap-2 ${
              message.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {message.type === 'ok' && <CheckCircle2 className="w-4 h-4" />}
            {message.text}
          </div>
        )}
      </div>

      <div key={formKey} className="space-y-6">
      <Section title="Page Header" description="The banner at the top of the careers page.">
        <Field label="Badge" value={content.header.badge} onChange={(v) => update('header', { badge: v })} />
        <Field label="Title" value={content.header.title} onChange={(v) => update('header', { title: v })} />
        <Field
          label="Description"
          multiline
          value={content.header.description}
          onChange={(v) => update('header', { description: v })}
        />
      </Section>

      <Section title="Tabs & Contact" description="The tab bar and recruitment contact shown below the header.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Openings tab label"
            value={content.tabs.openingsLabel}
            onChange={(v) => update('tabs', { openingsLabel: v })}
            hint="The number of openings is added automatically."
          />
          <Field
            label="Resume tab label"
            value={content.tabs.portalLabel}
            onChange={(v) => update('tabs', { portalLabel: v })}
          />
          <Field
            label="Contact label"
            value={content.contactLabel}
            onChange={(v) => { setContent((p) => ({ ...p, contactLabel: v })); setDirty(true); }}
          />
          <Field
            label="Contact email"
            type="email"
            value={content.contactEmail}
            onChange={(v) => { setContent((p) => ({ ...p, contactEmail: v })); setDirty(true); }}
            hint="Leave empty to hide the contact line."
          />
        </div>
      </Section>

      <Section title="No Openings Message" description="Shown instead of job cards when no positions are live.">
        <Field label="Title" value={content.emptyState.title} onChange={(v) => update('emptyState', { title: v })} />
        <Field
          label="Description"
          multiline
          value={content.emptyState.description}
          onChange={(v) => update('emptyState', { description: v })}
        />
        <Field
          label="Button label"
          value={content.emptyState.buttonLabel}
          onChange={(v) => update('emptyState', { buttonLabel: v })}
        />
      </Section>

      <Section title="Talent Network Banner" description="The 'drop your resume' banner below the job cards.">
        <Field label="Badge" value={content.talentCallout.badge} onChange={(v) => update('talentCallout', { badge: v })} />
        <Field label="Heading" value={content.talentCallout.heading} onChange={(v) => update('talentCallout', { heading: v })} />
        <Field
          label="Description"
          multiline
          value={content.talentCallout.description}
          onChange={(v) => update('talentCallout', { description: v })}
        />
        <Field
          label="Button label"
          value={content.talentCallout.buttonLabel}
          onChange={(v) => update('talentCallout', { buttonLabel: v })}
        />
      </Section>

      <Section title="Job Details Popup" description="The 'How to Apply' box shown when a visitor opens a job.">
        <Field
          label="Box title"
          value={content.jobDetail.howToApplyTitle}
          onChange={(v) => update('jobDetail', { howToApplyTitle: v })}
        />
        <LinesField
          label="Steps"
          value={content.jobDetail.howToApplySteps}
          onChange={(v) => update('jobDetail', { howToApplySteps: v })}
          hint="One step per line. Leave empty to hide the box."
        />
      </Section>

      <Section title="Application Form" description="The resume upload form and its dropdown options.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Badge" value={content.applicationForm.badge} onChange={(v) => update('applicationForm', { badge: v })} />
          <Field label="Heading" value={content.applicationForm.heading} onChange={(v) => update('applicationForm', { heading: v })} />
          <Field
            label="Default position (general applications)"
            value={content.applicationForm.defaultJobTitle}
            onChange={(v) => update('applicationForm', { defaultJobTitle: v })}
          />
          <Field
            label="Submit button label"
            value={content.applicationForm.submitLabel}
            onChange={(v) => update('applicationForm', { submitLabel: v })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LinesField
            label="Experience options"
            value={content.applicationForm.experienceOptions}
            onChange={(v) => update('applicationForm', { experienceOptions: v })}
          />
          <LinesField
            label="Engineering domain options"
            value={content.applicationForm.domainOptions}
            onChange={(v) => update('applicationForm', { domainOptions: v })}
          />
        </div>
        <Field
          label="Cover note placeholder"
          multiline
          rows={2}
          value={content.applicationForm.coverNotePlaceholder}
          onChange={(v) => update('applicationForm', { coverNotePlaceholder: v })}
        />
        <Field
          label="Success title"
          value={content.applicationForm.successTitle}
          onChange={(v) => update('applicationForm', { successTitle: v })}
        />
        <Field
          label="Success message"
          multiline
          value={content.applicationForm.successMessage}
          onChange={(v) => update('applicationForm', { successMessage: v })}
        />
      </Section>

      <Section title="Benefits Section" description="Cards at the bottom of the page. Remove all cards to hide the section.">
        <Field label="Heading" value={content.benefits.heading} onChange={(v) => update('benefits', { heading: v })} />
        <Field
          label="Subheading"
          multiline
          rows={2}
          value={content.benefits.subheading}
          onChange={(v) => update('benefits', { subheading: v })}
        />

        <div className="space-y-3">
          {benefits.map((b, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Card {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveBenefit(i, -1)}
                    disabled={i === 0}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBenefit(i, 1)}
                    disabled={i === benefits.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setBenefits(benefits.filter((_, j) => j !== i))}
                    className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700"
                    title="Remove card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Icon</label>
                  <select
                    value={b.icon}
                    onChange={(e) =>
                      setBenefits(benefits.map((x, j) => (j === i ? { ...x, icon: e.target.value as CareerBenefitIcon } : x)))
                    }
                    className={inputCls}
                  >
                    {CAREER_BENEFIT_ICONS.map((ic) => (
                      <option key={ic} value={ic}>{ICON_LABELS[ic]}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Title"
                    value={b.title}
                    onChange={(v) => setBenefits(benefits.map((x, j) => (j === i ? { ...x, title: v } : x)))}
                  />
                </div>
              </div>
              <Field
                label="Description"
                multiline
                rows={2}
                value={b.description}
                onChange={(v) => setBenefits(benefits.map((x, j) => (j === i ? { ...x, description: v } : x)))}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => setBenefits([...benefits, { icon: 'award', title: '', description: '' }])}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-[#070E5C] hover:text-[#070E5C] font-semibold flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add benefit card
          </button>
        </div>
      </Section>
      </div>
    </div>
  );
}
