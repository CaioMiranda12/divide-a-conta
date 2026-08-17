'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';

export function useSetParticipantPaidStatus({ billId }: { billId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function setParticipantPaidStatus({
    participantId,
    hasPaid,
  }: {
    participantId: string;
    hasPaid: boolean;
  }): Promise<boolean> {
    setIsSubmitting(true);

    try {
      await apiFetch({
        path: `/bill/${billId}/participant/${participantId}/paid`,
        method: 'PATCH',
        body: { hasPaid },
      });

      return true;
    } catch {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { setParticipantPaidStatus, isSubmitting };
}