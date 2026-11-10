import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = getCMSStore();
    const activeProjects = (store.projects || []).filter(
      (p) => p.status === 'published'
    );
    return NextResponse.json(activeProjects);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
