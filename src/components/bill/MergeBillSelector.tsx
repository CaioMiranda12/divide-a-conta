'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBillList } from '@/hooks/useBillList';

const MIN_BILLS_TO_MERGE = 2;
const SELECTABLE_STATUSES = ['open', 'closed'] as const;

export function MergeBillSelector() {
  const router = useRouter();
  const { bills, isLoading } = useBillList();
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);

  const selectableBills = bills.filter((bill) => SELECTABLE_STATUSES.includes(bill.status as (typeof SELECTABLE_STATUSES)[number]));

  function toggleBill({ billId }: { billId: string }) {
    setSelectedBillIds((current) =>
      current.includes(billId) ? current.filter((id) => id !== billId) : [...current, billId],
    );
  }

  function goToCombinedSummary() {
    router.push(`/bills/merge/summary?billIds=${selectedBillIds.join(',')}`);
  }

  const canProceed = selectedBillIds.length >= MIN_BILLS_TO_MERGE;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link href="/" className="text-sm font-body text-secondary hover:text-primary">
        ← Minhas contas
      </Link>

      <h1 className="font-body text-2xl font-semibold tracking-tight text-primary mt-4 mb-1">Juntar contas</h1>
      <p className="font-body text-sm text-secondary mb-6">
        Escolha duas ou mais contas para ver um resumo combinado.
      </p>

      {isLoading && <p className="font-body text-sm text-secondary">Carregando...</p>}

      {!isLoading && selectableBills.length === 0 && (
        <p className="font-body text-sm text-secondary">
          Nenhuma conta aberta ou fechada disponível para combinar.
        </p>
      )}

      <div className="space-y-2">
        {selectableBills.map((bill) => {
          const isSelected = selectedBillIds.includes(bill.id);

          return (
            <button
              key={bill.id}
              onClick={() => toggleBill({ billId: bill.id })}
              className={`w-full flex items-center gap-3 border rounded-2xl px-4 py-3 text-left transition-colors ${
                isSelected ? 'border-mint bg-mint-dim' : 'border-subtle bg-panel hover:border-mint/30'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs shrink-0 ${
                  isSelected ? 'bg-mint border-mint text-on-accent' : 'border-subtle text-transparent'
                }`}
              >
                ✓
              </span>

              <span className="flex-1 min-w-0">
                <span className="font-body text-sm text-primary block truncate">
                  {bill.restaurantName ?? 'Conta sem nome'}
                </span>
                <span className="font-body text-xs text-secondary">
                  {new Date(bill.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={goToCombinedSummary}
        disabled={!canProceed}
        className="mt-6 w-full bg-mint hover:bg-mint-mid text-on-accent font-body font-semibold rounded-xl py-2.5 transition-colors disabled:opacity-60"
      >
        Ver resumo combinado{selectedBillIds.length > 0 ? ` (${selectedBillIds.length})` : ''}
      </button>
    </div>
  );
}