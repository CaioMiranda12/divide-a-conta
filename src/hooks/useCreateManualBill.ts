'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';

export function useCreateManualBill() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createManualBill(): Promise<string | null> {
    setIsSubmitting(true);

    try {
      const { billId } = await apiFetch<{ billId: string }>({ path: '/bill/manual', method: 'POST' });

      return billId;
    } catch {
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { createManualBill, isSubmitting };
}