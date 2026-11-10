import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import {
  resolveCareersPage, buildDepartmentOptions, buildEmploymentTypeOptions,
} from '@/lib/careers-page';
import CareersManagerClient from './CareersClient';

export const dynamic = 'force-dynamic';

export default async function AdminCareersPage() {
  await requireAdmin();
  const store = getCMSStore();
  return (
    <CareersManagerClient 
      initialCareers={store.careers || []} 
      initialApplications={store.jobApplications || []}
      initialPageContent={resolveCareersPage(store.careersPage)}
      departmentOptions={buildDepartmentOptions(store.verticals || [], store.careers || [])}
      employmentTypeOptions={buildEmploymentTypeOptions(store.careers || [])}
    />
  );
}

