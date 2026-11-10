import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = getCMSStore();
    const activeGallery = (store.gallery || []).filter(
      (g) => g.status === 'published'
    );
    return NextResponse.json(activeGallery);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}
