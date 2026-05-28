// app/api/company/invite-link/route.ts
import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  const session = await auth0.getSession();
  
  // Extract the tenantId from the active Admin's session
  const tenantId = session?.user?.['https://helpdesk.com/tenantId'];

  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized: No workspace found' }, { status: 401 });
  }

  // 1. Create a secure token containing the tenant metadata
  // We set it to expire in 7 days so links don't float around forever
  const token = jwt.sign(
    { tenantId: tenantId },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  // 2. Build the full absolute invitation URL
  const url = new URL(req.url);
  const inviteLink = `${url.protocol}//${url.host}/api/invite?token=${token}`;

  return NextResponse.json({ inviteLink });
}