'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';

export function useItemClaim({ billId }: { billId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function claimItem({
    billItemId,
    splitCount,
  }: {
    billItemId: string;
    splitCount: number;
  }): Promise<boolean> {
    setIsSubmitting(true);
    setErrorCode(null);

    try {
      await apiFetch({
        path: `/bill/${billId}/claim`,
        method: 'POST',
        body: { billItemId, splitCount },
      });

      return true;
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown_error';

      setErrorCode(code);

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function unclaimItem({ billItemId }: { billItemId: string }): Promise<boolean> {
    setIsSubmitting(true);
    setErrorCode(null);

    try {
      await apiFetch({
        path: `/bill/${billId}/claim`,
        method: 'DELETE',
        body: { billItemId },
      });

      return true;
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown_error';

      setErrorCode(code);

      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { claimItem, unclaimItem, isSubmitting, errorCode };
}