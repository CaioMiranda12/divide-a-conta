'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ApiBillListItem } from '@/types/api';
import { useDeleteBill } from '@/hooks/useDeleteBill';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const STATUS_LABELS: Record<ApiBillListItem['status'], string> = {
  processing: 'Processando',
  draft: 'Rascunho',
  open: 'Aberta',
  closed: 'Fechada',
  failed: 'Falhou',
};

const STATUS_TAG_CLASS_NAME: Record<ApiBillListItem['status'], string> = {
  processing: 'text-secondary border-subtle',
  draft: 'text-secondary border-subtle',
  open: 'text-mint border-mint/40',
  closed: 'text-secondary border-subtle',
  failed: 'text-negative border-negative/40',
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
    <div className="flex items-center gap-3 bg-panel border border-subtle rounded-2xl px-4 py-3">
      <span className="w-8 h-8 rounded-full border border-mint/40 flex items-center justify-center text-mint font-body text-xs shrink-0">
        {(bill.restaurantName ?? '?').charAt(0).toUpperCase()}
      </span>

      <Link href={`/bill/${bill.id}`} className="flex-1 min-w-0">
        <span className="font-body text-sm text-primary block truncate">
          {bill.restaurantName ?? 'Conta sem nome'}
        </span>
        <span className="font-body text-xs text-secondary">
          {new Date(bill.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </Link>

      <span className={`text-xs font-body px-2 py-0.5 rounded-full border shrink-0 ${STATUS_TAG_CLASS_NAME[bill.status]}`}>
        {STATUS_LABELS[bill.status]}
      </span>

      <button
        onClick={() => setIsConfirmDialogOpen(true)}
        className="shrink-0 text-xs font-body text-secondary hover:text-negative"
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
        tone="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmDialogOpen(false)}
      />
    </div>
  );
}