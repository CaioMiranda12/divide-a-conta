'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';
import type { ApiBillSummary } from '@/types/api';

export function useBillSummary({
  billId,
  isEnabled,
  refreshKey = 0,
}: {
  billId: string;
  isEnabled: boolean;
  refreshKey?: number;
}) {
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
  }, [isEnabled, reloadSummary, refreshKey]);

  return { summary, isLoading, reloadSummary };
}