import { NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';
import { getCMSBackend } from '@/lib/db/backend';

export const dynamic = 'force-dynamic';

/**
 * Health check for server monitoring (uptime robots, load balancers, PM2).
 * 200 when the app can read its content store, 503 otherwise. No private data.
 */
export async function GET() {
  const started = Date.now();
  try {
    const store = await getCMSStore();
    return NextResponse.json(
      {
        status: 'ok',
        storage: getCMSBackend(),
        content: { news: store.news?.length ?? 0, projects: store.projects?.length ?? 0 },
        responseMs: Date.now() - started,
        time: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json({ status: 'error', time: new Date().toISOString() }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
