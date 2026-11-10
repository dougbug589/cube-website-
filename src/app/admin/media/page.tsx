import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import MediaManagerClient from './MediaManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  await requireAdmin();
  const store = getCMSStore();
  return <MediaManagerClient initialGallery={store.gallery || []} />;
}
