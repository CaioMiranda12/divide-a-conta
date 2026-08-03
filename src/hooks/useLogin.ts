'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';
import type { ApiUser } from '@/types/api';

export function useLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function login({ email, password }: { email: string; password: string }): Promise<ApiUser | null> {
    setIsSubmitting(true);
    setErrorCode(null);

    try {
      const { user } = await apiFetch<{ user: ApiUser }>({
        path: '/auth/login',
        method: 'POST',
        body: { email, password },
      });

      return user;
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown_error';

      setErrorCode(code);

      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { login, isSubmitting, errorCode };
}