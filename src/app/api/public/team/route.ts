import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const store = getCMSStore();

    // Only published members, and only fields that are safe to expose publicly.
    const activeStaff = (store.teamMembers || [])
      .filter((m) => m.status === 'published')
      .map((m) => ({
        id: m.id,
        name: m.name,
        designation: m.designation || m.role || '',
        department: m.department,
        organization: m.organization,
        category: m.category,
        image: m.image,
        bio: m.bio,
        displayOrder: m.displayOrder,
      }));

    return NextResponse.json(activeStaff);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}
