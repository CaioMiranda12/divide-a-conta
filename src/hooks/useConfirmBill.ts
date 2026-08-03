'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';

export function useConfirmBill({ billId }: { billId: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function confirmBill(): Promise<boolean> {
    setIsConfirming(true);
    setErrorCode(null);

    try {
      await apiFetch({ path: `/bill/${billId}/confirm`, method: 'POST' });

      return true;
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown_error';

      setErrorCode(code);

      return false;
    } finally {
      setIsConfirming(false);
    }
  }

  return { confirmBill, isConfirming, errorCode };
}