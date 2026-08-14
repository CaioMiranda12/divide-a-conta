'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';

export function useSaveBillSplit({ billId }: { billId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function saveBillSplit(payload: {
    participants: { displayName: string }[];
    claims: { billItemId: string; participantDisplayName: string; splitCount: number }[];
    payerDisplayName: string | null;
  }): Promise<boolean> {
    setIsSubmitting(true);
    setErrorCode(null);

    try {
      await apiFetch({ path: `/bill/${billId}/split`, method: 'POST', body: payload });

      return true;
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : 'unknown_error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { saveBillSplit, isSubmitting, errorCode };
}