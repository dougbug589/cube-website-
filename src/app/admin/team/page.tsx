import React from 'react';
import { getCMSStore } from '@/lib/db/store';
import { requireAdmin } from '@/lib/auth-guard';
import TeamClient from './TeamClient';

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  await requireAdmin();
  const store = await getCMSStore();
  return <TeamClient initialMembers={store.teamMembers || []} />;
}
