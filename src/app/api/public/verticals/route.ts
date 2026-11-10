import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = getCMSStore();
    const activeVerticals = (store.verticals || []).filter(
      (v) => v.status === 'published' || !v.status
    );
    return NextResponse.json(activeVerticals);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch verticals' }, { status: 500 });
  }
}
