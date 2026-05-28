// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth0, getAuth0ProfileClaims } from '@/lib/auth0';

// Next.js 16 relies on the named 'proxy' export
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Let Auth0 handle the full auth route family (logout, callback, etc.)
  if (pathname.startsWith('/auth/')) {
    const response = await auth0.middleware(request);

    // Intercept incoming invitation clicks to register a tracking cookie.
    if (pathname.startsWith('/auth/login')) {
      const organization = searchParams.get('organization');
      if (organization) {
        response.cookies.set('invite_tenant', organization, { path: '/', httpOnly: true });
      }
    }

    return response;
  }

  // 2. Exact or sub-route guarding rules for the admin dashboard
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const session = await auth0.getSession();

    console.log('--- ACTUAL AUTH0 SESSION USER ---');
    console.dir(session?.user, { depth: null });
    console.log('---------------------------------');

    // If no session exists, bounce to login
    if (!session || !session.user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const roles =
      (session.user['https://helpdesk.com/roles'] as string[]) ||
      (session.user.sub && typeof session.user.sub === 'string'
        ? (await getAuth0ProfileClaims(session.user.sub).catch(() => null))?.roles || []
        : []);

    // If the user doesn't have the Admin role, redirect to unauthorized page
    console.log("User roles:", roles);
    const tenantId = session.user['https://helpdesk.com/tenantId'] || (session.user.sub && typeof session.user.sub === 'string' ? (await getAuth0ProfileClaims(session.user.sub).catch(() => null))?.tenantId || null : null);
    console.log("User tenantId:", tenantId);
    if (!roles.includes('Admin')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/admin/:path*'
  ],
};