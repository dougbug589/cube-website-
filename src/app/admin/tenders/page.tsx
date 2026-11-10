import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import TendersClient from './TendersClient';

export const dynamic = 'force-dynamic';

export default async function AdminTendersPage() {
  await requireAdmin();
  const store = getCMSStore();
  return <TendersClient initialTenders={store.tenders || []} />;
}
