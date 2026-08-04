'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ApiBillListItem } from '@/types/api';
import { useDeleteBill } from '@/hooks/useDeleteBill';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const STATUS_COLOR_CLASS_NAME: Record<ApiBillListItem['status'], string> = {
  processing: 'text-pending',
  draft: 'text-pending',
  open: 'text-confirmed',
  closed: 'text-ink-muted',
  failed: 'text-stamp',
};

const STATUS_LABELS: Record<ApiBillListItem['status'], string> = {
  processing: 'Processando',
  draft: 'Rascunho',
  open: 'Aberta',
  closed: 'Encerrada',
  failed: 'Falhou',
};

export function BillListItemCard({
  bill,
  onDeleted,
}: {
  bill: ApiBillListItem;
  onDeleted: () => void;
}) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const { deleteBill, isDeleting } = useDeleteBill();

  async function handleConfirmDelete() {
    const hasSucceeded = await deleteBill({ billId: bill.id });

    setIsConfirmDialogOpen(false);

    if (hasSucceeded) onDeleted();
  }

  return (
    <div className="flex items-center justify-between border-b border-dashed border-paper-line py-3">
      <Link href={`/bill/${bill.id}`} className="flex-1 min-w-0 hover:opacity-70 transition-opacity">
        <span className="font-body text-sm block truncate">{bill.restaurantName ?? 'Conta sem nome'}</span>
        <span className={`font-money text-xs ${STATUS_COLOR_CLASS_NAME[bill.status]}`}>
          {STATUS_LABELS[bill.status]}
        </span>
      </Link>

      <button
        onClick={() => setIsConfirmDialogOpen(true)}
        className="ml-3 shrink-0 text-sm font-body text-ink-muted hover:text-stamp"
        aria-label={`Excluir conta ${bill.restaurantName ?? 'sem nome'}`}
      >
        excluir
      </button>

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        title="Excluir conta"
        description={`Tem certeza que quer excluir "${bill.restaurantName ?? 'essa conta'}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        confirmingLabel="Excluindo..."
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
}