import { getStoreVersion } from '@/lib/db/store';

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
  __cubeLive?: { listeners: Set<Listener>; version: number; timer: NodeJS.Timeout | null };
};
const live = (g.__cubeLive ??= { listeners: new Set(), version: getStoreVersion(), timer: null });

function ensureWatcher() {
  if (live.timer) return;
  live.timer = setInterval(() => {
    const v = getStoreVersion();
    if (v !== live.version) {
      live.version = v;
      live.listeners.forEach((fn) => fn(v));
    }
    if (live.listeners.size === 0 && live.timer) {
      clearInterval(live.timer);
      live.timer = null;
    }
  }, 1000);
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let cleanup = () => {};

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
      send(`retry: 3000\nevent: version\ndata: ${getStoreVersion()}\n\n`);
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
