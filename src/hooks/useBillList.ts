'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';
import type { ApiBillListItem } from '@/types/api';

export function useBillList() {
  const [bills, setBills] = useState<ApiBillListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reloadBills = useCallback(async () => {
    const { bills: fetchedBills } = await apiFetch<{ bills: ApiBillListItem[] }>({ path: '/bill' });

    setBills(fetchedBills);
  }, []);

  useEffect(() => {
    reloadBills().finally(() => setIsLoading(false));
  }, [reloadBills]);

  return { bills, isLoading, reloadBills };
}