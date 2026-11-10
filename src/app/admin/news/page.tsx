import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import AdminNewsManager from './NewsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewsPage() {
  await requireAdmin();
  const store = await getCMSStore();
  return <AdminNewsManager initialNews={store.news} />;
}

