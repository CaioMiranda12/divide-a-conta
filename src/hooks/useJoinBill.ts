'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';

export function useJoinBill() {
  const [isJoining, setIsJoining] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function joinBill({ billId }: { billId: string }): Promise<boolean> {
    setIsJoining(true);
    setErrorCode(null);

    try {
      await apiFetch({ path: `/bill/${billId}/participant`, method: 'POST' });

      return true;
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown_error';

      setErrorCode(code);

      return false;
    } finally {
      setIsJoining(false);
    }
  }

  return { joinBill, isJoining, errorCode };
}