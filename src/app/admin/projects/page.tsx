import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import ProjectsManagerClient from './ProjectsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  await requireAdmin();
  const store = getCMSStore();
  return <ProjectsManagerClient initialProjects={store.projects} />;
}

