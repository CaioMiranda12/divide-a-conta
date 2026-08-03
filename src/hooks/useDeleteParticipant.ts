'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';

export function useDeleteParticipant({ billId }: { billId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteParticipant({ participantId }: { participantId: string }): Promise<boolean> {
    setIsDeleting(true);

    try {
      await apiFetch({ path: `/bill/${billId}/participant/${participantId}`, method: 'DELETE' });

      return true;
    } catch {
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return { deleteParticipant, isDeleting };
}