import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await getCMSStore();
    const activeTenders = (store.tenders || []).filter(
      (t) => t.status !== 'archived' && t.status !== 'Archive'
    );
    return NextResponse.json(activeTenders);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch tenders' }, { status: 500 });
  }
}

