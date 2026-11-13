import React from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import SectionHeading from '@/components/common/SectionHeading';
import { clients } from '@/data/clients';
import { clientLogoAlt } from '@/lib/content';
import { partners } from '@/data/partners';

export const metadata = {
  title: 'Our Clients | CUBE IIT Madras',
  description: 'Government departments, public bodies and companies CUBE has worked with, and its partners.',
};

// Placeholder names in the partner data ("Partner Organization 1") are not
// real organisation names, so they are not announced as such.
const partnerAlt = (name: string) => (/^partner organi[sz]ation\s*\d+$/i.test(name.trim()) ? 'Partner logo' : name);

export default function ClientsPage() {
  const logos = clients.filter((c) => c.logo);
  const partnerLogos = partners.filter((p) => p.logo);
  return (
    <div className="text-[#F3F5F6] min-h-screen">
      <PageHeader
        badge="About"
        title="Our Clients"
        description="Organisations CUBE has worked with."
        breadcrumbs={[{ label: 'About CUBE', href: '/about' }, { label: 'Our Clients' }]}
      />

      <section className="shell pb-16 lg:pb-20">
        <SectionHeading eyebrow="Clients" title={<>Clients <span className="text-[#F6C22E]">({logos.length})</span></>} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 reveal-stagger">
          {logos.map((c, i) => (
            <div key={`${c.logo}-${i}`} className="group h-36 lg:h-40 rounded-[22px] bg-white border border-white/[0.08] depth-1 px-6 py-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1">
              <div className="relative w-full h-full">
                <Image
                  src={c.logo}
                  alt={clientLogoAlt(c.name)}
                  fill
                  sizes="(max-width: 640px) 45vw, 280px"
                  className="object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {partnerLogos.length > 0 && (
        <section className="band-mist py-16 lg:py-20 pb-24">
          <div className="shell">
            <SectionHeading eyebrow="Partners" title="Partners and collaborators." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 reveal-stagger">
              {partnerLogos.map((p) => (
                <div key={p.logo} className="h-52 rounded-[24px] bg-white border border-white/[0.09] depth-1 grid place-items-center p-4">
                  <div className="relative w-full h-full">
                    <Image src={p.logo} alt={partnerAlt(p.name)} fill sizes="(max-width: 640px) 90vw, 340px" className="object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
