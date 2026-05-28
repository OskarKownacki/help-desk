// app/api/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');

  // 1. Redirect to a generic error page if no token exists
  if (!token) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  try {
    // 2. Decode the Base64 JWT token payload
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
    
    const companyTenantId = decoded.tenantId;

    if (companyTenantId) {
      const cookieStore = await cookies();
      
      // 3. SECURELY SET COOKIE: Allowed here because this is a Route Handler!
      cookieStore.set('invite_tenant', companyTenantId, { 
        path: '/', 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15 // 15 minutes
      });

      // 4. Redirect them to the login sequence
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (e) {
    console.error("Failed to parse local invite token in handler:", e);
  }

  // Fallback redirect if token parsing failed
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}