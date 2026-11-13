import React from 'react';
import { FileText, Mail } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import TenderRegister from '@/components/tenders/TenderRegister';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tenders | CUBE IIT Madras',
  description: 'Tender notices and documents published by the Centre for Urbanization, Buildings & Environment (CUBE).',
};

export default async function TendersPage() {
  const store = await getCMSStore();
  const activeTenders = (store.tenders || []).filter(
    (t: any) => t.status !== 'archived' && t.status !== 'Archive'
  );

  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="Tenders"
        title="Tenders"
        description="Tender notices, corrigenda and documents published by CUBE."
        breadcrumbs={[{ label: 'Tenders' }]}
      />

      <section className="pb-24">
        <div className="shell">
          {activeTenders.length > 0 ? (
            <TenderRegister tenders={activeTenders} />
          ) : (
            <div className="liquid-glass rounded-[30px] p-10 sm:p-14 text-center max-w-3xl mx-auto">
              <span className="grid place-items-center w-16 h-16 mx-auto rounded-[20px] bg-[#F6C22E]/15 text-[#F6C22E] depth-1">
                <FileText size={28} strokeWidth={2} />
              </span>
              <h2 className="mt-6 font-display text-[26px] font-extrabold text-[#F3F5F6]">No tenders are open at the moment</h2>
              <p className="mt-3 text-[18.5px] text-[#C2CCD1] leading-relaxed">New tender notices will be published on this page.</p>
              <a
                href="mailto:office@cubeiitm.org"
                className="press btn-soft mt-7 h-12 px-6 rounded-full text-[15.5px] font-bold inline-flex items-center gap-2"
              >
                <Mail size={16} className="text-[#F6C22E]" />
                office@cubeiitm.org
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
