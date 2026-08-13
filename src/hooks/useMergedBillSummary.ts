'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api/apiClient';
import type { ApiMergedBillSummary } from '@/types/api';

export function useMergedBillSummary({ billIds }: { billIds: string[] }) {
  const [summary, setSummary] = useState<ApiMergedBillSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const reloadSummary = useCallback(async () => {
    try {
      const data = await apiFetch<ApiMergedBillSummary>({
        path: `/bill/merge-summary?billIds=${billIds.join(',')}`,
      });

      setSummary(data);
      setErrorCode(null);
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : 'unknown_error');
    }
  }, [billIds]);

  useEffect(() => {
    setIsLoading(true);
    reloadSummary().finally(() => setIsLoading(false));
  }, [reloadSummary]);

  return { summary, isLoading, errorCode };
}