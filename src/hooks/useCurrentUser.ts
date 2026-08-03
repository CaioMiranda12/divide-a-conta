'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';
import type { ApiUser } from '@/types/api';

export function useCurrentUser() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadUser = useCallback(async () => {
    const { user: fetchedUser } = await apiFetch<{ user: ApiUser | null }>({ path: '/auth/me' });

    setUser(fetchedUser);
  }, []);

  useEffect(() => {
    reloadUser().finally(() => setIsLoading(false));
  }, [reloadUser]);

  return { user, isLoading, reloadUser };
}