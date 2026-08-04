'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout(): Promise<boolean> {
    setIsLoggingOut(true);

    try {
      await apiFetch({ path: '/auth/logout', method: 'POST' });

      return true;
    } catch {
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }

  return { logout, isLoggingOut };
}