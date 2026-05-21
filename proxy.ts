import { auth0 } from "./lib/auth0";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_NAMESPACE = 'https://helpdesk.com/roles';

const PROTECTED_ROUTES: Record<string, string> = {
  '/admin': 'admin',
  '/dashboard': 'user',
};

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);
  if (authResponse) return authResponse;

  const session = await auth0.getSession(request);
  const pathname = request.nextUrl.pathname;

  for (const [route, requiredRole] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!session) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      const roles: string[] = session.user[ROLE_NAMESPACE] ?? [];
      if (!roles.includes(requiredRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};