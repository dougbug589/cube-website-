import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import ArchiveVaultClient from './ArchiveVaultClient';

export const dynamic = 'force-dynamic';

export default async function AdminArchiveVaultPage() {
  await requireAdmin();
  const store = await getCMSStore();

  const archivedNews = (store.news || []).filter((n) => n.status === 'archived');
  const archivedTeam = (store.teamMembers || []).filter((m) => m.status === 'archived');
  const archivedTenders = (store.tenders || []).filter((t) => t.status === 'Archive' || t.status === 'archived');
  const archivedCEL = (store.celServices || []).filter((c) => c.status === 'archived');
  const archivedMedia = (store.gallery || []).filter((g) => g.status === 'archived');
  const archivedEnquiries = (store.enquiries || []).filter((e) => e.status === 'archived');
  const archivedProjects = (store.projects || []).filter((p) => p.status === 'archived');
  const archivedCareers = (store.careers || []).filter((c) => c.status === 'archived');

  return (
    <ArchiveVaultClient
      archivedNews={archivedNews}
      archivedTeam={archivedTeam}
      archivedTenders={archivedTenders}
      archivedCEL={archivedCEL}
      archivedMedia={archivedMedia}
      archivedEnquiries={archivedEnquiries}
      archivedProjects={archivedProjects}
      archivedCareers={archivedCareers}
    />
  );
}

