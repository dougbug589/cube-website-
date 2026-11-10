import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = await getCMSStore();
    const slides = (store.heroSlides || [])
      .filter((s) => s.status === 'published')
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return NextResponse.json(slides);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 });
  }
}
