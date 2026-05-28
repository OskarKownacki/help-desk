// app/unauthorized/page.tsx
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Access Denied</h1>
      <p>Your account does not have permission to view the Admin console.</p>
      <Link href="/onboarding" style={{ color: 'blue', textDecoration: 'underline' }}>
        Return to Safety
      </Link>
    </div>
  );
}