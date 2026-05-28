// app/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Automatically convert "Acme Corp" to a clean slug "acme-corp"
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-');        // Replace spaces with hyphens

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/company/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create workspace.');
      }

      // Success! Redirect them straight to their new workspace dashboard
      router.push('/admin/dashboard');
      router.refresh(); // Forces Next.js to reload the server session state
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create your workspace
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome! Set up an organization workspace to start managing your tickets.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="company-name" className="text-sm font-medium text-gray-700 block">
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              required
              disabled={isSubmitting}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:bg-gray-100"
            />
          </div>

          {companyName.trim() && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
              Your system identifier will be: <span className="font-mono font-bold text-gray-900">{slug}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !companyName.trim()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Configuring workspace...' : 'Launch Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}