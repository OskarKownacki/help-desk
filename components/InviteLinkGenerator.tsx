// components/InviteLinkGenerator.tsx
'use client';

import { useState } from 'react';

export default function InviteLinkGenerator() {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch('/api/company/invite-link');
      const data = await res.json();
      if (data.inviteLink) {
        setLink(data.inviteLink);
      }
    } catch (err) {
      console.error('Failed to generate invite link', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset feedback message after 2s
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm max-w-xl">
      <h3 className="text-lg font-semibold text-gray-900">Invite Team Members</h3>
      <p className="text-sm text-gray-500 mt-1">
        Generate a secure sign-up link to automatically add employees directly to your company workspace.
      </p>

      {!link ? (
        <button
          onClick={generateLink}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Create Invite Link'}
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={link}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-600 font-mono outline-none focus:border-blue-500"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 font-medium text-sm rounded-lg text-white transition-colors ${
                copied ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded border border-amber-100">
            ⚠️ This link contains a secure cryptographic signature. It will expire in 7 days.
          </p>
        </div>
      )}
    </div>
  );
}