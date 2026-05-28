// app/api/company/create/route.ts
import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { ManagementClient } from 'auth0';

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    const domainString =
      process.env.AUTH0_DOMAIN || process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '');

    if (!domainString) {
      return NextResponse.json(
        { message: 'Unable to resolve Auth0 domain' },
        { status: 500 }
      );
    }

    // Initialize Auth0 Management Client
    const management = new ManagementClient({
      domain: domainString,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    });

    const userId = session.user.sub;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ message: 'Invalid User ID format' }, { status: 400 });
    }

    // 1. Update Auth0's database record
    await management.users.update(userId, {
      app_metadata: {
        tenantId: slug,
        role: 'Admin'
      }
    });

    // --- FIX: INSTANTLY UPDATE THE LOCAL COOKIE SESSION ---
    // This tells the Next.js SDK to rebuild the active session cookie right now so the user doesn't have to log out!
    await auth0.updateSession({
      ...session,
      user: {
        ...session.user,
        'https://helpdesk.com/tenantId': slug,
        'https://helpdesk.com/roles': ['Admin']
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Onboarding exception:', error);
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}