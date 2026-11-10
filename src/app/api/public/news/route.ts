import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';
import { normalizeNewsItem } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await getCMSStore();
    const activeNews = (store.news || [])
      .filter((n) => n.status === 'published')
      .map((n) => normalizeNewsItem(n));
    return NextResponse.json(activeNews);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

