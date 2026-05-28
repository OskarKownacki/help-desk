import { useEffect, useState } from 'react';

interface User {
  name?: string;
  email?: string;
  picture?: string;
  sub?: string;
  // Explicitly typing this keeps your autocomplete clean in components!
  'https://helpdesk.com/roles'?: string[]; 
  [key: string]: unknown;
}

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/session')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => setUser(data?.user ?? null))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}