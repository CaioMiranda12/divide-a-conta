'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';
import type { ApiBillDetail, ApiBillItem, ApiBillParticipant } from '@/types/api';

export function useBillDetail({ billId }: { billId: string }) {
  const [bill, setBill] = useState<ApiBillDetail | null>(null);
  const [items, setItems] = useState<ApiBillItem[]>([]);
  const [participants, setParticipants] = useState<ApiBillParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const reloadBill = useCallback(async () => {
    try {
      const data = await apiFetch<{ bill: ApiBillDetail; items: ApiBillItem[]; participants: ApiBillParticipant[] }>({
        path: `/bill/${billId}`,
      });

      setBill(data.bill);
      setItems(data.items);
      setParticipants(data.participants);
      setErrorCode(null);
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : 'unknown_error');
    }
  }, [billId]);

  useEffect(() => {
    reloadBill().finally(() => setIsLoading(false));
  }, [reloadBill]);

  return { bill, items, participants, isLoading, errorCode, reloadBill };
}