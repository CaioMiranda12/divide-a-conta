'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';
import type { ApiBillSummary } from '@/types/api';

export function useBillSummary({ billId, isEnabled }: { billId: string; isEnabled: boolean }) {
  const [summary, setSummary] = useState<ApiBillSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const reloadSummary = useCallback(async () => {
    const data = await apiFetch<ApiBillSummary>({ path: `/bill/${billId}/summary` });

    setSummary(data);
  }, [billId]);

  useEffect(() => {
    if (!isEnabled) return;

    setIsLoading(true);
    reloadSummary().finally(() => setIsLoading(false));
  }, [isEnabled, reloadSummary]);

  return { summary, isLoading, reloadSummary };
}