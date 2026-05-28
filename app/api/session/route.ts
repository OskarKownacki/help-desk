// app/api/session/route.ts
import { NextResponse } from 'next/server';
import { auth0, getAuth0ProfileClaims } from '@/lib/auth0'; // Path to your auth0 client file

export async function GET() {
  const session = await auth0.getSession();

  if (!session || !session.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const userId = session.user.sub;
  const profileClaims =
    userId && typeof userId === 'string'
      ? await getAuth0ProfileClaims(userId).catch(() => null)
      : null;

  // Ensure your custom roles claim is explicitly passed in the JSON response
  return NextResponse.json({
    user: {
      ...session.user,
      'https://helpdesk.com/tenantId':
        session.user['https://helpdesk.com/tenantId'] || profileClaims?.tenantId || null,
      'https://helpdesk.com/roles':
        session.user['https://helpdesk.com/roles'] || profileClaims?.roles || [],
    },
  });
}