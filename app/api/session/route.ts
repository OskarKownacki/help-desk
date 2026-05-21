import { auth0 } from "@/lib/auth0";
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);
  
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  console.log('Full session user:', JSON.stringify(session.user, null, 2));

  return NextResponse.json({ user: session.user });
}