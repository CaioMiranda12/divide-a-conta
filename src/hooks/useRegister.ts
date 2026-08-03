'use client';

import { useRef, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';
import type { ApiUser } from '@/types/api';
import type { RegisterFormValues } from '@/schemas/auth';

export function useRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const isRequestInFlightRef = useRef(false);

  async function register(values: RegisterFormValues): Promise<ApiUser | null> {
    if (isRequestInFlightRef.current) return null;

    isRequestInFlightRef.current = true;
    setIsSubmitting(true);
    setErrorCode(null);
    setFieldErrors({});

    try {
      const { user } = await apiFetch<{ user: ApiUser }>({
        path: '/auth/register',
        method: 'POST',
        body: values,
      });

      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorCode(error.code);
        setFieldErrors(error.fieldErrors ?? {});
      } else {
        setErrorCode('unknown_error');
      }

      return null;
    } finally {
      isRequestInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  return { register, isSubmitting, errorCode, fieldErrors };
}