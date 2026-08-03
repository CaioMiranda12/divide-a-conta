'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ApiBillDetail, ApiBillItem, ApiBillParticipant } from '@/types/api';
import type { EditableBillItem } from '@/types/billEditor';
import { useUpdateBillItems } from '@/hooks/useUpdateBillItems';
import { useConfirmBill } from '@/hooks/useConfirmBill';
import { BillItemRow } from '@/components/bill/BillItemRow';
import { DinerSplitEditor } from '@/components/bill/DinerSplitEditor';
import { MoneyInput } from '@/components/form/MoneyInput';
import { generateTempId } from '@/utils/generateTempId';

type EditorStep = 'items' | 'split';

export function OwnerBillEditor({
  bill,
  items,
  participants,
  onBillChanged,
}: {
  bill: ApiBillDetail;
  items: ApiBillItem[];
  participants: ApiBillParticipant[];
  onBillChanged: () => void;
}) {
  const [step, setStep] = useState<EditorStep>(bill.status === 'open' ? 'split' : 'items');
  const [restaurantName, setRestaurantName] = useState(bill.restaurantName ?? '');
  const [totalAmountInCents, setTotalAmountInCents] = useState(bill.totalAmountInCents);
  const [serviceFeePercent, setServiceFeePercent] = useState(bill.serviceFeePercent);
  const [editableItems, setEditableItems] = useState<EditableBillItem[]>(items);

  const { updateBillItems, isSubmitting } = useUpdateBillItems({ billId: bill.id });
  const { confirmBill, isConfirming } = useConfirmBill({ billId: bill.id });

  const isDraft = bill.status === 'draft';

  async function persistChanges({ nextItems }: { nextItems: EditableBillItem[] }) {
    await updateBillItems({
      restaurantName: restaurantName || null,
      totalAmountInCents,
      serviceFeePercent,
      items: nextItems.map((item) => ({
        description: item.description,
        priceInCents: item.priceInCents,
        quantity: item.quantity,
      })),
    });

    onBillChanged();
  }

  function updateItemField({
    itemId,
    field,
    value,
  }: {
    itemId: string;
    field: 'description' | 'priceInCents' | 'quantity';
    value: string | number;
  }) {
    setEditableItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    );
  }

  function handleItemBlur() {
    persistChanges({ nextItems: editableItems });
  }

  function addItem() {
    setEditableItems((currentItems) => [
      ...currentItems,
      { id: generateTempId(), description: '', priceInCents: 0, quantity: 1 },
    ]);
  }

  function removeItem({ itemId }: { itemId: string }) {
    const nextItems = editableItems.filter((item) => item.id !== itemId);

    setEditableItems(nextItems);
    persistChanges({ nextItems });
  }

  function handleHeaderFieldBlur() {
    persistChanges({ nextItems: editableItems });
  }

  async function goToSplitStep() {
    const shouldConfirmFirst = isDraft;

    if (shouldConfirmFirst) {
      const hasSucceeded = await confirmBill();

      if (!hasSucceeded) return;

      onBillChanged();
    }

    setStep('split');
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-sm font-body text-ink-muted hover:text-ink">
          ← Minhas contas
        </Link>

        {step === 'split' && (
          <button onClick={() => setStep('items')} className="text-sm font-body text-ink-muted hover:text-ink">
            Editar itens
          </button>
        )}
      </div>

      {step === 'items' ? (
        <>
          <input
            value={restaurantName}
            onChange={(event) => setRestaurantName(event.target.value)}
            onBlur={handleHeaderFieldBlur}
            placeholder="Nome do restaurante"
            className="w-full bg-transparent font-display text-2xl tracking-wide focus:outline-none placeholder:text-ink-muted"
          />

          <div className="mt-6">
            {editableItems.map((item) => (
              <BillItemRow
                key={item.id}
                item={item}
                isEditable
                onFieldChange={(field, value) => updateItemField({ itemId: item.id, field, value })}
                onBlur={handleItemBlur}
                onRemove={() => removeItem({ itemId: item.id })}
              />
            ))}
          </div>

          <button onClick={addItem} className="mt-3 text-sm font-body text-confirmed hover:text-stamp">
            + adicionar item
          </button>

          <label className="mt-6 flex items-center justify-between font-body text-sm">
            Taxa de serviço (%)
            <input
              type="number"
              value={serviceFeePercent}
              onChange={(event) => setServiceFeePercent(Number(event.target.value))}
              onBlur={handleHeaderFieldBlur}
              className="w-16 bg-transparent font-money text-right tabular-nums focus:outline-none border-b border-paper-line"
            />
          </label>

          <label className="mt-3 flex items-center justify-between font-body text-sm">
            Total da conta
            <MoneyInput
              valueInCents={totalAmountInCents}
              onChangeInCents={setTotalAmountInCents}
              onBlur={handleHeaderFieldBlur}
              className="w-24 bg-transparent font-money text-right tabular-nums focus:outline-none border-b border-paper-line"
            />
          </label>

          {isSubmitting && <span className="block mt-2 text-xs font-body text-ink-muted">Salvando...</span>}

          <button
            onClick={goToSplitStep}
            disabled={isConfirming || editableItems.length === 0}
            className="mt-8 w-full bg-stamp hover:bg-stamp-dark text-paper font-body font-medium py-2.5 transition-colors disabled:opacity-60"
          >
            {isConfirming ? 'Abrindo...' : 'Dividir a conta →'}
          </button>
        </>
      ) : (
        <DinerSplitEditor billId={bill.id} items={items} participants={participants} onChanged={onBillChanged} />
      )}
    </div>
  );
}