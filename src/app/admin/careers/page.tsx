import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import CareersManagerClient from './CareersClient';

export const dynamic = 'force-dynamic';

export default async function AdminCareersPage() {
  await requireAdmin();
  const store = getCMSStore();
  return (
    <CareersManagerClient 
      initialCareers={store.careers || []} 
      initialApplications={store.jobApplications || []} 
    />
  );
}

