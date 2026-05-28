// lib/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { ManagementClient } from 'auth0';
import { cookies } from 'next/headers';

type Auth0Metadata = {
  tenantId?: string;
  role?: string | string[];
};

type Auth0Profile = {
  app_metadata?: Auth0Metadata;
  user_metadata?: Auth0Metadata;
};

// Verify critical environments are securely present
if (!process.env.AUTH0_SECRET || !process.env.AUTH0_ISSUER_BASE_URL) {
  throw new Error("Missing critical Auth0 environment parameters in .env.local");
}

function createManagementClient() {
  const domainString =
    process.env.AUTH0_DOMAIN ||
    process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '');

  if (!domainString) {
    throw new Error('Unable to resolve Auth0 domain: AUTH0_DOMAIN and AUTH0_ISSUER_BASE_URL are both missing.');
  }

  return new ManagementClient({
    domain: domainString,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  });
}

function normalizeRoles(role?: string | string[]): string[] {
  if (Array.isArray(role)) {
    return role;
  }

  if (typeof role === 'string' && role) {
    return [role];
  }

  return [];
}

export async function getAuth0ProfileClaims(userId: string): Promise<{
  tenantId?: string;
  roles: string[];
}> {
  const management = createManagementClient();
  const { data: auth0User } = await management.users.get(userId, {
    fields: 'app_metadata,user_metadata',
    include_fields: true,
  });
  const profile = auth0User as Auth0Profile | undefined;
  const metadata = profile?.app_metadata ?? profile?.user_metadata;

  return {
    tenantId: metadata?.tenantId,
    roles: normalizeRoles(metadata?.role),
  };
}

export const auth0 = new Auth0Client({
  // Note: Standard option initializers go here. The 'login' key was removed
  // because it is not a valid parameter property for modern Auth0ClientOptions.

  async beforeSessionSaved(session, tokenSet) {
    const cookieStore = await cookies();

    // Check if the user accepted an invitation (with secure optional chaining fallbacks)
    const inviteTenant = cookieStore.get('invite_tenant')?.value || (session?.user?.org_id as string | undefined);

    const roleKey = 'https://helpdesk.com/roles';
    const tenantKey = 'https://helpdesk.com/tenantId';
    const rawIdToken = tokenSet ?? undefined;

    const applyAppMetadataToSession = async () => {
      const userId = session?.user?.sub;

      if (!userId || typeof userId !== 'string') {
        return;
      }

      try {
        const claims = await getAuth0ProfileClaims(userId);

        if (!session.user[tenantKey] && claims.tenantId) {
          session.user[tenantKey] = claims.tenantId;
        }

        if (!session.user[roleKey]) {
          session.user[roleKey] = claims.roles;
        }
      } catch (error) {
        console.error('Auth0 metadata sync failed:', error);
      }
    };

    // A. Manually map tokens for regular logins
    if (rawIdToken) {
      try {
        const payloadBase64 = rawIdToken.split('.')[1];
        // FIX 1: Use 'base64url' instead of 'base64' — JWT payloads are base64url-encoded
        // and contain '-' / '_' characters that standard base64 mishandles silently.
        const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));

        if (decodedPayload[roleKey]) session.user[roleKey] = decodedPayload[roleKey];
        if (decodedPayload[tenantKey]) session.user[tenantKey] = decodedPayload[tenantKey];
      } catch (e) {
        console.error('Error parsing claims:', e);
      }
    }

    // B. Fill any missing claims from Auth0 metadata so the session stays authoritative.
    if (session?.user) {
      await applyAppMetadataToSession();
    }

    // C. Handle fresh reflink sign-ups / incoming invite acceptances
    if (inviteTenant && session?.user) {
      try {
        const management = createManagementClient();

        const inviteUserId = session.user.sub;

        if (inviteUserId && typeof inviteUserId === 'string') {
          // Sync database profile data via the Management Client
          await management.users.update(inviteUserId, {
            app_metadata: { tenantId: inviteTenant, roles: ['Employee'] }
          });

          // Instantly hot-reload the running properties inside the browser session cookie
          session.user[tenantKey] = inviteTenant;
          session.user[roleKey] = ['Employee'];

          // FIX 3: Do NOT call cookieStore.delete() inside beforeSessionSaved.
          // The Next.js cookies() store is read-only in this server-side callback context;
          // calling .delete() throws a runtime error. Instead, expire the cookie by
          // setting it with maxAge=0, which instructs the browser to delete it immediately.
          cookieStore.set('invite_tenant', '', { maxAge: 0, path: '/' });
        }
      } catch (error) {
        console.error('Management API Sync Error during invitation validation:', error);
      }
    }

    return session;
  }
});