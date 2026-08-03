'use client';

import { useBillDetail } from '@/hooks/useBillDetail';
import { OwnerBillEditor } from '@/components/bill/OwnerBillEditor';
import { BillProcessingState } from '@/components/bill/BillProcessingState';

export function BillPageContent({ billId }: { billId: string }) {
  const { bill, items, participants, isLoading, errorCode, reloadBill } = useBillDetail({ billId });

  if (isLoading) {
    return <p className="max-w-md mx-auto px-4 py-16 text-center font-body text-ink-muted">Carregando...</p>;
  }

  if (errorCode === 'forbidden') {
    return <p className="max-w-md mx-auto px-4 py-16 text-center font-body text-stamp">Você não tem acesso a essa conta.</p>;
  }

  if (!bill) {
    return <p className="max-w-md mx-auto px-4 py-16 text-center font-body text-stamp">Conta não encontrada.</p>;
  }

  const isProcessingOrFailed = bill.status === 'processing' || bill.status === 'failed';

  if (isProcessingOrFailed) return <BillProcessingState status={bill.status} />;

  return <OwnerBillEditor bill={bill} items={items} participants={participants} onBillChanged={reloadBill} />;
}