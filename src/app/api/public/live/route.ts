import { getStoreVersion } from '@/lib/db/store';
import { getCMSBackend } from '@/lib/db/backend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Server-Sent Events stream that pushes the CMS store version whenever an
 * admin saves anything. Browsers on the public site (and admin panel) listen
 * and refresh their data instantly instead of polling every 30 seconds.
 *
 * One cheap fs.stat per second is shared by ALL connected clients.
 */
type Listener = (version: number) => void;

const g = globalThis as unknown as {
  __cubeLive?: { listeners: Set<Listener>; version: number; timer: NodeJS.Timeout | null; checking: boolean };
};
const live = (g.__cubeLive ??= { listeners: new Set(), version: 0, timer: null, checking: false });

// The JSON file is a cheap fs.stat; the database check is a network query.
const CHECK_INTERVAL_MS = getCMSBackend() === 'supabase' ? 3000 : 1000;

function ensureWatcher() {
  if (live.timer) return;
  live.timer = setInterval(async () => {
    if (live.listeners.size === 0) {
      if (live.timer) clearInterval(live.timer);
      live.timer = null;
      return;
    }
    if (live.checking) return;
    live.checking = true;
    try {
      const v = await getStoreVersion();
      if (v && v !== live.version) {
        live.version = v;
        live.listeners.forEach((fn) => fn(v));
      }
    } finally {
      live.checking = false;
    }
  }, CHECK_INTERVAL_MS);
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const initialVersion = await getStoreVersion();
  if (initialVersion && !live.version) live.version = initialVersion;

  const stream = new ReadableStream({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      const listener: Listener = (v) => send(`event: version\ndata: ${v}\n\n`);
      const heartbeat = setInterval(() => send(`: ping\n\n`), 25000);

      cleanup = () => {
        clearInterval(heartbeat);
        live.listeners.delete(listener);
      };

      // Tell the client to reconnect quickly if the connection drops.
      send(`retry: 3000\nevent: version\ndata: ${initialVersion}\n\n`);
      live.listeners.add(listener);
      ensureWatcher();

      request.signal.addEventListener('abort', () => {
        cleanup();
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
