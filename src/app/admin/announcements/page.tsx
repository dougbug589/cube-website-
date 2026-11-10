import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import AnnouncementsManagerClient from './AnnouncementsClient';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const store = await getCMSStore();
  const currentAnnouncement = store.announcements[0] || null;

  return <AnnouncementsManagerClient initialAnnouncement={currentAnnouncement} />;
}

