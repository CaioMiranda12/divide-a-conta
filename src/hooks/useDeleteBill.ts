'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/apiClient';

export function useDeleteBill() {
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteBill({ billId }: { billId: string }): Promise<boolean> {
    setIsDeleting(true);

    try {
      await apiFetch({ path: `/bill/${billId}`, method: 'DELETE' });

      return true;
    } catch {
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return { deleteBill, isDeleting };
}