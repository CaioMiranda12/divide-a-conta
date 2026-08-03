'use client';

import { useBillDetail } from '@/hooks/useBillDetail';
import { useJoinBill } from '@/hooks/useJoinBill';
import { useEffect, useState } from 'react';
import { OwnerBillEditor } from '@/components/bill/OwnerBillEditor';
import { ParticipantBillView } from '@/components/bill/ParticipantBillView';
import { WaitingForOwnerView } from '@/components/bill/WaitingForOwnerView';

export function BillPageContent({ billId }: { billId: string }) {
  const { bill, items, isLoading, reloadBill } = useBillDetail({ billId });
  const { joinBill, errorCode: joinErrorCode } = useJoinBill();
  const [hasTriedToJoin, setHasTriedToJoin] = useState(false);

  useEffect(() => {
    const shouldTryToJoin = bill && !bill.isOwner && bill.status === 'open' && !hasTriedToJoin;

    if (!shouldTryToJoin) return;

    setHasTriedToJoin(true);
    joinBill({ billId }).then((hasSucceeded) => {
      if (hasSucceeded) reloadBill();
    });
  }, [bill, hasTriedToJoin, billId, joinBill, reloadBill]);

  if (isLoading || !bill) return <p>Carregando...</p>;

  if (bill.isOwner) {
    return <OwnerBillEditor bill={bill} items={items} onBillChanged={reloadBill} />;
  }

  const isBillOpen = bill.status === 'open';

  if (!isBillOpen) return <WaitingForOwnerView status={bill.status} />;

  const hasFailedToJoin = Boolean(joinErrorCode) && joinErrorCode !== 'bill_not_open';

  if (hasFailedToJoin) return <p>Não foi possível entrar nessa conta.</p>;

  return <ParticipantBillView billId={billId} items={items} />;
}