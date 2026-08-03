'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';
import type { ApiBillDetail, ApiBillItem } from '@/types/api';

export function useBillDetail({ billId }: { billId: string }) {
  const [bill, setBill] = useState<ApiBillDetail | null>(null);
  const [items, setItems] = useState<ApiBillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reloadBill = useCallback(async () => {
    const data = await apiFetch<{ bill: ApiBillDetail; items: ApiBillItem[] }>({
      path: `/bill/${billId}`,
    });

    setBill(data.bill);
    setItems(data.items);
  }, [billId]);

  useEffect(() => {
    reloadBill().finally(() => setIsLoading(false));
  }, [reloadBill]);

  return { bill, items, isLoading, reloadBill };
}