'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';
import type { ApiBillParticipant } from '@/types/api';

export function useCreateParticipant({ billId }: { billId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function createParticipant({ displayName }: { displayName: string }): Promise<ApiBillParticipant | null> {
    setIsSubmitting(true);
    setErrorCode(null);

    try {
      const { participant } = await apiFetch<{ participant: ApiBillParticipant }>({
        path: `/bill/${billId}/participant`,
        method: 'POST',
        body: { displayName },
      });

      return participant;
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : 'unknown_error');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { createParticipant, isSubmitting, errorCode };
}