import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import EnquiriesClient from './EnquiriesClient';

export const dynamic = 'force-dynamic';

export default async function AdminEnquiriesPage() {
  await requireAdmin();
  const store = getCMSStore();
  const enquiries = store.enquiries || [];

  return <EnquiriesClient initialEnquiries={enquiries} />;
}

