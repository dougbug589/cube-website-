import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await getCMSStore();
    const activeCareers = (store.careers || []).filter(
      (c) => c.status === 'published' && c.isActive
    );
    return NextResponse.json(activeCareers);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch careers' }, { status: 500 });
  }
}
