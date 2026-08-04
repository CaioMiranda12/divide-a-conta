'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';

export function useSetBillPayer({ billId }: { billId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function setBillPayer({ participantId }: { participantId: string | null }): Promise<boolean> {
    setIsSubmitting(true);

    try {
      await apiFetch({ path: `/bill/${billId}/payer`, method: 'PATCH', body: { participantId } });

      return true;
    } catch {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { setBillPayer, isSubmitting };
}