import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = getCMSStore();
    const activeServices = (store.celServices || []).filter(
      (s) => s.status === 'published'
    );
    return NextResponse.json(activeServices);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch CEL services' }, { status: 500 });
  }
}
