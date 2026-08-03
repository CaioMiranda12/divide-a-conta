'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';
import type { ApiBillItem } from '@/types/api';

type BillItemInput = { description: string; priceInCents: number; quantity: number };

export function useUpdateBillItems({ billId }: { billId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function updateBillItems({
    restaurantName,
    totalAmountInCents,
    serviceFeePercent,
    items,
  }: {
    restaurantName: string | null;
    totalAmountInCents: number;
    serviceFeePercent: number;
    items: BillItemInput[];
  }): Promise<ApiBillItem[] | null> {
    setIsSubmitting(true);
    setErrorCode(null);

    try {
      const data = await apiFetch<{ items: ApiBillItem[] }>({
        path: `/bill/${billId}/items`,
        method: 'PATCH',
        body: { restaurantName, totalAmountInCents, serviceFeePercent, items },
      });

      return data.items;
    } catch (error) {
      const code = error instanceof ApiError ? error.code : 'unknown_error';

      setErrorCode(code);

      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { updateBillItems, isSubmitting, errorCode };
}