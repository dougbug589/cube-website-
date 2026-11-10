import { NextResponse } from 'next/server';
import { getActiveAnnouncements } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '/';
    const announcements = await getActiveAnnouncements(page);
    return NextResponse.json(announcements);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

