'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';

export function useCloseBill({ billId }: { billId: string }) {
  const [isClosing, setIsClosing] = useState(false);

  async function closeBill(): Promise<boolean> {
    setIsClosing(true);

    try {
      await apiFetch({ path: `/bill/${billId}/close`, method: 'POST' });

      return true;
    } catch {
      return false;
    } finally {
      setIsClosing(false);
    }
  }

  return { closeBill, isClosing };
}