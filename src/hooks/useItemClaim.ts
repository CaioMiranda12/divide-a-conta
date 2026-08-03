'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';

export function useItemClaim({ billId }: { billId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function claimItem({
    billItemId,
    participantId,
    splitCount,
  }: {
    billItemId: string;
    participantId: string;
    splitCount: number;
  }): Promise<boolean> {
    setIsSubmitting(true);
    setErrorCode(null);

    try {
      await apiFetch({ path: `/bill/${billId}/claim`, method: 'POST', body: { billItemId, participantId, splitCount } });

      return true;
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : 'unknown_error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function unclaimItem({ billItemId, participantId }: { billItemId: string; participantId: string }): Promise<boolean> {
    setIsSubmitting(true);
    setErrorCode(null);

    try {
      await apiFetch({ path: `/bill/${billId}/claim`, method: 'DELETE', body: { billItemId, participantId } });

      return true;
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : 'unknown_error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { claimItem, unclaimItem, isSubmitting, errorCode };
}