import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import CELClient from './CELClient';

export const dynamic = 'force-dynamic';

export default async function AdminCELPage() {
  await requireAdmin();
  const store = await getCMSStore();
  return <CELClient initialServices={store.celServices || []} />;
}
