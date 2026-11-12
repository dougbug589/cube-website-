import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'cube_admin_session';

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // The admin only runs on the local CUBE computer. On the read-only public
  // deployment (Vercel without Supabase) it does not exist at all.
  const publishedSite =
    process.env.CMS_BACKEND === 'published' ||
    (!!process.env.VERCEL && !process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.CMS_BACKEND !== 'file');
  if (publishedSite) {
    return new NextResponse('Not found', { status: 404, headers: { 'X-Robots-Tag': 'noindex' } });
  }

  // Fail closed: never run the CMS with a missing/weak signing secret.
  const jwtSecret = getJwtSecret();
  if (!jwtSecret) {
    if (isAdminApi) {
      return NextResponse.json(
        { error: 'Server misconfiguration: ADMIN_JWT_SECRET is not set' },
        { status: 503 }
      );
    }
    return new NextResponse(
      'Server misconfiguration: ADMIN_JWT_SECRET is not set',
      { status: 503 }
    );
  }

  if (isAdminApi) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    try {
      await jwtVerify(token, jwtSecret);
      return NextResponse.next();
    } catch {
      return NextResponse.json(
        { error: 'Forbidden: Invalid session token' },
        { status: 403 }
      );
    }
  }

  // /admin pages
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname === '/admin/login') {
    if (token) {
      try {
        await jwtVerify(token, jwtSecret);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch {
        // Invalid token, continue to login page.
      }
    }
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret);

    // Forward the verified identity to downstream handlers via request headers.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Role', (payload.role as string) || 'viewer');
    requestHeaders.set('X-User-Id', (payload.userId as string) || '');

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  } catch {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('expired', 'true');
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.cookies.delete(SESSION_COOKIE);
    return redirectResponse;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
