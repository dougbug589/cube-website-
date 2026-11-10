import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = getCMSStore();
    const activeClients = (store.clients || [])
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        category: c.type === 'partner' ? 'Partner' : 'Public Sector',
        logo: c.logoUrl || c.logo || '',
        logoUrl: c.logoUrl || c.logo || '',
        websiteUrl: c.websiteUrl || '#',
        displayOrder: c.displayOrder,
      }));
    return NextResponse.json(activeClients);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
