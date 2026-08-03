'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';

export function useCreateBill() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function createBill({ image }: { image: File }): Promise<string | null> {
    setIsSubmitting(true);
    setErrorCode(null);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const { billId } = await apiFetch<{ billId: string }>({
        path: '/bill',
        method: 'POST',
        body: formData,
      });

      return billId;
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown_error';

      setErrorCode(code);

      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { createBill, isSubmitting, errorCode };
}